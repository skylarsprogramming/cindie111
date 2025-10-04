(function () {
  const STORAGE_KEY_COURSES = 'cindie_courses';
  const STORAGE_KEY_DASH = 'cindie_dashboard';

  function getLevelFromQuiz() {
    try {
      const raw = localStorage.getItem('lingualift_quiz_result');
      if (!raw) return 'A1';
      const r = JSON.parse(raw);
      const pct = Math.max(0, Math.min(1, (r.total || 0) / Math.max(1, r.max || 1)));
      if (pct < 0.2) return 'A1';
      if (pct < 0.4) return 'A2';
      if (pct < 0.6) return 'B1';
      if (pct < 0.8) return 'B2';
      return 'C1';
    } catch (_) {
      return 'A1';
    }
  }

  async function callOpenRouter(prompt) {
    const key = localStorage.getItem('OPENROUTER_API_KEY');
    if (!key) return null;
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [
            { role: 'system', content: 'You are a curriculum generator. Output ONLY compact JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        })
      });
      const json = await res.json();
      const txt = json.choices?.[0]?.message?.content || '';
      const start = txt.indexOf('{');
      const end = txt.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(txt.slice(start, end + 1));
      }
      return null;
    } catch (_) { return null; }
  }

  function fallbackGenerate(level) {
    const topics = ['Perfect Tenses', 'Travel & Directions', 'Work & Careers', 'Health & Fitness', 'Food & Cooking', 'Technology', 'Nature & Environment', 'Culture & Arts', 'Education', 'Science Basics', 'News & Media', 'Sports', 'Daily Routines', 'Shopping', 'Hobbies'];
    const courses = topics.slice(0, 15).map((t, i) => ({
      id: `auto_${i}`,
      level,
      title: `${t} (${level})`,
      description: `Learn ${t.toLowerCase()} with engaging examples and exercises suitable for ${level}.`,
      mcqs: [
        { q: `Choose the correct ${t.toLowerCase()} option.`, a: ['answer1','answer2','answer3','answer4'], correct: 0 },
        { q: `Select the best ${t.toLowerCase()} phrase.`, a: ['answer1','answer2','answer3','answer4'], correct: 1 },
      ],
      vocab: ['word1','word2','word3']
    }));
    return { courses };
  }

  async function generateCoursesIfNeeded() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY_COURSES);
      if (existing) return JSON.parse(existing);
    } catch (_) {}

    const level = getLevelFromQuiz();
    const prompt = `Generate a compact JSON { "courses": [ {"id": "string", "level": "A1-C2", "title": "string", "description": "string", "mcqs": [ {"q": "string", "a": ["answer1","answer2","answer3","answer4"], "correct": 0 } ], "vocab": ["word1","word2","word3"] } ... 15 items ] } tailored for level ${level}.`;
    let data = await callOpenRouter(prompt);
    if (!data || !Array.isArray(data.courses)) {
      data = fallbackGenerate(level);
    }
    try { localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(data)); } catch (_) {}
    return data;
  }

  function ensureDashboardState() {
    let dash = null;
    try { dash = JSON.parse(localStorage.getItem(STORAGE_KEY_DASH) || 'null'); } catch (_) {}
    if (!dash) {
      dash = { keepLearning: { course: 'Intro to perfect tenses', progress: 0 }, subjects: [ { name: 'IELTS preparation', xp: 0 }, { name: 'English B2', xp: 0 } ], weeklyTarget: { targetDays: 3, completedDays: 0, days: { monday:false, tuesday:false, wednesday:false, thursday:false, friday:false, saturday:false, sunday:false } } };
      try { localStorage.setItem(STORAGE_KEY_DASH, JSON.stringify(dash)); } catch (_) {}
    }
    return dash;
  }

  function getActivity() {
    try { return JSON.parse(localStorage.getItem('cindie_activity') || 'null') || { totals: { questions: 0, correct: 0, mcqSessions: 0, pronunciationSessions: 0, minutes: 0 }, recent: [] }; } catch (_) { return { totals: { questions: 0, correct: 0, mcqSessions: 0, pronunciationSessions: 0, minutes: 0 }, recent: [] }; }
  }

  function saveActivity(act) {
    try { localStorage.setItem('cindie_activity', JSON.stringify(act)); } catch (_) {}
  }

  function trackMcq(correct, detail) {
    const act = getActivity();
    act.totals.questions += 1;
    if (correct) act.totals.correct += 1;
    act.totals.mcqSessions += 1;
    act.recent.unshift({ type: 'mcq', correct: !!correct, detail: detail || '', ts: Date.now() });
    act.recent = act.recent.slice(0, 20);
    saveActivity(act);
  }

  function updateProgress(deltaXp = 10, deltaPct = 5) {
    const dash = ensureDashboardState();
    const subj = dash.subjects?.[0];
    if (subj) subj.xp = (subj.xp || 0) + deltaXp;
    if (dash.keepLearning) {
      dash.keepLearning.progress = Math.min(100, (dash.keepLearning.progress || 0) + deltaPct);
    }
    // Mark today as completed
    try {
      const d = new Date();
      const map = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      const key = map[d.getDay()];
      if (dash.weeklyTarget?.days) dash.weeklyTarget.days[key] = true;
      const count = Object.values(dash.weeklyTarget.days).filter(Boolean).length;
      dash.weeklyTarget.completedDays = count;
    } catch (_) {}
    try { localStorage.setItem(STORAGE_KEY_DASH, JSON.stringify(dash)); } catch (_) {}
    // try to sync to backend if available (non-blocking)
    try {
      const send = async () => {
        try {
          const idToken = localStorage.getItem('firebase_id_token');
          await fetch('http://localhost:4000/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': idToken ? `Bearer ${idToken}` : undefined },
            body: JSON.stringify({ keepLearning: dash.keepLearning, subjects: dash.subjects, weeklyTarget: dash.weeklyTarget })
          });
        } catch (_) {}
      };
      send();
    } catch (_) {}
  }

  async function tryRenderFromCourseExample() {
    try {
      const res = await fetch('./courseExample.json', { cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();
      const test = data?.test;
      const passage = test?.reading_passage;
      if (!passage) return false;

      // Populate picker with a single entry for consistency with UI
      populatePicker([{ title: passage.title || 'Reading Passage' }]);

      // Title
      const titleEl = document.getElementById('course-title') || document.querySelector('h1');
      if (titleEl) titleEl.textContent = passage.title || 'Course Title';

      // Lesson content: replace with reading passage
      const lessonRoot = document.querySelector('.lesson');
      if (lessonRoot) {
        lessonRoot.innerHTML = '';
        const article = document.createElement('article');
        const h3 = document.createElement('h3');
        h3.textContent = passage.title || 'Reading Passage';
        const p = document.createElement('p');
        p.textContent = passage.text || '';
        const read = document.createElement('div');
        read.className = 'read-cta';
        read.setAttribute('data-tts', passage.text || '');
        read.textContent = '🔊 Read out loud';
        article.appendChild(h3);
        article.appendChild(p);
        article.appendChild(read);
        lessonRoot.appendChild(article);
        // Bind TTS to the new element
        try {
          if (typeof window.speak === 'function') {
            read.addEventListener('click', () => window.speak(passage.text || ''));
            read.title = 'The text can be read out loud for pronunciation assistance';
          }
        } catch (_) {}
      }

      // MCQs from JSON
      const mcqSection = document.querySelector('.mcq');
      if (mcqSection) {
        mcqSection.innerHTML = '<h3 style="margin-top:0;">Questions</h3>';
        const questions = Array.isArray(test?.questions) ? test.questions : [];
        const pack = questions.map(q => {
          const answers = Array.isArray(q.answer_choices) ? q.answer_choices : ['TRUE', 'FALSE', 'NOT GIVEN'];
          let correctIndex = answers.indexOf(q.correct_answer);
          if (correctIndex < 0) correctIndex = 0;
          return { q: q.question, a: answers, correct: correctIndex };
        });
        pack.forEach((q, idx) => {
          const block = document.createElement('div');
          block.style.marginTop = idx === 0 ? '0' : '10px';
          block.innerHTML = `<div class="auth-muted">${q.q || 'Choose the correct answer:'}</div>` +
            (q.a || []).map((ans, i) => `<label data-idx="${idx}" data-answer="${i}"><input type="radio" name="q${idx+1}" style="display:none;" /> ${ans}</label>`).join('');
          mcqSection.appendChild(block);
        });
        mcqSection.querySelectorAll('label').forEach(label => {
          label.addEventListener('click', () => {
            mcqSection.querySelectorAll('label').forEach(l => l.style.borderColor = 'var(--border)');
            label.style.borderColor = 'var(--accent)';
            const idx = Number(label.getAttribute('data-idx'));
            const ans = Number(label.getAttribute('data-answer'));
            const correct = pack[idx]?.correct ?? 0;
            const isCorrect = ans === correct;
            if (isCorrect) updateProgress(15, 8); else updateProgress(5, 2);
            trackMcq(isCorrect, (pack[idx]?.q) || '');
          });
        });
      }

      // Clear vocab (no vocab in provided JSON)
      const vocabRoot = document.querySelector('.vocab-list');
      if (vocabRoot) {
        vocabRoot.innerHTML = '';
      }

      return true;
    } catch (_) {
      return false;
    }
  }

  function populatePicker(courses) {
    const picker = document.getElementById('course-picker');
    if (!picker) return;
    picker.innerHTML = '';
    courses.forEach((c, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = c.title || `Course ${i+1}`;
      picker.appendChild(opt);
    });
  }

  function renderCourse(course) {
    if (!course) return;
    const titleEl = document.getElementById('course-title') || document.querySelector('h1');
    if (titleEl) titleEl.textContent = course.title || 'Course Title';
    const vocabRoot = document.querySelector('.vocab-list');
    if (vocabRoot) {
      vocabRoot.innerHTML = '';
      (course.vocab || []).forEach(v => {
        const div = document.createElement('div');
        div.className = 'vocab-item';
        div.textContent = v;
        vocabRoot.appendChild(div);
      });
    }
    const mcqSection = document.querySelector('.mcq');
    if (mcqSection) {
      mcqSection.innerHTML = '<h3 style="margin-top:0;">Questions</h3>';
      const pack = (course.mcqs || []).slice(0, 2);
      pack.forEach((q, idx) => {
        const block = document.createElement('div');
        block.style.marginTop = idx === 0 ? '0' : '10px';
        block.innerHTML = `<div class=\"auth-muted\">${q.q || 'Choose the correct answer:'}</div>` +
          (q.a || []).map((ans, i) => `<label data-idx=\"${idx}\" data-answer=\"${i}\"><input type=\"radio\" name=\"q${idx+1}\" style=\"display:none;\" /> ${ans}</label>`).join('');
        mcqSection.appendChild(block);
      });
      mcqSection.querySelectorAll('label').forEach(label => {
        label.addEventListener('click', () => {
          mcqSection.querySelectorAll('label').forEach(l => l.style.borderColor = 'var(--border)');
          label.style.borderColor = 'var(--accent)';
          const idx = Number(label.getAttribute('data-idx'));
          const ans = Number(label.getAttribute('data-answer'));
          const correct = pack[idx]?.correct ?? 0;
          const isCorrect = ans === correct;
          if (isCorrect) updateProgress(15, 8); else updateProgress(5, 2);
          trackMcq(isCorrect, (pack[idx]?.q) || '');
        });
      });
    }
  }

  async function renderCoursePortal() {
    // First, try to render from local JSON sample if available
    const renderedFromSample = await tryRenderFromCourseExample();
    if (renderedFromSample) return;

    // Otherwise, proceed with generated courses
    const { courses } = await generateCoursesIfNeeded();
    populatePicker(courses);
    renderCourse(courses?.[0]);
    const picker = document.getElementById('course-picker');
    picker?.addEventListener('change', (e) => {
      const idx = Number(e.target.value || 0);
      renderCourse(courses[idx]);
      try {
        const dash = JSON.parse(localStorage.getItem(STORAGE_KEY_DASH) || '{}');
        if (dash.keepLearning) dash.keepLearning.course = courses[idx]?.title || dash.keepLearning.course;
        localStorage.setItem(STORAGE_KEY_DASH, JSON.stringify(dash));
      } catch (_) {}
    });
  }

  document.addEventListener('DOMContentLoaded', renderCoursePortal);

  // Expose for debug
  window.CoursesAPI = { generateCoursesIfNeeded, updateProgress };
})();


