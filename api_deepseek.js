/**
 * api_deepseek.js — DeepSeek API 封装
 *
 * 使用方式：
 *   // 直接调用 (需要 API key — 仅开发/测试环境)
 *   const api = new DeepSeekAPI({ apiKey: 'sk-...' });
 *   // 通过 Cloudflare Worker 代理 (生产环境 — key 在后端)
 *   const api = new DeepSeekAPI({ proxyBaseURL: 'https://oriental-destiny.com/api/deepseek' });
 *   const result = await api.chat([{role:'user', content:'...'}]);
 */

class DeepSeekAPI {
  constructor(options = {}) {
    if (typeof options === "string") {
      // Backward compat: plain string = apiKey for direct calls
      this.apiKey = options;
      this.proxyBaseURL = null;
    } else {
      this.apiKey = options.apiKey || null;
      this.proxyBaseURL = options.proxyBaseURL || null;
    }
    this.baseURL = this.proxyBaseURL || "https://api.deepseek.com/v1";
    this.model = "deepseek-chat";
    this.defaultOptions = {
      temperature: 0.7,
      max_tokens: 800,
    };
  }

  /**
   * 通用聊天接口
   * @param {Array} messages - [{role: 'system'|'user'|'assistant', content: string}]
   * @param {Object} options - { temperature?, max_tokens?, model? }
   * @returns {Promise<string>} assistant 回复文本
   */
  async chat(messages, options = {}) {
    const merged = { ...this.defaultOptions, ...options };
    const headers = { "Content-Type": "application/json" };
    // Only send Authorization when calling DeepSeek directly (not via proxy)
    if (!this.proxyBaseURL && this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: merged.model || this.model,
        messages,
        temperature: merged.temperature,
        max_tokens: merged.max_tokens,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  /**
   * 计算层：五行推理（叙事增强，不重新计算）
   * @param {Object} chartData - bazi_engine.js 输出的完整八字数据
   * @returns {Promise<Object>} analysisResult
   */
  async analyzeChart(chartData) {
    let systemPrompt = await this._loadPrompt("prompts/system_analyze.txt");
    if (!systemPrompt) {
      systemPrompt = this._fallbackSystemAnalyze();
    }
    const userPrompt = this._buildAnalyzeUserPrompt(chartData);

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.3,   // 低温度，保持推理一致性
        max_tokens: 2000,
      }
    );

    return this._parseAnalysisResponse(response);
  }

