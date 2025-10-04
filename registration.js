// Shared Firebase initialization for analytics-only use on signup page
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

try {
  getAnalytics(app);
} catch (_) {
  // Ignore analytics errors in unsupported environments
}











