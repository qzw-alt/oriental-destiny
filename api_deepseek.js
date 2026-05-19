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
      systemPrompt = this._resolveTemplates(this._fallbackSystemAnalyze());
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
      systemPrompt = this._resolveTemplates(this._fallbackSystemReading());
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
      var text = await res.text();
      return this._resolveTemplates(text);
    } catch {
      return "";
    }
  }

  _resolveTemplates(text) {
    if (!text) return text;
    var now = new Date();
    var currentYear = now.getFullYear();
    var stemIdx = ((currentYear - 4) % 10 + 10) % 10;
    var branchIdx = ((currentYear - 4) % 12 + 12) % 12;
    var stems = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
    var branches = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];
    var elements = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
    var animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
    var yearStemBranch = stems[stemIdx] + " " + elements[stemIdx] + ", " + branches[branchIdx] + " " + animals[branchIdx];
    return text
      .replace(/\{\{CURRENT_YEAR_STEM_BRANCH\}\}/g, yearStemBranch)
      .replace(/\{\{CURRENT_YEAR\}\}/g, String(currentYear));
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
   * Outline 层：生成 7 章报告大纲
   * @param {Object} chartData - 八字数据
   * @param {string} focus - career|wealth|love|protection|balance
   * @returns {Promise<Object>} outline with 7 sections
   */
  async generateOutline(chartData, focus) {
    let systemPrompt = await this._loadPrompt("prompts/system_outline.txt");
    if (!systemPrompt) {
      systemPrompt = this._fallbackSystemOutline();
    }
    var userPrompt = 'Generate a structured 7-section report outline for the following BaZi chart.\n\n' +
      'FOCUS: ' + (focus || 'balance') + '\n\n' +
      'CHART DATA:\n' + JSON.stringify(chartData, null, 2) + '\n\n' +
      'Respond with a valid JSON object containing a "sections" key with all 7 sections as specified.';

    var response = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { temperature: 0.4, max_tokens: 2000 }
    );
    return this._extractJSON(response);
  }

  /**
   * Narrative 层：按大纲撰写完整 7 章报告
   * @param {Object} outline - 大纲 JSON
   * @param {Object} chartData - 八字数据
   * @param {string} focus - 用户关注领域
   * @returns {Promise<Object>} 完整报告
   */
  async generateNarrative(outline, chartData, focus) {
    let systemPrompt = await this._loadPrompt("prompts/system_narrative.txt");
    if (!systemPrompt) {
      systemPrompt = this._fallbackSystemNarrative();
    }
    var userPrompt = 'Write a complete 7-chapter BaZi report following the outline below.\n\n' +
      'FOCUS: ' + (focus || 'balance') + '\n\n' +
      'OUTLINE:\n' + JSON.stringify(outline, null, 2) + '\n\n' +
      'CHART DATA (for reference — use specific names and scores):\n' + JSON.stringify(chartData, null, 2) + '\n\n' +
      'Write the complete report as a valid JSON object. Every chapter must be fully written — no placeholders.';

    var response = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { temperature: 0.8, max_tokens: 3000 }
    );
    return this._extractJSON(response);
  }

  /**
   * Reviewer 层：质量检查
   * @param {Object} fullReport - 完整报告 JSON
   * @param {Object} chartData - 原始八字数据（用于核对）
   * @returns {Promise<Object>} { overall, dimensions, failedSections, rewriteInstructions }
   */
  async reviewQuality(fullReport, chartData) {
    let systemPrompt = await this._loadPrompt("prompts/system_reviewer.txt");
    if (!systemPrompt) {
      systemPrompt = this._fallbackSystemReviewer();
    }
    var userPrompt = 'Review the following BaZi report for quality.\n\n' +
      'REPORT:\n' + JSON.stringify(fullReport, null, 2) + '\n\n' +
      'ORIGINAL CHART DATA (for fact-checking):\n' + JSON.stringify(chartData, null, 2) + '\n\n' +
      'Respond with a valid JSON object containing overall verdict, dimension scores, and rewrite instructions.';

    var response = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { temperature: 0.3, max_tokens: 1500 }
    );
    return this._extractJSON(response);
  }

  // ─── Outline / Narrative / Reviewer fallbacks ──────

  _fallbackSystemOutline() {
    return 'You are a BaZi interpretation planner. Read computed chart data and produce a structured 7-section report outline. Each section must have theme, hook, evidence from chart data, and constraints for the writer. Output valid JSON only with a "sections" key containing: openingMessage, corePattern, mainTension, focusGuidance, timingWindows, masterNotes, jewelryRecommendation.';
  }

  _fallbackSystemNarrative() {
    return 'You are a modern Feng Shui advisor writing a personalized 7-chapter BaZi report. Write like a mentor who truly sees the client. Translate every BaZi term to plain English. Each chapter must end with a bold plain-language takeaway. Never use vague generalizers. Output valid JSON only with all 7 chapters fully written.';
  }

  _fallbackSystemReviewer() {
    return 'You are a quality reviewer for BaZi reports. Check specificity, plain language, actionability, groundedness in chart data, safety (no medical/legal/financial claims), and tone (mentor voice, not template). Output valid JSON: { overall: "PASS|CONDITIONAL_PASS|FAIL", dimensions: { specificity: {pass, note}, plainLanguage: {pass, note}, actionability: {pass, note}, groundedness: {pass, note}, safety: {pass, note}, tone: {pass, note} }, failedSections: [], rewriteInstructions: {}, summaryNote: "" }';
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
3. YEARLY FORECAST ({{CURRENT_YEAR}} = {{CURRENT_YEAR_STEM_BRANCH}}) — Explain how {{CURRENT_YEAR}}'s energy touches THIS chart's structure.
4. TIMING WINDOWS — Name specific {{CURRENT_YEAR}} months and connect each to the chart's real favorable/unfavorable elements.

RESPONSE STRUCTURE (JSON only):
{
  "elementalFlow": [{ "from": "ElementName", "to": "ElementName", "strength": "strong|moderate|weak", "meaning": "interpretation" }],
  "flowSummary": "...",
  "strengthAnalysis": { "dominantReason": "...", "weaknessRisk": "...", "balanceAssessment": "..." },
  "yearlyForecast": { "year": {{CURRENT_YEAR}}, "elementOfYear": "element of {{CURRENT_YEAR}}", "overallAssessment": "...", "opportunities": [...], "challenges": [...] },
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
3. HOPE — Show how {{CURRENT_YEAR}} creates openings. Reference exact timing windows and favorable elements.
4. ACTION — Give 3-4 concrete, specific actions tied to elements or months.

RESPONSE STRUCTURE (JSON only):
{
  "personality": "2-3 paragraphs, flowing prose, no lists. Reference specific stem/branch/ten god names.",
  "currentYearAnalysis": "2 paragraphs analyzing {{CURRENT_YEAR}}. Reference exact months, seasons, chart elements.",
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
