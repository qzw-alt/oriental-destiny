// DeepSeek API proxy URL — the Cloudflare Worker handles auth server-side.
// Deploy the worker first: cd workers/deepseek-proxy && wrangler deploy
window.DEEPSEEK_PROXY_URL = "https://deepseek-proxy.qzwx10000.workers.dev";

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
