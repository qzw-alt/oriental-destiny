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
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ model: 'deepseek-chat', messages: [...], temperature: 0.7, max_tokens: 800 })
 *   })
 */

// ═══════════════════════════════════════════════════════════════
// CONFIG — API key is injected via wrangler secret or .dev.vars
// NEVER hardcode real keys here. This file is tracked in git.
//   Local dev:   set key in .dev.vars (gitignored)
//   Production:  wrangler secret put DEEPSEEK_API_KEY
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

// Periodic cleanup (every 5 min) to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [ip, entry] of rateMap) {
    if (entry.windowStart < cutoff) rateMap.delete(ip);
  }
}, 300_000);

// ═══════════════════════════════════════════════════════════════
// ORIGIN-CHECK — only allow requests from your domain
// ═══════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
  'https://oriental-destiny.com',
  'https://www.oriental-destiny.com',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:3000',
];

function getAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return null; // no Origin header → allow (curl, etc.)
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return null;
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════
export default {
  async fetch(request, env, ctx) {
    // ── CORS preflight ──────────────────────────────────────
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin');
      const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowed,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // ── Only allow POST to /chat/completions ────────────────
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/chat/completions') {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ── Origin check ────────────────────────────────────────
    const allowedOrigin = getAllowedOrigin(request);
    if (request.headers.get('Origin') && !allowedOrigin) {
      return new Response(JSON.stringify({ error: 'Forbidden — unknown origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
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
          ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {})
        }
      });
    }

    // ── Proxy to DeepSeek ───────────────────────────────────
    try {
      const body = await request.text();

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

      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      };
      if (allowedOrigin) {
        headers['Access-Control-Allow-Origin'] = allowedOrigin;
      }

      return new Response(responseBody, {
        status: deepseekRes.status,
        headers
      });

    } catch (err) {
      const headers = { 'Content-Type': 'application/json' };
      if (allowedOrigin) headers['Access-Control-Allow-Origin'] = allowedOrigin;

      return new Response(JSON.stringify({ error: 'Proxy error: ' + err.message }), {
        status: 502,
        headers
      });
    }
  }
};
