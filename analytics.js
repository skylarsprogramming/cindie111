import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js';
import { firebaseConfig } from './firebase-config.js';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let analyticsInstance = null;
try {
  analyticsInstance = getAnalytics(app);
} catch (_) {
  // Analytics might be unavailable in some environments (e.g., file protocol)
}

export function trackEvent(eventName, params = {}) {
  if (!analyticsInstance) return;
  try {
    logEvent(analyticsInstance, eventName, params);
  } catch (_) {}
}

export function identifyUser(uid) {
  if (!analyticsInstance || !uid) return;
  try { setUserId(analyticsInstance, uid); } catch (_) {}
}

export function setUserProps(props) {
  if (!analyticsInstance || !props) return;
  try { setUserProperties(analyticsInstance, props); } catch (_) {}
}








