// =============================================================================
// payment.js — Client calls to the Cloudflare Worker payment/lead endpoints.
// Load AFTER config.js (provides DEEPSEEK_PROXY_URL + DEEPSEEK_CLIENT_SECRET)
// and auth.js (for uid/email on payment pages).
//
//   Payment.capture({orderID, product, plan, carrier, birthData})
//     → POST /api/verify-payment → { orderId, status: 'paid' }
//   Payment.saveLead({email, source})
//     → POST /api/lead → { ok: true }
//
// The worker verifies the payment server-side with PayPal and writes the order
// to Firestore using a Google service account (bypassing client security rules),
// so a client-side flag can no longer unlock paid reports.
// =============================================================================

(function() {
  'use strict';

  function baseUrl() {
    var base = (typeof window.DEEPSEEK_PROXY_URL === 'string' && window.DEEPSEEK_PROXY_URL)
      ? window.DEEPSEEK_PROXY_URL : 'https://oriental-destiny.com/api';
    return base.replace(/\/$/, '');
  }

  function call(path, payload) {
    return fetch(baseUrl() + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Secret': (typeof window.DEEPSEEK_CLIENT_SECRET === 'string')
          ? window.DEEPSEEK_CLIENT_SECRET : ''
      },
      body: JSON.stringify(payload)
    }).then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) {
          throw new Error(data.error || ('Request failed: ' + res.status));
        }
        return data;
      });
    });
  }

  function attachAccount(payload) {
    var p = Object.assign({}, payload);
    try {
      if (window.Auth && window.Auth.currentUser) {
        if (!p.uid) p.uid = window.Auth.currentUser.uid;
        if (!p.email) p.email = window.Auth.currentUser.email;
      }
    } catch (e) {}
    return p;
  }

  window.Payment = {
    capture: function(payload) {
      return call('/verify-payment', attachAccount(payload));
    },
    saveLead: function(payload) {
      return call('/lead', attachAccount(payload));
    }
  };
})();
