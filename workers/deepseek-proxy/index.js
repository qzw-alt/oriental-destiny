/**
 * workers/deepseek-proxy/index.js
 *
 * Cloudflare Worker for Oriental Destiny.
 *
 * Endpoints:
 *   POST /chat/completions  — Backward-compatible DeepSeek proxy (BaZi readings)
 *   POST /dream-interpret   — Two-call dream interpretation pipeline
 *
 * Deploy:
 *   wrangler secret put DEEPSEEK_API_KEY
 *   wrangler deploy
 */

import {
  normalizeSymbols,
  scoreFiveElements,
  analyzeDreamMotion,
  detectElementRelations,
  matchWithChart,
  compileAnalysis,
  validateReport,
  buildFallbackReport,
  heuristicExtraction,
} from "../../dream-engine/rule_engine.js";

// Load symbol rules at module init (cached by Worker runtime)
let rulesDB = null;
async function loadRules() {
  if (rulesDB) return rulesDB;
  try {
    // In Worker, rules are bundled as a JS module export
    const mod = await import("../../dream-engine/symbol_rules.json");
    rulesDB = mod.default || mod;
  } catch {
    // Fallback: fetch from same origin (for dev without bundling)
    try {
      const res = await fetch("https://oriental-destiny.com/dream-engine/symbol_rules.json");
      rulesDB = await res.json();
    } catch {
      rulesDB = { symbols: [], forbidden_terms: [] };
    }
  }
  return rulesDB;
}

// =============================================================================
// CORS & Helpers
// =============================================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// =============================================================================
// POST /chat/completions — Backward Compatible DeepSeek Proxy
// =============================================================================

async function handleChatCompletions(request, env) {
  const body = await request.json();
  const apiKey = env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return jsonResponse({ error: "API key not configured on server" }, 500);
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: body.model || "deepseek-chat",
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 800,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return jsonResponse({ error: "DeepSeek API error", detail: data }, response.status);
  }

  return jsonResponse(data);
}

// =============================================================================
// POST /dream-interpret — Two-Call Dream Pipeline
// =============================================================================

async function handleDreamInterpret(request, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return jsonResponse({ status: "error", error: "API key not configured" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ status: "error", error: "Invalid JSON body" }, 400);
  }

  const { dream, tier, chartData } = body;

  // Validate input
  if (!dream || typeof dream !== "string" || dream.trim().length < 10) {
    return jsonResponse({ status: "error", error: "Dream text must be at least 10 characters" }, 400);
  }
  if (dream.length > 2000) {
    return jsonResponse({ status: "error", error: "Dream text too long (max 2000 characters)" }, 400);
  }
  if (tier && !["basic", "deep"].includes(tier)) {
    return jsonResponse({ status: "error", error: "Tier must be 'basic' or 'deep'" }, 400);
  }
  const effectiveTier = tier || "basic";

  const rules = await loadRules();

  // ── Phase 1: DeepSeek Call 1 — Symbol Extraction ──────────────────────

  let extraction;
  try {
    extraction = await deepseekExtract(dream, apiKey);
  } catch (err) {
    console.error("Call 1 failed, using heuristic fallback:", err.message);
    extraction = heuristicExtraction(dream, rules);
  }

  // ── Phase 2: Rule Engine ──────────────────────────────────────────────

  const normalizedSymbols = normalizeSymbols(extraction.symbols || [], rules);
  const elementScores = scoreFiveElements(normalizedSymbols);
  const motionAnalysis = analyzeDreamMotion(
    normalizedSymbols,
    extraction.narrative_pattern,
    extraction.resolution
  );
  const elementRelations = detectElementRelations(elementScores);

  // Chart matching — only for deep tier with valid chart data
  const chartMatch = effectiveTier === "deep" && chartData
    ? matchWithChart(elementScores, chartData)
    : {
        chart_match_type: "basic_only",
        chart_connection: null,
        advice_direction: ["稳定作息", "整理居住环境", "记录重复梦境"],
        jewelry_context: null,
      };

  // Compile the full analysis
  const analysis = compileAnalysis(
    { dream_text: dream, dominant_emotion: extraction.dominant_emotion, narrative_pattern: extraction.narrative_pattern, resolution: extraction.resolution, summary: extraction.summary },
    normalizedSymbols,
    elementScores,
    motionAnalysis,
    elementRelations,
    chartMatch
  );

  // ── Phase 3: DeepSeek Call 2 — Report Generation ──────────────────────

  let report;
  let reportOk = false;

  try {
    report = await deepseekWriteReport(analysis, apiKey);
  } catch (err) {
    console.error("Call 2 attempt 1 failed:", err.message);
    report = null;
  }

  // Validate
  if (report) {
    const validation = validateReport(report, effectiveTier, rules);
    if (!validation.valid) {
      console.error("Validation failed:", validation.errors);
      // Retry once with stronger constraints
      try {
        report = await deepseekWriteReport(analysis, apiKey, true);
        const recheck = validateReport(report, effectiveTier, rules);
        if (recheck.valid) {
          reportOk = true;
        } else {
          console.error("Retry validation also failed:", recheck.errors);
          report = null;
        }
      } catch {
        report = null;
      }
    } else {
      reportOk = true;
    }
  }

  // Fallback
  if (!reportOk || !report) {
    report = buildFallbackReport(analysis, effectiveTier);
  }

  // ── Return ────────────────────────────────────────────────────────────

  return jsonResponse({
    status: "ok",
    tier: effectiveTier,
    source: reportOk ? "ai" : "fallback",
    report,
    analysis: {
      symbols: analysis.symbols,
      element_scores: analysis.element_scores,
      dominant_element: analysis.dominant_element,
      element_diagnosis: analysis.element_diagnosis,
      dream_motion: analysis.dream_motion,
      chart_match_type: analysis.chart_match_type,
      advice_direction: analysis.advice_direction,
      jewelry_context: analysis.jewelry_context,
    },
  });
}

