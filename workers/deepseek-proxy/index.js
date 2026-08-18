/**
 * DeepSeek API Proxy — Cloudflare Worker
 *
 * Hides the API key server-side. All client requests go through this worker
 * instead of calling api.deepseek.com directly.
 *
 * Deploy:  cd workers/deepseek-proxy && wrangler deploy
 *          (or: npx wrangler deploy)
 *
 * Client usage:
 *   fetch('https://deepseek-proxy.qzwx10000.workers.dev/chat/completions', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json', 'X-Client-Secret': 'YOUR_SECRET' },
 *     body: JSON.stringify({ model: 'deepseek-chat', messages: [...], temperature: 0.7, max_tokens: 800 })
 *   })
 */

// ═══════════════════════════════════════════════════════════════
// CONFIG — set via wrangler secret put
//   DEEPSEEK_API_KEY   — your DeepSeek API key (secret)
//   CLIENT_SECRET      — shared secret required in X-Client-Secret header (secret)
// ═══════════════════════════════════════════════════════════════

// Rate limiting: per-IP sliding window (in-memory, resets on cold start)
const RATE_LIMIT_WINDOW_MS = 60_000;  // 1 minute
const RATE_LIMIT_MAX = 20;            // max 20 requests per minute per IP
const rateMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

// Cleanup is done inline in isRateLimited() — no setInterval in global scope
// (Cloudflare Workers disallow async I/O & timers outside handlers)

// ═══════════════════════════════════════════════════════════════
// AUTH — requires X-Client-Secret header matching CLIENT_SECRET env var.
// This stops curl/script abuse even without an Origin header.
// ═══════════════════════════════════════════════════════════════
function isAuthenticated(request, env) {
  const expected = env.CLIENT_SECRET || 'oriental-destiny-2026';
  const provided = request.headers.get('X-Client-Secret') || '';
  return provided === expected;
}

function jsonError(message, status, request) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    }
  });
}

// ═══════════════════════════════════════════════════════════
// EMAIL — POST /send-report
// Forwards a generated report (HTML body + optional PDF attachment)
// to the seller's email, which then forwards it to the customer.
//   RESEND_API_KEY  — Resend API key (secret)
//   SELLER_EMAIL    — destination (defaults to 434338480@qq.com)
//   FROM_EMAIL      — verified sender (defaults to Resend test address)
// ═══════════════════════════════════════════════════════════
const MAX_EMAIL_HTML = 200000;        // chars
const MAX_PDF_BASE64 = 7 * 1024 * 1024; // ~5 MB PDF as base64

async function handleSendReport(request, env) {
  if (!isAuthenticated(request, env)) {
    return jsonError('Unauthorized', 401, request);
  }

  if (!env.RESEND_API_KEY) {
    return jsonError('Email not configured (missing RESEND_API_KEY)', 503, request);
  }

  let data;
  try {
    data = JSON.parse(await request.text());
  } catch {
    return jsonError('Invalid JSON body', 400, request);
  }

  if (!data.subject || !data.html) return jsonError('Missing subject or html', 400, request);
  if (data.html.length > MAX_EMAIL_HTML) return jsonError('HTML too large', 400, request);

  const payload = {
    from: env.FROM_EMAIL || 'Oriental Destiny <onboarding@resend.dev>',
    to: [env.SELLER_EMAIL || '434338480@qq.com'],
    subject: String(data.subject).slice(0, 200),
    html: data.html,
  };
  if (data.replyTo) payload.reply_to = String(data.replyTo).slice(0, 200);

  if (data.pdfBase64 && data.pdfFilename) {
    const b64 = String(data.pdfBase64);
    if (b64.length > MAX_PDF_BASE64) return jsonError('PDF attachment too large', 400, request);
    payload.attachments = [{ filename: String(data.pdfFilename).slice(0, 200), content: b64 }];
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resBody = await res.text();
    return new Response(resBody, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
      }
    });
  } catch (err) {
    return jsonError('Email send failed: ' + err.message, 502, request);
  }
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT VERIFICATION + LEAD CAPTURE
//
// POST /verify-payment  — server-side PayPal capture, amount check,
//   Firestore order write (via service-account REST), Resend emails.
// POST /lead           — collect an email from the free reading tool.
//
// Secrets (wrangler secret put <NAME>):
//   GOOGLE_SA_JSON       — Firebase/GCP service-account key JSON (for Firestore)
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
//   PAYPAL_ENV           — 'sandbox' (default 'live')
//   RESEND_API_KEY, RESEND_FROM, SELLER_EMAIL
//
// Note: `uid` is supplied by the client (Firebase Auth). Amount verification
// against PayPal is the security boundary here; uid is bookkeeping only.
// ═══════════════════════════════════════════════════════════════

