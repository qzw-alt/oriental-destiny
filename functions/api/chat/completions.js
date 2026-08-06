/**
 * DeepSeek API Proxy — Cloudflare Pages Function
 *
 * Sits at /api/chat/completions on oriental-destiny.com.
 * No separate Worker domain needed — same origin, no CORS issues.
 *
 * Deploy:  git push  (deploys with the Pages site)
 *
 * Setup in Cloudflare Dashboard:
 *   Pages → oriental-destiny → Settings → Environment variables
 *   Add: DEEPSEEK_API_KEY (see .dev.vars or worker secret)
 */

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

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Rate limit
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      }
    });
  }

  // Proxy to DeepSeek
  try {
    const body = await request.text();
    const apiKey = env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured — API key missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error: ' + err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
