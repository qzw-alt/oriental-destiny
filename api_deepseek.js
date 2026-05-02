/**
 * api_deepseek.js — DeepSeek API 封装
 * 
 * 使用方式：
 *   const api = new DeepSeekAPI('your-api-key');
 *   const result = await api.chat([{role:'user', content:'...'}]);
 */

class DeepSeekAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = "https://api.deepseek.com/v1";
    this.model = "deepseek-chat"; // 或 "deepseek-coder" 用于代码推理
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
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
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
   * 计算层：五行推理
   * @param {Object} chartData - bazi_engine.js 输出的完整八字数据
   * @returns {Promise<Object} analysisResult
   */
  async analyzeChart(chartData) {
    const systemPrompt = await this._loadPrompt("prompts/system_analyze.txt");
    const userPrompt = await this._buildAnalyzeUserPrompt(chartData);

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.3,   // 低温度，保持推理一致性
        max_tokens: 1200,
      }
    );

    return this._parseAnalysisResponse(response);
  }

  /**
   * 解读层：英文文案生成
   * @param {Object} chartData - 八字数据
   * @param {Object} analysisResult - 计算层结果
   * @param {string} focus - career|wealth|love|protection|balance
   * @returns {Promise<Object} readingResult
   */
  async generateReading(chartData, analysisResult, focus) {
    const systemPrompt = await this._loadPrompt("prompts/system_reading.txt");
    const userPrompt = await this._buildReadingUserPrompt(chartData, analysisResult, focus);

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.8,   // 高温度，创意生成
        max_tokens: 1000,
      }
    );

    return this._parseReadingResponse(response);
  }

  // ─── 私有方法 ───────────────────────────────────────

  async _loadPrompt(filename) {
    try {
      const res = await fetch(filename);
      return await res.text();
    } catch {
      // 如果文件不存在，返回空字符串（允许内联兜底）
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
  "productRecommendation": {...}
}

IMPORTANT: Write in natural English narrative style, not templated phrases.`;
  }

  _parseAnalysisResponse(raw) {
    try {
      // 尝试提取 JSON block
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return { error: "parse_failed", raw };
    } catch {
      return { error: "invalid_json", raw };
    }
  }

  _parseReadingResponse(raw) {
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return { error: "parse_failed", raw };
    } catch {
      return { error: "invalid_json", raw };
    }
  }
}

// 导出（支持 script 标签方式和 ES Module）
if (typeof module !== "undefined" && module.exports) {
  module.exports = DeepSeekAPI;
}
