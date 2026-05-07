/**
 * ai_bazi_layer.js — AI 推理 + 生成层
 * 
 * 依赖：bazi_engine.js, api_deepseek.js
 * 使用方式：
 *   AIBaziLayer.init('your-deepseek-api-key');
 *   const result = await AIBaziLayer.fullReading(userInput);
 */

(function () {
  // ─── 配置 ────────────────────────────────────────────
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24小时缓存
  const API_TIMEOUT_MS = 8000;               // 8秒超时

  // ─── 静态文案回退（当 API 不可用时） ─────────────────
  const FALLBACK_READINGS = {
    career: {
      personality: "Your chart reveals a personality shaped by the energy of your Day Master. You carry a natural tendency toward growth and outward movement.",
      currentYearAnalysis: "This year presents opportunities for visibility and recognition. The prevailing energies support taking initiative in professional settings.",
      tailoredAdvice: [
        "Step into roles that require clear communication and visible results.",
        "Focus on structured, methodical work rather than speculative ventures.",
        "Build alliances with those who share your professional direction."
      ]
    },
    wealth: {
      personality: "Your chart indicates a practical approach to resources. You have a natural awareness of value and a tendency to build rather than spend.",
      currentYearAnalysis: "This year's financial energy favors accumulation over expansion. Steady income paths are more reliable than windfall opportunities.",
      tailoredAdvice: [
        "Prioritize savings and resource retention over new investments.",
        "Focus on income clarity: clearer pricing and payment terms lead to better retention.",
        "Avoid high-leverage decisions in volatile periods."
      ]
    },
    love: {
      personality: "Your chart reveals a deep capacity for connection. Emotional bonds carry significant weight in your life decisions and overall wellbeing.",
      currentYearAnalysis: "This year's relational energy emphasizes harmony and understanding. Patience in partnerships yields better outcomes than pushing for quick resolution.",
      tailoredAdvice: [
        "Invest time in deepening existing bonds rather than seeking new connections.",
        "Communication style matters: softer delivery leads to better reception.",
        "Be mindful of emotional cycles and avoid major decisions during tense periods."
      ]
    },
    protection: {
      personality: "Your chart shows a natural sensitivity to external energies. You process environmental and emotional information at a deeper level than most.",
      currentYearAnalysis: "This year's protective energy calls for boundary reinforcement. External pressures may be heightened, requiring intentional grounding practices.",
      tailoredAdvice: [
        "Establish clear boundaries in high-pressure situations.",
        "Grounding practices (time in nature, structured routines) support stability.",
        "Be cautious of new entanglements that could drain energy without return."
      ]
    },
    balance: {
      personality: "Your chart reveals a complex inner life shaped by multiple elemental forces. Balance is not a static state but an ongoing practice for you.",
      currentYearAnalysis: "This year's overall energy supports integration and harmony. When all elements are acknowledged, decision-making becomes clearer.",
      tailoredAdvice: [
        "Pay attention to which elements feel out of balance in daily life.",
        "Seasonal adjustments (clothing, diet, environment) can help regulate energy.",
        "Journaling or reflective practices support integration of chart insights."
      ]
    }
  };

  // ─── 核心 API ────────────────────────────────────────

  window.AIBaziLayer = {
    api: null,
    cache: new Map(),

    /**
     * 初始化 API
     * 不再接收 apiKey；Worker 代理在服务端处理鉴权。
     */
    init() {
      this.api = new DeepSeekAPI();
    },

    /**
     * 检查是否已初始化
     */
    isReady() {
      return this.api !== null;
    },

    /**
     * 完整读取流程
     * @param {Object} userInput - { birthDate, birthTime, focus }
     * @returns {Promise<Object} 完整结果
     */
    async fullReading(userInput) {
      // 1. 基础验证
      if (!this.isReady()) {
        throw new Error("AIBaziLayer not initialized. Call AIBaziLayer.init(apiKey) first.");
      }

      // 2. 缓存检查
      const cacheKey = this._cacheKey(userInput);
      const cached = this._getCache(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        // 3. bazi_engine.js 排盘
        const chartData = this._runBaziEngine(userInput);

        // 4. 计算层推理
        const analysisResult = await this._withTimeout(
          this.api.analyzeChart(chartData),
          API_TIMEOUT_MS
        );

        // 5. 解读层生成
        const readingResult = await this._withTimeout(
          this.api.generateReading(chartData, analysisResult, userInput.focus || "balance"),
          API_TIMEOUT_MS
        );

        // 6. 合并结果
        const fullResult = {
          chart: chartData,
          analysis: analysisResult,
          reading: readingResult,
          timestamp: Date.now(),
        };

        // 7. 缓存结果
        this._setCache(cacheKey, fullResult);

        return fullResult;

      } catch (err) {
        console.warn("AIBaziLayer API error, falling back to static content:", err.message);
        return this._fallbackReading(userInput);
      }
    },

    /**
     * 仅解读层（instant_reading 使用，无计算层）
     * @param {Object} userInput - { birthDate, birthTime, focus }
     * @returns {Promise<Object} 解读结果
     */
    async quickReading(userInput) {
      if (!this.isReady()) {
        throw new Error("AIBaziLayer not initialized.");
      }

      const cacheKey = "quick_" + this._cacheKey(userInput);
      const cached = this._getCache(cacheKey);
      if (cached) return cached;

      try {
        const chartData = this._runBaziEngine(userInput);
        const readingResult = await this._withTimeout(
          this.api.generateReading(chartData, {}, userInput.focus || "balance"),
          API_TIMEOUT_MS
        );

        const result = {
          chart: chartData,
          reading: readingResult,
          timestamp: Date.now(),
        };
        this._setCache(cacheKey, result);
        return result;

      } catch (err) {
        console.warn("AIBaziLayer quickReading error:", err.message);
        return this._fallbackReading(userInput);
      }
    },

    /**
     * 仅生成水晶推荐理由（用于 report_demo.html）
     * @param {Object} chartData - bazi_engine.js 输出
     * @param {string} focus - career|wealth|love|protection|balance
     * @returns {Promise<string>} 英文推荐理由
     */
    async generateProductReason(chartData, focus) {
      if (!this.isReady()) {
        throw new Error("AIBaziLayer not initialized.");
      }

      const cacheKey = `product_${JSON.stringify(chartData)}_${focus}`;
      const cached = this._getCache(cacheKey);
      if (cached) return cached;

      try {
        const readingResult = await this._withTimeout(
          this.api.generateReading(chartData, {}, focus),
          API_TIMEOUT_MS
        );

        const reason = readingResult?.productRecommendation?.reason || 
                       FALLBACK_READINGS[focus]?.tailoredAdvice?.[0] || 
                       "A balanced selection based on your chart's elemental needs.";

        this._setCache(cacheKey, reason);
        return reason;

      } catch (err) {
        console.warn("AIBaziLayer generateProductReason error:", err.message);
        return FALLBACK_READINGS[focus]?.tailoredAdvice?.[0] || 
               "A balanced selection based on your chart's elemental needs.";
      }
    },

    // ─── 私有方法 ───────────────────────────────────

    /**
     * 运行 bazi_engine.js 进行排盘
     */
    _runBaziEngine(userInput) {
      if (typeof window.BaziEngine === "undefined") {
        throw new Error("bazi_engine.js not loaded");
      }
      return window.BaziEngine.calculateProfile({
        birthDate: userInput.birthDate,
        birthTime: userInput.birthTime || "",
        lifeFocus: userInput.focus || "balance",
        gender: userInput.gender || "",
        birthLocation: userInput.birthLocation || ""
      });
    },

    /**
     * 超时包装
     */
    _withTimeout(promise, ms) {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("API timeout")), ms)
        ),
      ]);
    },

    /**
     * 缓存 Key
     */
    _cacheKey(userInput) {
      const str = JSON.stringify({
        birthDate: userInput.birthDate,
        birthTime: userInput.birthTime,
        focus: userInput.focus,
        gender: userInput.gender,
        birthLocation: userInput.birthLocation
      });
      // 简单 hash
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        hash = (hash << 5) - hash + ch;
        hash = hash & hash;
      }
      return hash.toString(36);
    },

    _getCache(key) {
      const entry = this.cache.get(key);
      if (!entry) return null;
      if (Date.now() - entry.ts > CACHE_TTL_MS) {
        this.cache.delete(key);
        return null;
      }
      return entry.data;
    },

    _setCache(key, data) {
      // 限制缓存大小
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(key, { data, ts: Date.now() });
    },

    /**
     * 回退到静态文案
     */
    _fallbackReading(userInput) {
      const focus = userInput.focus || "balance";
      const fallback = FALLBACK_READINGS[focus] || FALLBACK_READINGS.balance;
      return {
        chart: null,
        reading: {
          personality: fallback.personality,
          currentYearAnalysis: fallback.currentYearAnalysis,
          tailoredAdvice: fallback.tailoredAdvice,
          productRecommendation: {
            focus,
            elements: [],
            material: "",
            reason: fallback.tailoredAdvice[0]
          }
        },
        analysis: null,
        fallback: true,
        timestamp: Date.now(),
      };
    }
  };

})();
