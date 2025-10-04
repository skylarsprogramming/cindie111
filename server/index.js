import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';

dotenv.config();

if (!admin.apps.length) {
  try {
    // Try to use the service account file in the root directory
    const keyPath = './cindie-ai-firebase-adminsdk-fbsvc-0d1e7b197a.json';
    if (fs.existsSync(keyPath)) {
      const serviceAccountJson = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      // Fallback to environment variable or default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('Firebase Admin initialized with default credentials');
    }
  } catch (e) {
    console.error('Firebase Admin failed to initialize:', e.message);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: 'Missing Authorization Bearer token' });
  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', details: err?.message });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/protected', verifyFirebaseToken, async (req, res) => {
  // Enforce verified email for email/password accounts
  if (req.user.firebase?.sign_in_provider === 'password' && !req.user.email_verified) {
    return res.status(403).json({ error: 'Email not verified' });
  }
  res.json({
    message: 'Protected data',
    uid: req.user.uid,
    email: req.user.email || null,
    phone_number: req.user.phone_number || null,
    email_verified: !!req.user.email_verified,
    provider: req.user.firebase?.sign_in_provider || null,
  });
});

// --- User profile storage (Firestore) ---
let db = null;
try { db = admin.firestore(); } catch (_) { db = null; }

function defaultProfile(uid, email) {
  return {
    uid,
    email: email || null,
    placementCompleted: false,
    recommendations: [],
    progress: {
      keepLearning: { course: '', progress: 0 },
      subjects: [ { name: 'IELTS preparation', xp: 0 }, { name: 'English B2', xp: 0 } ],
      weeklyTarget: { targetDays: 3, completedDays: 0, days: { monday:false, tuesday:false, wednesday:false, thursday:false, friday:false, saturday:false, sunday:false } }
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

app.post('/api/profile/init', verifyFirebaseToken, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firestore not available' });
  const uid = req.user.uid;
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set(defaultProfile(uid, req.user.email));
  }
  const doc = await ref.get();
  res.json(doc.data());
});

app.get('/api/profile', verifyFirebaseToken, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firestore not available' });
  const uid = req.user.uid;
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    const profile = defaultProfile(uid, req.user.email);
    await ref.set(profile);
    return res.json(profile);
  }
  res.json(snap.data());
});

app.post('/api/placement/complete', verifyFirebaseToken, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firestore not available' });
  const uid = req.user.uid;
  const { result, recommendations } = req.body || {};
  const ref = db.collection('users').doc(uid);
  await ref.set({
    placementCompleted: true,
    recommendations: Array.isArray(recommendations) ? recommendations : [],
    placementResult: result || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  const doc = await ref.get();
  res.json(doc.data());
});

app.post('/api/progress', verifyFirebaseToken, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firestore not available' });
  const uid = req.user.uid;
  const { keepLearning, subjects, weeklyTarget } = req.body || {};
  const ref = db.collection('users').doc(uid);
  const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if (keepLearning) updates['progress.keepLearning'] = keepLearning;
  if (subjects) updates['progress.subjects'] = subjects;
  if (weeklyTarget) updates['progress.weeklyTarget'] = weeklyTarget;
  await ref.set(updates, { merge: true });
  const doc = await ref.get();
  res.json(doc.data());
});

// --- Course generation and progress ---
function deriveLevelFromPlacement(placementResult) {
  try {
    const scores = placementResult?.sectionScores || {};
    const total = (scores.grammar||0) + (scores.reading||0) + (scores.listening||0);
    if (total >= 12) return 'B2';
    if (total >= 8) return 'B1';
    if (total >= 4) return 'A2';
    return 'A1';
  } catch (_) { return 'A1'; }
}

