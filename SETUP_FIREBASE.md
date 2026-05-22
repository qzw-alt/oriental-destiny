# Firebase Setup Guide — Oriental Destiny

This guide walks through setting up Firebase for the dream interpretation + membership system.

## 1. Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **Add project** (or **Create a project**)
3. Name it e.g. `oriental-destiny`
4. Enable Google Analytics (recommended)
5. Click **Create project**

## 2. Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **Get started**
3. Click **Email/Password** provider → **Enable** → **Save**

## 3. Enable Firestore Database

1. Go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you'll lock it down in step 6)
4. Select a location close to your users (e.g. `us-central` or `asia-east1`)
5. Click **Enable**

## 4. Get Web App Config

1. Go to **Project Settings** (gear icon near the top left)
2. Under **Your apps**, click **Add app** → **Web**
3. Nickname: `oriental-destiny-web`
4. Check **Also set up Firebase Hosting** if you want, or skip
5. Register app
6. Copy the `firebaseConfig` object shown

## 5. Configure config.real.js

Edit `config.real.example.js` with your real values:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "oriental-destiny.firebaseapp.com",
  projectId: "oriental-destiny",
  storageBucket: "oriental-destiny.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

Rename the file to `config.real.js` (NOT in git — already in .gitignore).

Make sure every page that needs auth loads scripts in this order:
```html
<script src="config.real.js"></script>  <!-- real Firebase config (gitignored) -->
<script src="config.js"></script>        <!-- fallback + constants -->
<script src="auth.js"></script>          <!-- shared auth module -->
```

## 6. Set Firestore Security Rules

Go to **Firestore Database → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: authenticated users can read/write only their own document.
    // plan field is validated at the app level (auth.js).
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Dream readings: only the owner can read their own dreams.
    // Anyone authenticated can create (the app sets userId correctly).
    match /dream_readings/{dreamId} {
      allow read: if request.auth != null
                   && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
    }

    // Orders: only the owner can read their own orders.
    match /orders/{orderId} {
      allow read: if request.auth != null
                   && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 7. Add Authorized Domains

1. Go to **Authentication → Settings → Authorized domains**
2. Add your production domain: `oriental-destiny.com`
3. `localhost` should already be there for local testing

## 8. Test

1. Open `dream-interpretation.html` locally
2. Check browser console — no Firebase errors
3. Try registering a test account
4. Check Firestore → users collection — user doc should appear
5. Try the 1 free dream → quota should decrement

## Troubleshooting

**"Firebase: No Firebase App"**
→ config.real.js is not loaded before config.js, or values are still placeholders.

**Auth state not persisting**
→ Check that onAuthStateChanged is being called (not addEventListener).

**"Missing or insufficient permissions"**
→ Firestore security rules need to be deployed (Step 6).

**CORS errors**
→ Make sure your domain is in Firebase Console → Authentication → Authorized domains.