// =============================================================================
// DeepSeek API Helpers
// =============================================================================

/**
 * Call 1: Extract dream symbols as structured JSON.
 */
async function deepseekExtract(dreamText, apiKey) {
  const systemPrompt = `你是梦境结构化分析助手，不负责解梦结论。
你的任务是从用户梦境中提取梦象、人物、场景、动作、情绪和叙事模式。
必须输出合法 JSON。
不要输出玄学判断、预言、建议或安慰。
不要编造用户没有提到的内容。

JSON schema:
{
  "summary": "一句话概括梦境内容",
  "symbols": [
    {
      "raw": "原始文本中的梦象名称",
      "normalized": "标准化英文名称",
      "category": "natural|animal|people|place|object|action|emotion",
      "importance": 1-5的数字,
      "emotional_tone": "fear|anxiety|sadness|anger|joy|peace|neutral"
    }
  ],
  "people": ["人物描述"],
  "places": ["地点描述"],
  "actions": ["动作描述"],
  "dominant_emotion": "最主要的情绪",
  "narrative_pattern": "trapped|escape|chase|falling|flying|recurring|transformation|descending|rising|flowing|unknown",
  "resolution": "resolved|partially_resolved|unresolved"
}

重要：narrative_pattern 必须从提供的枚举值中选择，不要自己编造。`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `请分析以下梦境的梦象结构：\n\n"${dreamText}"\n\n输出合法JSON。` },
  ];

  const raw = await callDeepSeek(messages, apiKey, { temperature: 0.25, max_tokens: 800 });
  return extractJSON(raw);
}

/**
 * Call 2: Write the final dream interpretation report.
 */
