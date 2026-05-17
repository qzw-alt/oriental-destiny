/**
 * Cloudflare Worker — DeepSeek API Proxy
 *
 * Routes requests from /api/deepseek/* to api.deepseek.com/v1/*
 * Keeps the API key server-side so it never reaches the browser.
 *
 * Deploy:
 *   1. cd workers/deepseek-proxy
 *   2. wrangler secret put DEEPSEEK_API_KEY
 *   3. wrangler deploy
 */

const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

// Allowed origins — only our site can call this proxy
const ALLOWED_ORIGINS = [
  "https://oriental-destiny.com",
  "https://www.oriental-destiny.com",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:3000",
];

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return corsResponse(new Response(null, { status: 204 }));
    }

    // Only allow POST
    if (request.method !== "POST") {
      return corsResponse(
        new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    // Validate origin
    const origin = request.headers.get("Origin");
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return corsResponse(
        new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    // Extract the DeepSeek API path from the URL
    // e.g., /api/deepseek/chat/completions → /chat/completions
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/deepseek/, "");
    if (!path || path === "/") {
      return corsResponse(
        new Response(JSON.stringify({ error: "Bad request — no API path" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    // Read and validate the request body
    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(
        new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    // Forward to DeepSeek
    const deepseekResponse = await fetch(`${DEEPSEEK_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    // Stream the response back
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "application/json");

    return corsResponse(
      new Response(deepseekResponse.body, {
        status: deepseekResponse.status,
        headers: responseHeaders,
      })
    );
  },
};

function corsResponse(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}
