// =============================================================================
// payment.js — Cloud Function callable helpers for the funnel closure.
// Load AFTER config.real.js + config.js (and auth.js when the page uses auth).
//
//   Payment.capture({orderID, product, plan, carrier, birthData})
//     → capturePayment Cloud Function; resolves to { orderId, status: 'paid' }
//   Payment.saveLead({email, source})
//     → saveLead Cloud Function (anonymous callers allowed)
// =============================================================================

(function() {
  'use strict';

  var _cached = null;

  function load() {
    if (_cached) return _cached;
    _cached = Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js')
    ]).then(function(mods) {
      var fnsMod = mods[0];
      var appMod = mods[1];
      var app;
      try {
        app = appMod.getApp();
      } catch (e) {
        var config = window.FIREBASE_CONFIG;
        if (!config) throw new Error('FIREBASE_CONFIG missing — load config.js first');
        app = appMod.initializeApp(config);
      }
      return { fnsMod: fnsMod, fns: fnsMod.getFunctions(app) };
    }).catch(function(err) {
      _cached = null;
      throw err;
    });
    return _cached;
  }

  function callable(name) {
    return function(payload) {
      return load().then(function(ctx) {
        var fn = ctx.fnsMod.httpsCallable(ctx.fns, name);
        return fn(payload);
      }).then(function(result) {
        return result.data;
      });
    };
  }

  window.Payment = {
    capture: callable('capturePayment'),
    saveLead: callable('saveLead')
  };
})();