async function deepseekWriteReport(analysis, apiKey, strictMode = false) {
  const tierNote = analysis.report_type === "basic"
    ? "重要：这是免费版报告（report_type: basic），不要提到完整命盘对应、日主、喜用神、忌神、八字四柱、大运流年。不要推荐具体饰品。"
    : "这是付费版报告（report_type: deep），必须体现命盘与梦象五行的对应关系。可以推荐饰品、颜色、材质。";

  const strictNote = strictMode
    ? "\n\n严格约束：输出必须是合法JSON。每个字段都必须有内容。不得使用任何绝对化预言词汇。不得编造梦象以外的五行信息。"
    : "";

  const systemPrompt = `你是东方命理解梦报告撰写助手。
你只负责根据输入的结构化测算结果撰写报告，不得改变测算结论。
必须使用温和、具体、东方五行命理风格的中文。
不得使用恐吓、绝对预言、医疗诊断、心理诊断。
不得编造命盘资料。
不得使用"大凶""必死""灾祸""一定破财""血光之灾""必定倒霉"等恐吓性词汇。
${tierNote}
输出必须是合法 JSON。${strictNote}

JSON schema:
{
  "title": "报告标题，含五行元素和梦势特征",
  "summary": "2-3句话概括梦境与核心解读",
  "core_symbols": "1-2段解读核心梦象及其五行归属",
  "five_element_reading": "1-2段解读五行分布、生克关系和梦势意义",
  "chart_connection": "1段解读梦境五行与命盘喜忌的对应关系（deep版必须写，basic版写空字符串）",
  "real_life_reflection": "1-2段将梦象映射到现实生活的可能领域",
  "adjustment_advice": "3-5条具体可行的调理建议，每条一行以·开头" + (analysis.report_type === "deep" ? "，包含饰品/颜色/材质建议" : ""),
  "closing": "1段温暖有力的结语"
}`;

  const userPrompt = `请根据以下结构化测算结果撰写解梦报告：

梦境摘要：${analysis.dream_summary}

核心梦象与五行属性：
${JSON.stringify(analysis.symbols, null, 2)}

五行评分：${JSON.stringify(analysis.element_scores)}
主导元素：${analysis.dominant_element}
五行诊断：${analysis.element_diagnosis}
五行诊断含义：${analysis.element_diagnosis_meaning || ""}

梦势：${analysis.dream_motion}（${analysis.dream_motion_desc || ""}）
梦境是否解决：${analysis.dream_motion_resolved ? "是" : "否"}
梦势基调：${analysis.dream_tone}

核心主题：${analysis.core_theme}

${analysis.chart_connection ? `命盘对应：${analysis.chart_connection}` : ""}

调理方向：${(analysis.advice_direction || []).join("、")}
${analysis.jewelry_context ? `推荐元素：${(analysis.jewelry_context.recommended_elements || []).join("、")}
推荐颜色：${(analysis.jewelry_context.colors || []).join("、")}
推荐材质：${(analysis.jewelry_context.materials || []).join("、")}` : ""}

report_type: ${analysis.report_type}

请输出合法JSON报告。`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const raw = await callDeepSeek(messages, apiKey, { temperature: 0.75, max_tokens: 1500 });
  return extractJSON(raw);
}

/**
 * Core DeepSeek API call with timeout.
 */
async function callDeepSeek(messages, apiKey, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000); // 12s per-call timeout

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from DeepSeek");
    }
    return content.trim();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Extract JSON from DeepSeek response, handling various formats.
 */
function extractJSON(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty response");
  }

  const trimmed = raw.trim();

  // Direct JSON
  try {
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return JSON.parse(trimmed);
    }
  } catch { /* continue */ }

  // Markdown code block
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeMatch) {
    try {
      return JSON.parse(codeMatch[1].trim());
    } catch { /* continue */ }
  }

  // Brace extraction
  const braceMatch = trimmed.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch { /* continue */ }
  }

  throw new Error(`Failed to parse JSON from: ${trimmed.substring(0, 200)}`);
}

// =============================================================================
// Router
// =============================================================================

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return corsPreflight();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "POST" && path === "/chat/completions") {
      return handleChatCompletions(request, env);
    }

    if (request.method === "POST" && path === "/dream-interpret") {
      return handleDreamInterpret(request, env);
    }

    // Health check / root
    if (request.method === "GET" && (path === "/" || path === "/health")) {
      return jsonResponse({ status: "ok", service: "oriental-destiny-deepseek-proxy", version: "2.0.0" });
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