function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': request ? (request.headers.get('Origin') || '*') : '*',
    }
  });
}

// ── base64url / PEM ─────────────────────────────────────────────
function b64urlFromBytes(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function pemToDer(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/g, '').replace(/-----END [^-]+-----/g, '').replace(/\s+/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Google OAuth (service account) ──────────────────────────────
let tokenCache = { token: '', expires: 0 };

async function signJwt(claims, privateKeyPem) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const enc = new TextEncoder();
  const data = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(claims));
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(privateKeyPem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(data)));
  return data + '.' + b64urlFromBytes(sig);
}

async function getAccessToken(saJson) {
  if (tokenCache.token && Date.now() < tokenCache.expires - 120000) return tokenCache.token;
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJwt({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }, sa.private_key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + encodeURIComponent(jwt),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error('OAuth token failed: ' + JSON.stringify(data));
  tokenCache = { token: data.access_token, expires: Date.now() + (data.expires_in || 3600) * 1000 };
  return data.access_token;
}

function firestoreUrl(saJson, suffix) {
  return `https://firestore.googleapis.com/v1/projects/${JSON.parse(saJson).project_id}/databases/(default)/documents${suffix}`;
}

// ── Firestore value <-> JS ──────────────────────────────────────
function toFirestoreValue(v) {
  if (v === null || typeof v === 'undefined') return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === 'object') {
    const fields = {};
    for (const k in v) fields[k] = toFirestoreValue(v[k]);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const k in obj) fields[k] = toFirestoreValue(obj[k]);
  return fields;
}

function fromFirestoreValue(v) {
  if (v === null || typeof v !== 'object') return v;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return { seconds: Math.floor(new Date(v.timestampValue).getTime() / 1000), nanos: 0 };
  if (v.nullValue !== undefined) return null;
  if (v.arrayValue !== undefined) return (v.arrayValue.values || []).map(fromFirestoreValue);
  if (v.mapValue !== undefined) {
    const o = {};
    for (const k in (v.mapValue.fields || {})) o[k] = fromFirestoreValue(v.mapValue.fields[k]);
    return o;
  }
  return null;
}

function fromFirestoreDoc(doc) {
  const o = { id: doc.name.split('/').pop() };
  for (const k in (doc.fields || {})) o[k] = fromFirestoreValue(doc.fields[k]);
  return o;
}

async function firestoreAdd(collection, fields, saJson) {
  const token = await getAccessToken(saJson);
  const res = await fetch(firestoreUrl(saJson, '/' + collection), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(fields) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Firestore add failed: ' + JSON.stringify(data));
  return data.name.split('/').pop();
}

async function firestorePatch(collection, docId, fields, saJson) {
  const token = await getAccessToken(saJson);
  const mask = Object.keys(fields).map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&');
  const res = await fetch(`${firestoreUrl(saJson, '/' + collection + '/' + encodeURIComponent(docId))}?${mask}`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(fields) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Firestore patch failed: ' + JSON.stringify(data));
  return data;
}

async function firestoreRunQuery(field, value, saJson) {
  const token = await getAccessToken(saJson);
  const res = await fetch(firestoreUrl(saJson, ':runQuery'), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'orders' }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } },
        limit: 50,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Firestore query failed: ' + JSON.stringify(data));
  return (Array.isArray(data) ? data : []).filter(d => d.document).map(d => fromFirestoreDoc(d.document));
}

