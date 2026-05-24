// =============================================================================
// auth.js — Shared Firebase Authentication Module for Oriental Destiny
// =============================================================================
// Usage: Load AFTER config.js on any page that needs auth.
//   <script src="config.js"></script>
//   <script src="auth.js"></script>
//
// Provides window.Auth with:
//   Auth.init()                  — initialize Firebase (idempotent)
//   Auth.isReady()               — true when Firebase is initialized
//   Auth.onAuthChange(callback)  — subscribe to auth state changes
//   Auth.register(email, pass)   — create account + Firestore user doc
//   Auth.login(email, pass)      — sign in
//   Auth.logout()                 — sign out
//   Auth.getRemainingDreams()    — remaining dream credits
//   Auth.incrementDreamUsed()    — consume 1 dream credit
//   Auth.upgradeToPaid(txId)     — upgrade membership to paid tier
//   Auth.saveDreamReading(data)   — save dream reading to Firestore
//   Auth.getDreamHistory()        — load dream history from Firestore
//
// State properties (reactive after onAuthChange fires):
//   Auth.currentUser    — Firebase user object (null if logged out)
//   Auth.userPlan        — 'free' | 'paid'
//   Auth.dreamUsed        — dreams consumed this cycle
//   Auth.dreamLimit       — max dreams allowed
// =============================================================================

