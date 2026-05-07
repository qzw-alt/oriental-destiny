/**
 * Cloudflare Worker — DeepSeek API Proxy for Oriental Destiny
 *
 * 部署方式：
 * 1. 登录 Cloudflare Dashboard → Workers & Pages
 * 2. 创建 Service Worker，粘贴此代码
 * 3. 设置环境变量：DEEPSEEK_API_KEY = 你的真实 API Key
 * 4. 绑定自定义域名（推荐）：api-proxy.oriental-destiny.com
 * 5. 将 worker URL 填入 website 的 config.js 中
 */

const ALLOWED_ORIGINS = [
  "https://oriental-destiny.com",
  "https://www.oriental-destiny.com",
  // 本地开发（可注释掉生产环境）
  "http://localhost:8080",
  "http://127.0.0.1:5500",
];

const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // ─── CORS 预检 ─────────────────────────────────────
    if (request.method === "OPTIONS") {
      return handleCORS(origin);
    }

    // ─── 仅允许 POST ───────────────────────────────────
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, origin);
    }

    // ─── 可选：来源校验（不阻断，只记录）───────────────
    const isAllowed = ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
    if (!isAllowed) {
      console.warn("Unexpected origin:", origin);
      // 生产环境可取消下面注释以严格阻断：
      // return jsonResponse({ error: "Forbidden origin" }, 403, origin);
    }

    // ─── 读取环境变量中的 Key ──────────────────────────
    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        { error: "Server misconfiguration: missing API key" },
        500,
        origin
      );
    }

    // ─── 构造 DeepSeek 请求 ────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400, origin);
    }

    // 安全过滤：只允许 chat/completions 端点
    const endpoint = body.endpoint || "chat/completions";
    if (endpoint !== "chat/completions") {
      return jsonResponse({ error: "Unsupported endpoint" }, 400, origin);
    }

    // 删除 body 中的 endpoint 字段，避免传给 DeepSeek
    delete body.endpoint;

    try {
      const dsResponse = await fetch(`${DEEPSEEK_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const dsData = await dsResponse.json();

      return jsonResponse(dsData, dsResponse.status, origin);
    } catch (err) {
      console.error("DeepSeek proxy error:", err);
      return jsonResponse(
        { error: "Upstream API error", detail: err.message },
        502,
        origin
      );
    }
  },
};

function handleCORS(origin) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

function corsHeaders(origin) {
  // 如果来源在允许列表中，则回显该来源；否则允许任意（或阻断）
  const allowOrigin = ALLOWED_ORIGINS.some((o) => origin.startsWith(o))
    ? origin
    : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