// ── PayPal ──────────────────────────────────────────────────────
function paypalBaseUrl(env) {
  return (env.PAYPAL_ENV || 'live') === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}
function paypalHeaders(env) {
  const auth = 'Basic ' + btoa(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_CLIENT_SECRET);
  return { 'Content-Type': 'application/json', Authorization: auth };
}
async function paypalCapture(orderID, env) {
  const res = await fetch(`${paypalBaseUrl(env)}/v2/checkout/orders/${orderID}/capture`, {
    method: 'POST',
    headers: paypalHeaders(env),
    body: '{}',
  });
  const data = await res.json();
  if (!res.ok) throw new Error('PayPal capture failed: ' + (data.message || res.status));
  return data;
}

// ── Resend ──────────────────────────────────────────────────────
async function sendResend(env, payload) {
  if (!env.RESEND_API_KEY) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('Resend failed:', res.status, await res.text());
  } catch (err) {
    console.error('Resend error:', err);
  }
}

// ── POST /verify-payment ────────────────────────────────────────
async function handleVerifyPayment(request, env) {
  if (!isAuthenticated(request, env)) return jsonError('Unauthorized', 401, request);
  if (!env.GOOGLE_SA_JSON) return jsonError('Firestore not configured (missing GOOGLE_SA_JSON)', 503, request);
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) return jsonError('PayPal not configured', 503, request);

  let data;
  try {
    data = JSON.parse(await request.text());
  } catch {
    return jsonError('Invalid JSON body', 400, request);
  }

  const orderID = data && data.orderID;
  const product = data && data.product;
  const plan = (data && data.plan) || '';
  const carrier = (data && data.carrier) || '';
  const birthData = (data && data.birthData) || null;
  const uid = (data && data.uid) || '';
  const email = (data && data.email) || '';

  if (!orderID || typeof orderID !== 'string') return jsonError('Missing orderID', 400, request);
  if (product !== 'instant_report' && product !== 'treasure_match') return jsonError('Unknown product: ' + product, 400, request);
  if (!uid) return jsonError('Missing uid', 400, request);

  // Idempotency: a PayPal order id must map to one of our orders.
  try {
    const existingOrders = await firestoreRunQuery('paypalOrderId', orderID, env.GOOGLE_SA_JSON);
    if (existingOrders.length) {
      return json({ orderId: existingOrders[0].id, alreadyProcessed: true, status: existingOrders[0].status }, 200, request);
    }
  } catch (e) {
    return jsonError('Order check failed: ' + e.message, 502, request);
  }

  // Expected amount server-side: base price minus any valid 7-day credit.
  let expectedAmount = product === 'instant_report' ? 29 : 199;
  let creditApplied = 0;
  let creditFromOrderId = null;
  if (product === 'treasure_match') {
    try {
      const orders = await firestoreRunQuery('userId', uid, env.GOOGLE_SA_JSON);
      const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
      for (const o of orders) {
        if (o.product !== 'instant_report' || o.status !== 'paid' || o.redeemedFor) continue;
        const created = o.createdAt && o.createdAt.seconds ? new Date(o.createdAt.seconds * 1000) : null;
        if (created && created.getTime() >= cutoff) {
          creditApplied = 29;
          creditFromOrderId = o.id;
          break;
        }
      }
      expectedAmount = Math.max(29, expectedAmount - creditApplied);
    } catch (e) {
      // credit lookup failed — fall through with full price; the charge still succeeds
    }
  }

  let capture;
  try {
    capture = await paypalCapture(orderID, env);
  } catch (e) {
    return jsonError(e.message, 502, request);
  }
  if (capture.status !== 'COMPLETED') {
    return jsonError('Payment is not completed (' + capture.status + ')', 402, request);
  }

  const unit = capture.purchase_units && capture.purchase_units[0];
  const cap = unit && unit.payments && unit.payments.captures && unit.payments.captures[0];
  const value = cap && cap.amount ? parseFloat(cap.amount.value) : 0;
  const currency = cap && cap.amount ? cap.amount.currency_code : 'USD';
  if (Math.abs(value - expectedAmount) > 0.01 || currency !== 'USD') {
    return jsonError(`Amount mismatch: expected ${expectedAmount} USD, received ${value} ${currency}`, 402, request);
  }

  // Write the order (server-side, bypasses client Firestore rules).
  let orderId;
  try {
    orderId = await firestoreAdd('orders', {
      userId: uid,
      email,
      product,
      plan,
      carrier,
      amount: value,
      currency: currency || 'USD',
      paypalOrderId: orderID,
      status: 'paid',
      creditApplied,
      creditFromOrderId: creditFromOrderId || null,
      birthData,
      verifiedAt: new Date(),
      createdAt: new Date(),
    }, env.GOOGLE_SA_JSON);

    if (creditFromOrderId) {
      await firestorePatch('orders', creditFromOrderId, { redeemedFor: orderId }, env.GOOGLE_SA_JSON);
    }

    // $199 unlocks full membership: 36 dream credits.
    if (product === 'treasure_match') {
      await firestorePatch('users', uid, { plan: 'paid', dreamLimit: 36, upgradedAt: new Date() }, env.GOOGLE_SA_JSON);
    }
  } catch (e) {
    return jsonError('Order save failed: ' + e.message, 502, request);
  }

  // ── Emails ────────────────────────────────────────────────────
  const from = env.RESEND_FROM || 'Oriental Destiny <onboarding@resend.dev>';
  const base = 'https://oriental-destiny.com';

  if (product === 'instant_report') {
    await sendResend(env, {
      from,
      to: [email],
      subject: 'Your Complete BaZi Reading — $29 order confirmed',
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#241915;line-height:1.7;">
        <h2 style="color:#a63a2c;">Your reading is ready.</h2>
        <p>Thanks for ordering the Complete BaZi Reading. Your full report is available from your dashboard:</p>
        <p><a href="${base}/report_viewer.html" style="display:inline-block;padding:12px 24px;background:#a63a2c;color:#fff;border-radius:8px;text-decoration:none;">Open My Reading</a></p>
        <p style="color:#666;font-size:13px;">Your report is saved under <em>BaZi Reports</em> in your dashboard whenever you sign in.</p>
      </div>`,
    });
  } else {
    // $199 is fulfilled manually: notify the seller only — the seller prepares
    // the annotated report and emails it to the customer from a personal inbox.
    // (The customer sees the thanks/告知 page with the chart snapshot link.)
    await sendResend(env, {
      from,
      to: [env.SELLER_EMAIL || '434338480@qq.com'],
      subject: `NEW $199 ORDER — ${plan || ''} / ${carrier || ''} (${email})`,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#241915;line-height:1.6;">
        <h2 style="color:#a63a2c;">New $199 order — please fulfill within 6 hours.</h2>
        <p><strong>Customer email:</strong> ${email}</p>
        <p><strong>User uid:</strong> ${uid}<br>
           <strong>Order id:</strong> ${orderId}<br>
           <strong>Amount:</strong> $${value} USD${creditApplied ? ` (credit applied $${creditApplied})` : ''}<br>
           <strong>Focus:</strong> ${plan || ''}<br>
           <strong>Form:</strong> ${carrier || ''}</p>
        <p><strong>Birth data:</strong></p>
        <pre style="background:#f6f0e6;padding:8px;border-radius:6px;">${JSON.stringify(birthData || {}, null, 2)}</pre>
        <p><strong>Steps:</strong> (1) read the chart, (2) prepare the annotated report + treasure recommendation, (3) email the report to the customer from your personal inbox, (4) after the customer confirms the recommendation, ship.</p>
      </div>`,
    });
  }

  return json({ orderId, alreadyProcessed: false, status: 'paid' }, 200, request);
}

