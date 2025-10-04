import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  reload,
  sendPasswordResetEmail,
  updatePassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
import { firebaseConfig } from './js/firebase-config.js';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);
auth.useDeviceLanguage();

export async function registerEmailPassword(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  try {
    const userRef = doc(db, 'users', cred.user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email || email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: {
          displayName: cred.user.displayName || null,
          photoURL: cred.user.photoURL || null,
        },
        providers: cred.user.providerData.map(p => p.providerId),
        roles: ['user'],
      });
    }
  } catch (e) {
    console.warn('Failed to create user profile in Firestore:', e);
  }
  return cred;
}

export async function loginEmailPassword(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  try {
    const userRef = doc(db, 'users', cred.user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email || email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: {
          displayName: cred.user.displayName || null,
          photoURL: cred.user.photoURL || null,
        },
        providers: cred.user.providerData.map(p => p.providerId),
        roles: ['user'],
      });
    } else {
      await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (e) {
    console.warn('Failed to upsert user profile in Firestore:', e);
  }
  return cred;
}

export async function logout() {
  await signOut(auth);
}

export async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(forceRefresh);
}

export { onAuthStateChanged };

// Google sign-in
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  try {
    const userRef = doc(db, 'users', cred.user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: {
          displayName: cred.user.displayName || null,
          photoURL: cred.user.photoURL || null,
        },
        providers: cred.user.providerData.map(p => p.providerId),
        roles: ['user'],
      });
    } else {
      await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (e) {
    console.warn('Failed to upsert user profile in Firestore:', e);
  }
  return cred;
}

// Email verification helpers
export async function sendVerificationEmail() {
  if (!auth.currentUser) throw new Error('No current user');
  return await sendEmailVerification(auth.currentUser);
}

export async function reloadUser() {
  if (!auth.currentUser) return null;
  await reload(auth.currentUser);
  return auth.currentUser;
}

export function isEmailVerified() {
  return !!auth.currentUser?.emailVerified;
}

export async function resetPasswordEmail(email) {
  return await sendPasswordResetEmail(auth, email);
}

export async function updateCurrentUserPassword(newPassword) {
  if (!auth.currentUser) throw new Error('No current user');
  return await updatePassword(auth.currentUser, newPassword);
}

export async function setRememberPersistence(remember) {
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
}


