// DeepSeek API proxy — Pages Function at /api/chat/completions.
// Same origin, no CORS issues, no workers.dev blocking.
// API key is set in Cloudflare Pages Dashboard → Environment variables.
// Local dev note: set DEEPSEEK_PROXY_URL to your deployed endpoint or use
// a local wrangler dev server for the Pages Functions.
window.DEEPSEEK_PROXY_URL = "https://oriental-destiny.com/api";

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
