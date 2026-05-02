/**
 * Unit tests for ai_bazi_layer.js and api_deepseek.js
 *
 * Run with: node test/ai_bazi_layer.test.js
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// ─── 模拟浏览器全局 ───────────────────────────────

const mockStorage = {};
global.localStorage = {
  getItem(key) {
    return mockStorage[key] || null;
  },
  setItem(key, value) {
    mockStorage[key] = value;
  },
};

let fetchCallCount = 0;
let lastFetchBody = null;
const mockFetchResponse = {
  ok: true,
  async text() {
    return "";
  },
  async json() {
    return {
      choices: [
        {
          message: {
            content: JSON.stringify({
              personality: "Mock personality text.",
              currentYearAnalysis: "Mock year analysis.",
              tailoredAdvice: ["Mock advice 1.", "Mock advice 2."],
              masterClosing: "Mock master closing.",
              productRecommendation: {
                focus: "career",
                elements: ["Fire", "Metal"],
                material: "Mock crystal",
                reason: "Mock reason."
              }
            })
          }
        }
      ]
    };
  }
};

global.fetch = async (url, options) => {
  fetchCallCount++;
  if (options && options.body) {
    lastFetchBody = JSON.parse(options.body);
  }
  // 模拟 prompt 文件请求
  if (typeof url === "string" && url.endsWith(".txt")) {
    return {
      ok: false,
      status: 404,
      async text() { return "Not found"; }
    };
  }
  return mockFetchResponse;
};

global.window = {
  DEEPSEEK_API_KEY: "test-api-key",
  localStorage: global.localStorage,
};

// ─── 加载被测模块 ───────────────────────────────

const apiPath = path.join(__dirname, "..", "api_deepseek.js");
const layerPath = path.join(__dirname, "..", "ai_bazi_layer.js");

// 先加载 api_deepseek.js（它定义了 DeepSeekAPI 类）
const DeepSeekAPI = require(apiPath);
global.DeepSeekAPI = DeepSeekAPI;
global.window.DeepSeekAPI = DeepSeekAPI;

// 模拟 BaziEngine
global.window.BaziEngine = {
  calculateProfile(input) {
    return {
      dayMasterStem: "Jia",
      dayMasterElement: "Wood",
      dayMasterProfile: "upright, growth-oriented",
      strength: { band: "Strong", score: 6.2 },
      season: "Spring",
      favorableElements: ["Fire", "Metal"],
      pillarLabels: {
        year: "Jia Zi (Wood Rat)",
        month: "Yi Mao (Wood Rabbit)",
        day: "Jia Chen (Wood Dragon)",
        hour: "Open because birth time was not supplied"
      },
      advancedAnalysis: {
        seasonalCommand: { dayMasterCondition: "In Season" },
        luckPhase: { name: "Expansion" }
      },
      focusReading: "Mock focus reading.",
      deepFocusReading: "Mock deep focus reading.",
      readerCounsel: "Mock reader counsel.",
      interpretations: {
        personality: "Mock engine personality.",
        career: "Mock career.",
        wealth: "Mock wealth.",
        love: "Mock love.",
        protection: "Mock protection."
      },
      masterMessage: "Mock master message.",
      jewelry: { copy: "Mock jewelry copy." },
      favorableElementReasoning: "Mock reasoning.",
      lifePhaseReading: "Mock life phase.",
      focusStrategy: { ageEmphasis: "Mock emphasis." },
      note: "Mock note.",
      calculationNotes: { solarTerms: "Mock solar terms.", hourPillar: "Mock hour pillar." }
    };
  }
};

// 再加载 ai_bazi_layer.js（它依赖 window.BaziEngine 和 DeepSeekAPI）
require(layerPath);

// ─── 测试用例 ─────────────────────────────────────

async function runTests() {
  console.log("Running ai_bazi_layer tests...\n");
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // ─── 测试 1: BaziEngine 调用签名 ───────────────
  test("_runBaziEngine calls calculateProfile with correct object shape", () => {
    const layer = global.window.AIBaziLayer;
    layer.init("test-key");

    let capturedInput = null;
    const original = global.window.BaziEngine.calculateProfile;
    global.window.BaziEngine.calculateProfile = (input) => {
      capturedInput = input;
      return original(input);
    };

    layer._runBaziEngine({ birthDate: "1990-01-15", birthTime: "08:30", focus: "career" });

    assert.strictEqual(capturedInput.birthDate, "1990-01-15");
    assert.strictEqual(capturedInput.birthTime, "08:30");
    assert.strictEqual(capturedInput.lifeFocus, "career");

    global.window.BaziEngine.calculateProfile = original;
  });

  test("_runBaziEngine defaults focus to balance when not provided", () => {
    const layer = global.window.AIBaziLayer;
    let capturedInput = null;
    const original = global.window.BaziEngine.calculateProfile;
    global.window.BaziEngine.calculateProfile = (input) => {
      capturedInput = input;
      return original(input);
    };

    layer._runBaziEngine({ birthDate: "1990-01-15" });
    assert.strictEqual(capturedInput.lifeFocus, "balance");
    assert.strictEqual(capturedInput.birthTime, "");

    global.window.BaziEngine.calculateProfile = original;
  });

  // ─── 测试 2: quickReading 流程 ─────────────────
  await testAsync("quickReading returns reading result when API succeeds", async () => {
    fetchCallCount = 0;
    const layer = global.window.AIBaziLayer;
    layer.init("test-key");

    const result = await layer.quickReading({
      birthDate: "1990-01-15",
      birthTime: "08:30",
      focus: "career"
    });

    assert.ok(result.chart, "Expected chart data");
    assert.ok(result.reading, "Expected reading data");
    assert.ok(!result.fallback, "Expected non-fallback result");
    assert.strictEqual(result.reading.personality, "Mock personality text.");
    assert.ok(fetchCallCount > 0, "Expected at least one API call");
  });

  // ─── 测试 3: fullReading 流程 ──────────────────
  await testAsync("fullReading returns analysis + reading when API succeeds", async () => {
    fetchCallCount = 0;
    const layer = global.window.AIBaziLayer;
    layer.init("test-key");

    const result = await layer.fullReading({
      birthDate: "1990-01-15",
      birthTime: "08:30",
      focus: "career"
    });

    assert.ok(result.chart, "Expected chart data");
    assert.ok(result.analysis, "Expected analysis data");
    assert.ok(result.reading, "Expected reading data");
    assert.ok(!result.fallback, "Expected non-fallback result");
  });

  // ─── 测试 4: fallback 逻辑 ─────────────────────
  await testAsync("quickReading falls back to static content when API fails", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => {
      throw new Error("Network error");
    };

    const layer = global.window.AIBaziLayer;
    layer.init("test-key");
    // 清除缓存以确保走 API
    layer.cache.clear();

    const result = await layer.quickReading({
      birthDate: "1990-01-15",
      birthTime: "08:30",
      focus: "career"
    });

    assert.ok(result.fallback, "Expected fallback result");
    assert.ok(result.reading, "Expected fallback reading");

    global.fetch = originalFetch;
  });

  await testAsync("fullReading falls back to static content when API fails", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => {
      throw new Error("Network error");
    };

    const layer = global.window.AIBaziLayer;
    layer.init("test-key");
    layer.cache.clear();

    const result = await layer.fullReading({
      birthDate: "1990-01-15",
      birthTime: "08:30",
      focus: "career"
    });

    assert.ok(result.fallback, "Expected fallback result");
    assert.ok(result.reading, "Expected fallback reading");

    global.fetch = originalFetch;
  });

  // ─── 测试 5: 缓存逻辑 ──────────────────────────
  await testAsync("cache hit skips API call for identical input", async () => {
    fetchCallCount = 0;
    const layer = global.window.AIBaziLayer;
    layer.init("test-key");
    layer.cache.clear();

    const input = { birthDate: "1990-01-15", birthTime: "08:30", focus: "career" };

    // 第一次调用
    await layer.quickReading(input);
    const firstCallCount = fetchCallCount;

    // 第二次调用（相同输入）
    await layer.quickReading(input);
    const secondCallCount = fetchCallCount;

    assert.strictEqual(secondCallCount, firstCallCount, "Expected no additional API call on cache hit");
  });

  // ─── 测试 6: API key 未初始化 ──────────────────
  test("isReady returns false before init", () => {
    const layer = global.window.AIBaziLayer;
    // 保存当前状态
    const savedApi = layer.api;
    layer.api = null;

    assert.strictEqual(layer.isReady(), false);

    // 恢复
    layer.api = savedApi;
  });

  // ─── 测试 7: prompt 兜底 ───────────────────────
  await testAsync("analyzeChart uses fallback prompt when file load fails", async () => {
    const api = new global.window.DeepSeekAPI("test-key");
    // fetch 已经模拟为 404 对 .txt 文件
    const result = await api.analyzeChart({ dayMasterStem: "Jia" });
    assert.ok(result, "Expected result even with prompt file load failure");
  });

  await testAsync("generateReading uses fallback prompt when file load fails", async () => {
    const api = new global.window.DeepSeekAPI("test-key");
    const result = await api.generateReading({ dayMasterStem: "Jia" }, {}, "career");
    assert.ok(result, "Expected result even with prompt file load failure");
  });

  // ─── 测试 8: generateProductReason ─────────────
  await testAsync("generateProductReason returns product reason string", async () => {
    fetchCallCount = 0;
    const layer = global.window.AIBaziLayer;
    layer.init("test-key");
    layer.cache.clear();

    const chartData = global.window.BaziEngine.calculateProfile({});
    const reason = await layer.generateProductReason(chartData, "wealth");

    assert.ok(typeof reason === "string", "Expected string reason");
    assert.ok(reason.length > 0, "Expected non-empty reason");
  });

  // ─── 汇总 ──────────────────────────────────────
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