function deriveFocusAreas(placementResult) {
  try {
    const scores = placementResult?.sectionScores || {};
    const attempts = placementResult?.sectionMax || {};
    const entries = ['grammar','reading','listening'].map(k => {
      const acc = (attempts[k]||0) ? (scores[k]||0)/(attempts[k]||0) : 0;
      return { area: k, acc };
    }).sort((a,b) => a.acc - b.acc);
    return entries.map(e => e.area);
  } catch (_) { return ['grammar','reading','listening']; }
}

function generateCourseFromPlacement(placementResult) {
  const level = deriveLevelFromPlacement(placementResult);
  const focus = deriveFocusAreas(placementResult);
  const modules = [];
  const areas = focus.slice(0, 3);
  let modCounter = 1;
  for (const area of areas) {
    for (let i = 0; i < 2; i++) {
      const modId = `${area}-${modCounter}`;
      modCounter++;
      const lessons = [
        { id: `${modId}-l1`, type: area === 'reading' ? 'reading' : area === 'listening' ? 'dictation' : 'fill_blank', title: 'Core practice' },
        { id: `${modId}-l2`, type: 'quiz', title: 'Concept check quiz' },
        { id: `${modId}-l3`, type: area === 'listening' ? 'listening_quiz' : 'speaking', title: 'Applied practice' },
      ];
      modules.push({ id: modId, area, title: `${area[0].toUpperCase()}${area.slice(1)} Module ${i+1}`, topic: `${level} essentials`, lessons });
    }
  }
  return { level, focus, modules };
}

function computeOverallPercent(plan, progress) {
  const total = (plan?.modules||[]).reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const done = Object.values(progress?.lessons||{}).filter(l => l.completed).length;
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

app.post('/api/course/generate', verifyFirebaseToken, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firestore not available' });
  const uid = req.user.uid;
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  const placement = req.body?.placementResult || snap.data()?.placementResult || null;
  if (!placement) return res.status(400).json({ error: 'Missing placementResult' });
  const plan = generateCourseFromPlacement(placement);
  const course = {
    plan,
    progress: { lessons: {}, modules: {}, timeSpentMs: 0, overallPercent: 0, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await ref.set({ course, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  const doc = await ref.get();
  res.json(doc.data().course);
});

app.get('/api/course', verifyFirebaseToken, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firestore not available' });
  const uid = req.user.uid;
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  const data = snap.data() || {};
  res.json(data.course || null);
});

app.post('/api/course/progress/update', verifyFirebaseToken, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Firestore not available' });
  const uid = req.user.uid;
  const { moduleId, lessonId, completed, quizScore, timeSpentMs } = req.body || {};
  if (!moduleId || !lessonId) return res.status(400).json({ error: 'moduleId and lessonId are required' });
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  const data = snap.data() || {};
  const course = data.course || {};
  const plan = course.plan || {};
  const progress = course.progress || { lessons: {}, modules: {}, timeSpentMs: 0, overallPercent: 0 };
  const lesson = progress.lessons?.[lessonId] || {};
  const newLesson = {
    moduleId,
    completed: completed === true ? true : !!lesson.completed,
    quizScores: Array.isArray(lesson.quizScores) ? lesson.quizScores.slice(0) : [],
    timeSpentMs: Number(lesson.timeSpentMs || 0) + Number(timeSpentMs || 0),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (typeof quizScore === 'number') newLesson.quizScores.push(quizScore);
  progress.lessons = progress.lessons || {};
  progress.lessons[lessonId] = newLesson;
  const mod = (plan.modules || []).find(m => m.id === moduleId);
  if (mod && mod.lessons && mod.lessons.every(l => (progress.lessons[l.id]?.completed))) {
    progress.modules = progress.modules || {};
    progress.modules[moduleId] = { completed: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  }
  progress.overallPercent = computeOverallPercent(plan, progress);
  progress.timeSpentMs = Number(progress.timeSpentMs || 0) + Number(timeSpentMs || 0);
  progress.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await ref.set({ course: { plan, progress }, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  const out = await ref.get();
  res.json(out.data().course);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});



