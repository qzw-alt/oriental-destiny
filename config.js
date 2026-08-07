// DeepSeek API proxy endpoint
window.DEEPSEEK_PROXY_URL = "https://oriental-destiny.com/api";
// Shared secret for Worker proxy authentication. Also set as CLIENT_SECRET
// in the Worker environment variables (wrangler secret put CLIENT_SECRET).
window.DEEPSEEK_CLIENT_SECRET = "oriental-destiny-2026";

// Firebase configuration — load config.real.js BEFORE this file to override.
// If config.real.js is not loaded, these placeholder values will safely fail.
window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const DREAM_FREE_LIMIT = 3;    // free users get 3 dream interpretations
const DREAM_PAID_LIMIT = 36;   // paid members get 36 interpretations