(function() {
  'use strict';

  var Auth = {
    _initialized: false,
    _ready: false,
    _app: null,
    _auth: null,
    _db: null,
    _helpers: null,

    // Public state
    currentUser: null,
    userPlan: 'free',
    dreamUsed: 0,
    dreamLimit: DREAM_FREE_LIMIT, // from config.js

    // Subscribers
    _listeners: [],

    // ── Init ────────────────────────────────────────────────────────────────

    init: function() {
      if (Auth._initialized) return Promise.resolve();
      Auth._initialized = true;

      return Promise.all([
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js')
      ]).then(function(mods) {
        var appMod = mods[0];
        var authMod = mods[1];
        var fsMod = mods[2];

        // Avoid 'duplicate-app' errors when navigating between pages that share the
        // same Firebase module cache (common in dev). If a default app exists and its
        // config matches, reuse it. If it's stale, delete it first then recreate.
        // If window.FIREBASE_CONFIG contains placeholder values (e.g. from a stale
        // cached config.js without the || guard), fetch and eval config.real.js directly.
        var config = window.FIREBASE_CONFIG;
        var needsRealConfig = !config || config.apiKey === 'YOUR_API_KEY';
        var configPromise = needsRealConfig
          ? fetch('config.real.js').then(function(r) { return r.text(); }).then(function(t) {
              eval(t);
              config = window.FIREBASE_CONFIG;
            }).catch(function() { /* use whatever config we have */ })
          : Promise.resolve();

        function getOrCreateApp() {
          try {
            var existing = appMod.getApp();
            if (existing.options.apiKey === config.apiKey) return Promise.resolve(existing);
            // Stale app with different config — delete first
            return appMod.deleteApp(existing).then(function() { return appMod.initializeApp(config); });
          } catch (_) {
            return Promise.resolve(appMod.initializeApp(config));
          }
        }

        return configPromise.then(function() {
          return getOrCreateApp();
        }).then(function(app) {
          Auth._app = app;
          Auth._auth = authMod.getAuth(Auth._app);
          Auth._db = fsMod.getFirestore(Auth._app);
          Auth._helpers = {
            signInWithEmailAndPassword: authMod.signInWithEmailAndPassword,
            createUserWithEmailAndPassword: authMod.createUserWithEmailAndPassword,
            signOut: authMod.signOut,
            doc: fsMod.doc,
            getDoc: fsMod.getDoc,
            setDoc: fsMod.setDoc,
            updateDoc: fsMod.updateDoc,
            increment: fsMod.increment,
            serverTimestamp: fsMod.serverTimestamp,
            collection: fsMod.collection,
            addDoc: fsMod.addDoc,
            query: fsMod.query,
            where: fsMod.where,
            orderBy: fsMod.orderBy,
            getDocs: fsMod.getDocs,
            limit: fsMod.limit
          };

          // Bind auth state listener (correct API)
          authMod.onAuthStateChanged(Auth._auth, function(user) {
            Auth._onUserChanged(user).then(function() {
              Auth._notify(user);
            });
          });

          Auth._ready = true;

          // Catch any already-signed-in user (on page load, Firebase restores from IndexedDB)
          if (Auth._auth.currentUser) {
            return Auth._onUserChanged(Auth._auth.currentUser);
          }
        });
      }).catch(function(err) {
        console.error('Auth: Firebase init failed', err);
        Auth._ready = true; // mark ready so UI doesn't hang, but will use localStorage fallback
      });
    },

    isReady: function() {
      return Auth._ready;
    },

    // ── Auth State ──────────────────────────────────────────────────────────

    onAuthChange: function(fn) {
      Auth._listeners.push(fn);
      // Fire immediately with current state if already ready
      if (Auth._ready) fn(Auth.currentUser);
    },

    _notify: function(user) {
      Auth._listeners.forEach(function(fn) { fn(user); });
    },

    _onUserChanged: function(user) {
      Auth.currentUser = user;
      if (user) {
        return Auth._loadUserData(user.uid);
      } else {
        Auth.userPlan = 'free';
        Auth.dreamLimit = DREAM_FREE_LIMIT;
        Auth.dreamUsed = parseInt(localStorage.getItem('dreamUsed') || '0', 10);
        return Promise.resolve();
      }
    },

    _loadUserData: function(uid) {
      if (!Auth._db) return Promise.resolve();
      var h = Auth._helpers;
      return h.getDoc(h.doc(Auth._db, 'users', uid)).then(function(snap) {
        if (snap.exists()) {
          var data = snap.data();
          Auth.userPlan = data.plan || 'free';
          Auth.dreamUsed = data.dreamUsed || 0;
          Auth.dreamLimit = data.dreamLimit || (Auth.userPlan === 'paid' ? DREAM_PAID_LIMIT : DREAM_FREE_LIMIT);
        } else {
          Auth.userPlan = 'free';
          Auth.dreamUsed = 0;
          Auth.dreamLimit = DREAM_FREE_LIMIT;
        }
      }).catch(function(e) {
        console.error('Auth: failed to load user data', e);
        Auth.userPlan = 'free';
        Auth.dreamLimit = DREAM_FREE_LIMIT;
        Auth.dreamUsed = parseInt(localStorage.getItem('dreamUsed') || '0', 10);
      });
    },

    // ── Auth Actions ────────────────────────────────────────────────────────

    register: function(email, password) {
      var h = Auth._helpers;
      return h.createUserWithEmailAndPassword(Auth._auth, email, password).then(function(cred) {
        return h.setDoc(h.doc(Auth._db, 'users', cred.user.uid), {
          email: email,
          plan: 'free',
          dreamUsed: 0,
          dreamLimit: DREAM_FREE_LIMIT,
          createdAt: h.serverTimestamp()
        });
      });
    },

    login: function(email, password) {
      var h = Auth._helpers;
      return h.signInWithEmailAndPassword(Auth._auth, email, password);
    },

    logout: function() {
      var h = Auth._helpers;
      return h.signOut(Auth._auth);
    },

    // ── Dream Quota ─────────────────────────────────────────────────────────

    getRemainingDreams: function() {
      return Math.max(0, Auth.dreamLimit - Auth.dreamUsed);
    },

    incrementDreamUsed: function() {
      Auth.dreamUsed++;
      if (Auth.currentUser && Auth._db) {
        var h = Auth._helpers;
        var uid = Auth.currentUser.uid;
        // Read current doc, then write back with incremented value.
        // This works even if Firestore rules require the full document for updates.
        return h.getDoc(h.doc(Auth._db, 'users', uid)).then(function(snap) {
          var data = snap.exists() ? snap.data() : {};
          data.dreamUsed = (data.dreamUsed || 0) + 1;
          return h.setDoc(h.doc(Auth._db, 'users', uid), data);
        }).catch(function(e) {
          console.error('Auth: failed to increment dream count', e);
          localStorage.setItem('dreamUsed', Auth.dreamUsed);
        });
      } else {
        localStorage.setItem('dreamUsed', Auth.dreamUsed);
        return Promise.resolve();
      }
    },

    // ── Membership Upgrade ──────────────────────────────────────────────────

    upgradeToPaid: function(txId) {
      if (!Auth.currentUser || !Auth._db) return Promise.reject('Not logged in');
      var h = Auth._helpers;
      var uid = Auth.currentUser.uid;
      // Read current doc then write back with upgraded fields (same pattern as incrementDreamUsed)
      return h.getDoc(h.doc(Auth._db, 'users', uid)).then(function(snap) {
        var data = snap.exists() ? snap.data() : {};
        data.plan = 'paid';
        data.dreamLimit = DREAM_PAID_LIMIT;
        data.upgradedAt = new Date();
        data.transactionId = txId || '';
        return h.setDoc(h.doc(Auth._db, 'users', uid), data);
      }).then(function() {
        Auth.userPlan = 'paid';
        Auth.dreamLimit = DREAM_PAID_LIMIT;
      });
    },

    // ── Dream History ───────────────────────────────────────────────────────

    saveDreamReading: function(data) {
      if (!Auth.currentUser || !Auth._db) return Promise.resolve(null);
      var h = Auth._helpers;
      return h.addDoc(h.collection(Auth._db, 'dream_readings'), {
        userId: Auth.currentUser.uid,
        dream: data.dream,
        emotion: data.emotion || '',
        people: data.people || '',
        objects: data.objects || '',
        recurring: data.recurring || false,
        element: data.element || '',
        subElements: data.subElements || [],
        symbolism: data.symbolism || '',
        psychological: data.psychological || '',
        guidance: data.guidance || '',
        luckyDirection: data.luckyDirection || '',
        fullInterpretation: data.fullInterpretation || '',
        combinedWithBazi: data.combinedWithBazi || false,
        createdAt: h.serverTimestamp()
      });
    },

    getDreamHistory: function(maxResults) {
      if (!Auth.currentUser || !Auth._db) return Promise.resolve([]);
      var h = Auth._helpers;
      // Query without orderBy to avoid requiring a composite index.
      // Results are sorted client-side by createdAt descending.
      var q = h.query(
        h.collection(Auth._db, 'dream_readings'),
        h.where('userId', '==', Auth.currentUser.uid),
        h.limit(maxResults || 50)
      );
      return h.getDocs(q).then(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        results.sort(function(a, b) {
          var ta = a.createdAt ? a.createdAt.seconds || 0 : 0;
          var tb = b.createdAt ? b.createdAt.seconds || 0 : 0;
          return tb - ta;
        });
        return results;
      }).catch(function(e) {
        console.error('Auth: failed to load dream history', e);
        return [];
      });
    },

    // ── Save Order Record ───────────────────────────────────────────────────

    saveOrder: function(orderData) {
      if (!Auth.currentUser || !Auth._db) return Promise.resolve(null);
      var h = Auth._helpers;
      return h.addDoc(h.collection(Auth._db, 'orders'), {
        userId: Auth.currentUser.uid,
        email: Auth.currentUser.email,
        amount: orderData.amount || 199,
        product: orderData.product || 'destiny_membership',
        paypalTxId: orderData.paypalTxId || '',
        status: orderData.status || 'completed',
        createdAt: h.serverTimestamp()
      });
    },

    // ── Instant Report ──────────────────────────────────────────────────────

    purchaseInstantReport: function(txId) {
      if (!Auth.currentUser || !Auth._db) return Promise.resolve(null);
      var h = Auth._helpers;
      return h.addDoc(h.collection(Auth._db, 'orders'), {
        userId: Auth.currentUser.uid,
        email: Auth.currentUser.email,
        amount: 29,
        product: 'instant_report',
        paypalTxId: txId || '',
        status: 'completed',
        createdAt: h.serverTimestamp()
      });
    },

    saveInstantReport: function(reportData) {
      if (!Auth.currentUser || !Auth._db) return Promise.resolve(null);
      var h = Auth._helpers;
      return h.addDoc(h.collection(Auth._db, 'instant_reports'), {
        userId: Auth.currentUser.uid,
        email: Auth.currentUser.email,
        birthDate: reportData.birthDate || '',
        birthTime: reportData.birthTime || '',
        lifeFocus: reportData.lifeFocus || '',
        dayMaster: reportData.dayMaster || '',
        dayMasterElement: reportData.dayMasterElement || '',
        reportContent: reportData.reportContent || null,
        createdAt: h.serverTimestamp()
      });
    },

    getUserReports: function() {
      if (!Auth.currentUser || !Auth._db) return Promise.resolve([]);
      var h = Auth._helpers;
      var q = h.query(
        h.collection(Auth._db, 'instant_reports'),
        h.where('userId', '==', Auth.currentUser.uid),
        h.limit(50)
      );
      return h.getDocs(q).then(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        results.sort(function(a, b) {
          var ta = a.createdAt ? a.createdAt.seconds || 0 : 0;
          var tb = b.createdAt ? b.createdAt.seconds || 0 : 0;
          return tb - ta;
        });
        return results;
      }).catch(function(e) {
        console.error('Auth: failed to load instant reports', e);
        return [];
      });
    },

    getInstantReport: function(reportId) {
      if (!Auth.currentUser || !Auth._db) return Promise.resolve(null);
      var h = Auth._helpers;
      return h.getDoc(h.doc(Auth._db, 'instant_reports', reportId)).then(function(snap) {
        if (snap.exists()) {
          var d = snap.data();
          d.id = snap.id;
          return d;
        }
        return null;
      }).catch(function(e) {
        console.error('Auth: failed to load report', e);
        return null;
      });
    }
  };

  window.Auth = Auth;
})();
