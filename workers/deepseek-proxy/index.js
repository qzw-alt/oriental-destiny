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

    // ── Route: POST /send-report → email report to seller ────
    const url = new URL(request.url);
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
