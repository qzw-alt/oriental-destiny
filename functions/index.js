/**
 * Oriental Destiny — Cloud Functions
 *
 * Payment verification & funnel closure backend.
 *
 *   capturePayment({orderID, product, plan, carrier, birthData})
 *     — server-side PayPal capture + amount verification + Firestore order.
 *   saveLead({email, source})
 *     — collect email from the free reading tool (anonymous callers allowed).
 *
 * Secrets (firebase functions:secrets:set <NAME>):
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_ENV              — 'live' (default) or 'sandbox'
 *   RESEND_API_KEY
 *   RESEND_FROM             — verified sender, e.g. 'Oriental Destiny <noreply@oriental-destiny.com>'
 *   SELLER_EMAIL            — fulfillment inbox, e.g. '434338480@qq.com'
 *
 * Deploy:  cd functions && npm install
 *          firebase deploy --only functions
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

const PAYPAL_CLIENT_ID = defineSecret('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = defineSecret('PAYPAL_CLIENT_SECRET');
const PAYPAL_ENV = defineSecret('PAYPAL_ENV');
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
const RESEND_FROM = defineSecret('RESEND_FROM');
const SELLER_EMAIL = defineSecret('SELLER_EMAIL');

const db = admin.firestore();

const PRODUCTS = {
  instant_report: { amount: 29 },
  treasure_match: { amount: 199 },
};

const CREDIT_WINDOW_MS = 7 * 24 * 3600 * 1000; // 7 days for $29 → $199 credit
const CREDIT_AMOUNT = 29;

const SECRETS = [
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_ENV,
  RESEND_API_KEY,
  RESEND_FROM,
  SELLER_EMAIL,
];

// ────────────────────────────────────────────────────────────────
// PayPal
// ────────────────────────────────────────────────────────────────

function paypalBaseUrl() {
  return (process.env['PAYPAL_ENV'] || 'live') === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

function paypalHeaders() {
  const auth = 'Basic ' + Buffer.from(
    `${process.env['PAYPAL_CLIENT_ID']}:${process.env['PAYPAL_CLIENT_SECRET']}`
  ).toString('base64');
  return {
    'Content-Type': 'application/json',
    'Authorization': auth,
  };
}

async function paypalCapture(orderID) {
  const res = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${orderID}/capture`, {
    method: 'POST',
    headers: paypalHeaders(),
    body: '{}',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new HttpsError('unavailable', `PayPal capture failed: ${data.message || res.status}`);
  }
  return data;
}

async function paypalGetOrder(orderID) {
  const res = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${orderID}`, {
    method: 'GET',
    headers: paypalHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new HttpsError('unavailable', `PayPal lookup failed: ${data.message || res.status}`);
  }
  return data;
}

// ────────────────────────────────────────────────────────────────
// Orders
// ────────────────────────────────────────────────────────────────

async function findExistingOrder(paypalOrderID) {
  const snap = await db.collection('orders')
    .where('paypalOrderId', '==', paypalOrderID)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, data: doc.data() };
}

/** Paid $29 instant-report orders within the credit window, not yet redeemed. */
async function findCreditableReportOrders(uid) {
  const now = Date.now();
  const snap = await db.collection('orders').where('userId', '==', uid).get();
  const candidates = [];
  snap.forEach((doc) => {
    const d = doc.data();
    if (d.product !== 'instant_report' || d.status !== 'paid' || d.redeemedFor) return;
    const created = d.createdAt ? new Date(d.createdAt.seconds * 1000) : null;
    if (created && now - created.getTime() <= CREDIT_WINDOW_MS) candidates.push(doc);
  });
  candidates.sort((a, b) => a.data().createdAt.seconds - b.data().createdAt.seconds);
  return candidates[0] || null;
}

/** Expected amount server-side: base price minus any valid credit. */
async function computeExpectedAmount(uid, product) {
  const p = PRODUCTS[product];
  if (!p) throw new HttpsError('invalid-argument', `Unknown product: ${product}`);
  let amount = p.amount;
  let creditApplied = 0;
  let creditFromOrderId = null;

  if (product === 'treasure_match') {
    const creditable = await findCreditableReportOrders(uid);
    if (creditable) {
      creditApplied = CREDIT_AMOUNT;
      creditFromOrderId = creditable.id;
      amount = Math.max(29, amount - creditApplied);
    }
  }
  return { amount, creditApplied, creditFromOrderId };
}