// ── POST /lead ──────────────────────────────────────────────────
const leadRateMap = new Map(); // per-instance coarse limiter

async function handleLead(request, env) {
  if (!isAuthenticated(request, env)) return jsonError('Unauthorized', 401, request);
  if (!env.GOOGLE_SA_JSON) return jsonError('Firestore not configured (missing GOOGLE_SA_JSON)', 503, request);

  let data;
  try {
    data = JSON.parse(await request.text());
  } catch {
    return jsonError('Invalid JSON body', 400, request);
  }

  const email = String((data && data.email) || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return jsonError('Invalid email address', 400, request);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const entry = leadRateMap.get(ip);
  if (entry && now - entry.t < 60 * 1000) {
    if (entry.n >= 3) return jsonError('Too many attempts. Please try again later.', 429, request);
    entry.n++;
  } else {
    leadRateMap.set(ip, { t: now, n: 1 });
  }

  try {
    await firestoreAdd('leads', {
      email,
      source: String((data && data.source) || 'free_reading'),
      userUid: (data && data.uid) || null,
      createdAt: new Date(),
    }, env.GOOGLE_SA_JSON);
  } catch (e) {
    return jsonError('Lead save failed: ' + e.message, 502, request);
  }

  return json({ ok: true }, 200, request);
}

// ═══════════════════════════════════════════════════════════════
// INPUT VALIDATION — reject obviously malicious payloads
// ═══════════════════════════════════════════════════════════════
const MAX_MESSAGE_LENGTH = 60000;  // characters per message (was 8000 — too low; full chartData JSON is ~44k chars)
const MAX_MESSAGES = 20;           // messages per request
const MAX_TOKENS = 4000;           // max output tokens per request

function validatePayload(body) {
  try {
    const data = JSON.parse(body);
    // Must have messages array
    if (!Array.isArray(data.messages) || data.messages.length === 0) return 'Empty or missing messages array';
    if (data.messages.length > MAX_MESSAGES) return `Too many messages (max ${MAX_MESSAGES})`;
    // Check each message
    for (const msg of data.messages) {
      if (!msg.role || !msg.content) return 'Each message must have role and content';
      if (typeof msg.content === 'string' && msg.content.length > MAX_MESSAGE_LENGTH) {
        return `Message too long (max ${MAX_MESSAGE_LENGTH} chars)`;
      }
    }
    // Token cap
    if (data.max_tokens && data.max_tokens > MAX_TOKENS) {
      return `max_tokens too high (max ${MAX_TOKENS})`;
    }
    return null; // valid
  } catch {
    return 'Invalid JSON body';
  }
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════
export default {
  async fetch(request, env, ctx) {
    // ── CORS preflight ──────────────────────────────────────
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin') || '*';
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Client-Secret',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // ── Route: POST /verify-payment → PayPal capture + Firestore order ──
    const url = new URL(request.url);
    if (url.pathname.endsWith('/verify-payment')) {
      return handleVerifyPayment(request, env);
    }

    // ── Route: POST /lead → collect email (save my chart) ────
    if (url.pathname.endsWith('/lead')) {
      return handleLead(request, env);
    }

    // ── Route: POST /send-report → email report to seller ────
    if (url.pathname.endsWith('/send-report')) {
      return handleSendReport(request, env);
    }

    // ── Route: POST /chat/completions → DeepSeek proxy ───────
    if (request.method !== 'POST' || !url.pathname.endsWith('/chat/completions')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ── Authentication (replaces broken Origin check) ───────
    if (!isAuthenticated(request, env)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        }
      });
    }

    // ── Rate limit ──────────────────────────────────────────
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        }
      });
    }

    // ── Read & validate body ────────────────────────────────
    const body = await request.text();
    const validationError = validatePayload(body);
    if (validationError) {
      return new Response(JSON.stringify({ error: 'Bad request: ' + validationError }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        }
      });
    }

    // ── Proxy to DeepSeek ───────────────────────────────────
    try {
      const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
          'Accept': 'application/json',
        },
        body
      });

      const responseBody = await deepseekRes.text();

      return new Response(responseBody, {
        status: deepseekRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Proxy error: ' + err.message }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        }
      });
    }
  }
};
