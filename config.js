// DeepSeek API proxy endpoint
window.DEEPSEEK_PROXY_URL = "https://oriental-destiny.com/api";
// Shared secret for Worker proxy authentication. Also set as CLIENT_SECRET
// in the Worker environment variables (wrangler secret put CLIENT_SECRET).
window.DEEPSEEK_CLIENT_SECRET = "oriental-destiny-2026";

// Firebase configuration — the web config (including apiKey) is PUBLIC by
// design and not a secret. Access control is enforced entirely by Firestore
// Security Rules (each user can only read/write their own documents).
window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
  apiKey: "AIzaSyDU0gkMxcfHQplSOEb6DzX2fGSwTMjxoqY",
  authDomain: "oriental-destiny-751af.firebaseapp.com",
  projectId: "oriental-destiny-751af",
  storageBucket: "oriental-destiny-751af.firebasestorage.app",
  messagingSenderId: "237473497547",
  appId: "1:237473497547:web:7bbd21aa5e0e4e2464f64e"
};

const DREAM_FREE_LIMIT = 3;    // free users get 3 dream interpretations
const DREAM_PAID_LIMIT = 36;   // paid members get 36 interpretations