  /**
   * 解读层：英文文案生成
   * @param {Object} chartData - 八字数据
   * @param {Object} analysisResult - 计算层结果
   * @param {string} focus - career|wealth|love|protection|balance
   * @returns {Promise<Object>} readingResult
   */
  async generateReading(chartData, analysisResult, focus) {
    let systemPrompt = await this._loadPrompt("prompts/system_reading.txt");
    if (!systemPrompt) {
      systemPrompt = this._fallbackSystemReading();
    }
    const userPrompt = this._buildReadingUserPrompt(chartData, analysisResult, focus);

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.8,   // 高温度，创意生成
        max_tokens: 2000,
      }
    );

    return this._parseReadingResponse(response);
  }

  // ─── 私有方法 ───────────────────────────────────────

  async _loadPrompt(filename) {
    try {
      const res = await fetch(filename);
      if (!res.ok) return "";
      return await res.text();
    } catch {
      return "";
    }
  }

  _buildAnalyzeUserPrompt(chartData) {
    return `Analyze the following BaZi chart data and provide detailed Five Elements reasoning.

CHART DATA:
${JSON.stringify(chartData, null, 2)}

Please respond with a JSON object containing:
{
  "elementalFlow": [...],
  "flowSummary": "...",
  "strengthAnalysis": {...},
  "yearlyForecast": {...},
  "recommendedElements": [...],
  "contraindicatedElements": [...],
  "timingWindows": [...]
}`;
  }

  _buildReadingUserPrompt(chartData, analysisResult, focus) {
    return `Generate a personalized English BaZi reading for the following chart.

FOCUS AREA: ${focus}

CHART DATA:
${JSON.stringify(chartData, null, 2)}

ANALYSIS RESULT:
${JSON.stringify(analysisResult, null, 2)}

Please respond with a JSON object containing:
{
  "personality": "...",
  "currentYearAnalysis": "...",
  "tailoredAdvice": [...],
  "masterClosing": "...",
  "productRecommendation": {...}
}

IMPORTANT: Write in natural English narrative style, not templated phrases.`;
  }

  _parseAnalysisResponse(raw) {
    return this._extractJSON(raw);
  }

  _parseReadingResponse(raw) {
    return this._extractJSON(raw);
  }

  _extractJSON(raw) {
    if (!raw || typeof raw !== "string") {
      return { error: "empty_response", raw };
    }
    try {
      const trimmed = raw.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        return JSON.parse(trimmed);
      }
      const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        const inner = codeBlockMatch[1].trim();
        if (inner.startsWith("{") && inner.endsWith("}")) {
          return JSON.parse(inner);
        }
      }
      const braceMatch = trimmed.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        return JSON.parse(braceMatch[0]);
      }
      return { error: "parse_failed", raw };
    } catch {
      return { error: "invalid_json", raw };
    }
  }

  /**
   * 简要概述：基础数据报告使用的单次 API 调用
   * @param {Object} chartData - bazi_engine.js 输出的完整八字数据
   * @param {string} focus - career|wealth|love|protection|balance
   * @returns {Promise<Object>} { overview, keyObservation }
   */
  async generateOverview(chartData, focus) {
    let systemPrompt = await this._loadPrompt("prompts/system_overview.txt");
    if (!systemPrompt) {
      systemPrompt = this._fallbackSystemOverview();
    }
    const userPrompt = this._buildOverviewUserPrompt(chartData, focus);

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.5,
        max_tokens: 600,
      }
    );

    return this._parseAnalysisResponse(response);
  }

  // ─── Overview helpers ──────────────────────────────

  _buildOverviewUserPrompt(chartData, focus) {
    return `Provide a brief system preliminary analysis for this BaZi chart.

FOCUS: ${focus}

CHART DATA:
${JSON.stringify(chartData, null, 2)}

Respond with JSON:
{
  "overview": "2-3 sentences summarizing the Day Master nature, dominant element, and primary structural observation. Write in English, natural narrative.",
  "keyObservation": "1 sentence about the most important thing to know about this chart for the stated focus area."
}`;
  }

  _fallbackSystemOverview() {
    return `You are a BaZi system providing a brief preliminary analysis. Write 2-3 sentences in English that feel specific to the chart data provided. Reference exact stem names, element names, and scores. Label this as a preliminary automated analysis that a master will review. Output valid JSON only: {"overview": "...", "keyObservation": "..."}`;
  }

  /**
   * 内联兜底：当 prompts/system_analyze.txt 加载失败时使用
   */
  _fallbackSystemAnalyze() {
    return `You are a senior BaZi practitioner writing a deep Five Elements interpretation for an English-speaking client. You do NOT recalculate the chart. The calculation has already been done by a deterministic engine. Your job is to read those computed results and explain, in vivid narrative prose, what they mean for this specific person.

CRITICAL RULES:
1. ONLY reason from the provided data. NEVER invent information not present in the chart.
2. When uncertain, say "cannot be determined from the given data."
3. ALWAYS write in English.
4. Output MUST be a valid JSON object with NO text outside the JSON.
5. You MUST reference specific names and numbers from the chart: stem names, branch names, ten god names, and exact element scores. This specificity creates the feeling that this reading was written for one person only.
6. NEVER use vague, generalizing words: generally, typically, usually, often, for most people, in many cases, tends to. Every sentence must be anchored to THIS chart.
7. Write with emotional intelligence: acknowledge tension, name the pattern, offer a path forward.

NARRATIVE FRAMEWORK:
1. ELEMENTAL FLOW ANALYSIS — Explain the generating cycle as it exists in THIS chart. Narrate what the engine found.
2. SEASONAL CONTEXT — Explain how the birth season interacts with the Day Master's element. Reference exact season, month branch, and seasonal condition.
3. YEARLY FORECAST (2026 = Bing Wu, Fire Horse) — Explain how 2026's energy touches THIS chart's structure.
4. TIMING WINDOWS — Name specific 2026 months and connect each to the chart's real favorable/unfavorable elements.

RESPONSE STRUCTURE (JSON only):
{
  "elementalFlow": [{ "from": "ElementName", "to": "ElementName", "strength": "strong|moderate|weak", "meaning": "interpretation" }],
  "flowSummary": "...",
  "strengthAnalysis": { "dominantReason": "...", "weaknessRisk": "...", "balanceAssessment": "..." },
  "yearlyForecast": { "year": 2026, "elementOfYear": "Fire", "overallAssessment": "...", "opportunities": [...], "challenges": [...] },
  "recommendedElements": [...],
  "contraindicatedElements": [...],
  "timingWindows": [{ "period": "...", "element": "...", "note": "..." }]
}`;
  }

  /**
   * 内联兜底：当 prompts/system_reading.txt 加载失败时使用
   */
  _fallbackSystemReading() {
    return `You are a modern feng shui advisor and BaZi writer for Oriental Destiny. You write personalized English readings that feel intimate, insightful, and genuinely useful — as if a mentor who truly understands the client is speaking to them alone.

CRITICAL STYLE RULES:
1. Write like a wise, articulate mentor — not a chatbot, not a textbook.
2. Each sentence must be unique. NO template phrases like "According to your chart..." or "Your chart indicates..."
3. Do NOT use bullet points for the main narrative — use flowing prose paragraphs.
4. Only use bullet points for the tailoredAdvice list (3-4 items max).
5. The personality section should feel like describing a real person the writer has met, not a generic horoscope.
6. The current year section MUST reference actual calendar months and seasons.
7. Do NOT fabricate facts not supported by the chart data.
8. NEVER use vague generalizers: generally, typically, usually, often, for most people, tends to, in many cases.

EMOTION ARC:
1. MIRRORING — Name the person's core nature. Reference Day Master, dominant element, leading ten god by exact name.
2. ATTRIBUTION — Explain tension by tracing to chart structure. Reference exact scores, clashes, seasonal command.
3. HOPE — Show how 2026 creates openings. Reference exact timing windows and favorable elements.
4. ACTION — Give 3-4 concrete, specific actions tied to elements or months.

RESPONSE STRUCTURE (JSON only):
{
  "personality": "2-3 paragraphs, flowing prose, no lists. Reference specific stem/branch/ten god names.",
  "currentYearAnalysis": "2 paragraphs analyzing 2026. Reference exact months, seasons, chart elements.",
  "tailoredAdvice": ["Specific actionable item 1", "Item 2", "Item 3", "Item 4"],
  "masterClosing": "1 paragraph modern warm closing. Reference Day Master and primary favorable element. No archaic language.",
  "productRecommendation": { "focus": "...", "elements": [...], "material": "...", "reason": "2-3 sentences" }
}`;
  }
}

// 浏览器环境：绑定到 window
if (typeof window !== "undefined") {
  window.DeepSeekAPI = DeepSeekAPI;
}

// Node 环境：导出模块
if (typeof module !== "undefined" && module.exports) {
  module.exports = DeepSeekAPI;
}