function capturedAmount(capture) {
  const unit = capture.purchase_units && capture.purchase_units[0];
  const cap = unit && unit.payments && unit.payments.captures && unit.payments.captures[0];
  return cap
    ? { value: parseFloat(cap.amount && cap.amount.value), currency: cap.amount.currency_code }
    : { value: 0, currency: 'USD' };
}

// ────────────────────────────────────────────────────────────────
// Email (Resend)
// ────────────────────────────────────────────────────────────────

async function sendEmail(payload) {
  if (!process.env['RESEND_API_KEY']) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env['RESEND_API_KEY']}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('Resend failed:', res.status, await res.text());
  } catch (err) {
    console.error('Resend error:', err);
  }
}

function orderSummaryHtml(order) {
  const productName = order.product === 'instant_report' ? 'Complete BaZi Reading ($29)' : 'Matched Daoist Treasure ($199)';
  const planName = order.plan || '';
  const carrierName = order.carrier || '';
  const items = [
    ['Product', productName],
    ['Amount paid', `$${order.amount} USD`],
  ];
  if (planName) items.push(['Focus', planName]);
  if (carrierName) items.push(['Form', carrierName]);
  if (order.creditApplied) items.push(['$29 report credit', `Applied ($${order.creditApplied})`]);
  const rows = items.map(([k, v]) => `<tr><td style="padding:6px 12px;color:#666;white-space:nowrap;">${k}</td><td style="padding:6px 12px;">${v}</td></tr>`).join('');
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#241915;line-height:1.6;">
    <h2 style="color:#a63a2c;">Oriental Destiny</h2>
    <table style="border-collapse:collapse;border:1px solid #e3d9c9;border-radius:8px;">${rows}</table>
    <p style="color:#666;font-size:13px;">Questions? Reply to this email and we will pick it up.</p>
  </div>`;
}

// ────────────────────────────────────────────────────────────────
// capturePayment
// ────────────────────────────────────────────────────────────────

exports.capturePayment = onCall({ secrets: SECRETS }, async (request) => {
  const { orderID, product, plan, carrier, birthData } = request.data || {};
  if (!orderID || typeof orderID !== 'string') {
    throw new HttpsError('invalid-argument', 'Missing orderID');
  }
  if (!PRODUCTS[product]) {
    throw new HttpsError('invalid-argument', `Unknown product: ${product}`);
  }
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must sign in before purchasing.');
  }
  const uid = request.auth.uid;
  const email = request.auth.token && request.auth.token.email;

  // Idempotency: a PayPal order id must map to exactly one of our orders.
  const existing = await findExistingOrder(orderID);
  if (existing) {
    return { orderId: existing.id, alreadyProcessed: true, status: existing.data.status };
  }

  const capture = await paypalCapture(orderID);
  if (capture.status !== 'COMPLETED') {
    throw new HttpsError('failed-precondition', `Payment is not completed (${capture.status}).`);
  }

  const { value, currency } = capturedAmount(capture);
  const { amount: expectedAmount, creditApplied, creditFromOrderId } =
    await computeExpectedAmount(uid, product);

  // Accept 0.01 tolerance for floating rounding.
  if (Math.abs(value - expectedAmount) > 0.01 || currency !== 'USD') {
    throw new HttpsError('failed-precondition',
      `Amount mismatch: expected ${expectedAmount} USD, received ${value} ${currency}.`);
  }

  const orderRef = db.collection('orders').doc();
  await orderRef.set({
    userId: uid,
    email: email || '',
    product,
    plan: plan || '',
    carrier: carrier || '',
    amount: value,
    currency: currency || 'USD',
    paypalOrderId: orderID,
    status: 'paid',
    creditApplied,
    creditFromOrderId: creditFromOrderId || null,
    birthData: birthData || null,
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Mark the source $29 order as redeemed so the credit cannot be reused.
  if (creditFromOrderId) {
    await db.collection('orders').doc(creditFromOrderId).update({ redeemedFor: orderRef.id });
  }

  // $199 (treasure_match) unlocks full membership: 36 dream credits.
  if (product === 'treasure_match') {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};
    await userRef.set({
      ...userData,
      plan: 'paid',
      dreamLimit: 36,
      upgradedAt: new Date(),
    }, { merge: true });
  }

  // ── Emails ──────────────────────────────────────────────
  const from = process.env['RESEND_FROM'] || 'Oriental Destiny <onboarding@resend.dev>';
  const base = 'https://oriental-destiny.com';

  if (product === 'instant_report') {
    await sendEmail({
      from,
      to: [email || ''],
      subject: 'Your Complete BaZi Reading — $29 order confirmed',
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#241915;line-height:1.7;">
        <h2 style="color:#a63a2c;">Your reading is ready.</h2>
        <p>Thanks for ordering the Complete BaZi Reading. Your full report is available from your dashboard:</p>
        <p><a href="${base}/report_viewer.html" style="display:inline-block;padding:12px 24px;background:#a63a2c;color:#fff;border-radius:8px;text-decoration:none;">Open My Reading</a></p>
        <p style="color:#666;font-size:13px;">Prefer to keep it here — your report is saved under <em>BaZi Reports</em> in your dashboard whenever you sign in.</p>
      </div>`,
    });
  } else {
    // treasure_match: notify customer + fulfillment inbox.
    const snapshotLink = `${base}/snapshot_report.html?order=${orderRef.id}`;
    await sendEmail({
      from,
      to: [email || ''],
      subject: 'Your $199 order is confirmed — chart snapshot inside',
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#241915;line-height:1.7;">
        <h2 style="color:#a63a2c;">Thank you — your order is confirmed.</h2>
        <p>Your chart snapshot is available now:</p>
        <p><a href="${snapshotLink}" style="display:inline-block;padding:12px 24px;background:#a63a2c;color:#fff;border-radius:8px;text-decoration:none;">View My Chart Snapshot</a></p>
        <p>A master will review your chart and email the complete annotated report within 6 hours. We will then match your treasure and confirm with you before shipping.</p>
      </div>`,
    });
    await sendEmail({
      from,
      to: [process.env['SELLER_EMAIL'] || '434338480@qq.com'],
      subject: `New $199 order — ${plan || ''} / ${carrier || ''}`,
      html: orderSummaryHtml({ product, amount: value, plan, carrier, creditApplied }) +
        `<p>User uid: ${uid}<br>Email: ${email}<br>Order id: ${orderRef.id}<br>Birth data: <pre style="background:#f6f0e6;padding:8px;border-radius:6px;">${JSON.stringify(birthData || {}, null, 2)}</pre></p>`,
    });
  }

  return { orderId: orderRef.id, alreadyProcessed: false, status: 'paid' };
});

// ────────────────────────────────────────────────────────────────
// saveLead — email capture from the free reading tool
// ────────────────────────────────────────────────────────────────

const leadRateMap = new Map(); // per-instance coarse limiter

exports.saveLead = onCall(async (request) => {
  const email = String((request.data && request.data.email) || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'Invalid email address');
  }

  // Coarse per-IP rate limit (in-memory; reset on cold start).
  const ip = request.rawRequest.headers['x-forwarded-for']
    ? String(request.rawRequest.headers['x-forwarded-for']).split(',')[0].trim()
    : 'unknown';
  const now = Date.now();
  const entry = leadRateMap.get(ip);
  if (entry && now - entry.t < 60 * 1000) {
    if (entry.n >= 3) throw new HttpsError('resource-exhausted', 'Too many attempts. Please try again later.');
    entry.n++;
  } else {
    leadRateMap.set(ip, { t: now, n: 1 });
  }

  await db.collection('leads').add({
    email,
    source: String((request.data && request.data.source) || 'free_reading'),
    userUid: request.auth ? request.auth.uid : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true };
});
