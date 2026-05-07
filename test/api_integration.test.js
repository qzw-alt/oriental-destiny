/**
 * 真实 API 端到端测试
 * 验证 analyzeChart + generateReading 的完整流程
 *
 * Run with: node test/api_integration.test.js
 */

const assert = require("assert");
const path = require("path");

// 加载 api_deepseek.js（Node 18+ 内置 fetch）
const DeepSeekAPI = require(path.join(__dirname, "..", "api_deepseek.js"));

/**
 * 安全说明：此测试不再硬编码 API Key。
 * 运行方式（推荐，通过 Worker 代理）：
 *   WORKER_URL=https://your-worker.workers.dev node test/api_integration.test.js
 * 或直接测试 DeepSeek API：
 *   API_BASE_URL=https://api.deepseek.com/v1 DEEPSEEK_API_KEY=sk-xxxxx node test/api_integration.test.js
 */

// 读取环境变量
const WORKER_URL = process.env.WORKER_URL || "";
const DIRECT_API_KEY = process.env.DEEPSEEK_API_KEY || "";

if (!WORKER_URL && !DIRECT_API_KEY) {
  console.error("Error: 必须设置环境变量。推荐方式：");
  console.error("  WORKER_URL=https://your-worker.workers.dev node test/api_integration.test.js");
  process.exit(1);
}

// 为 Node 环境模拟 window.API_BASE_URL
global.window = {
  API_BASE_URL: WORKER_URL || "https://api.deepseek.com/v1",
};

// 模拟真实 chartData（来自 bazi_engine.js 输出）
const mockChartData = {
  dayMasterStem: "Gui",
  dayMasterElement: "Water",
  dayMasterProfile: "sensitive, intelligent, and strongest when nuance is not ignored",
  strength: { band: "Balanced", score: 4.2 },
  season: "Spring",
  favorableElements: ["Fire", "Metal"],
  elementCounts: { Wood: 4.2, Fire: 1.5, Earth: 0.8, Metal: 2.1, Water: 3.0 },
  tenGodCounts: { "Direct Officer": 2.1, "Eating God": 1.8, Friend: 1.4 },
  pillars: {
    year: { stemIndex: 0, branchIndex: 0 },
    month: { stemIndex: 1, branchIndex: 3 },
    day: { stemIndex: 9, branchIndex: 3 },
    hour: { stemIndex: 7, branchIndex: 9 }
  },
  hiddenStems: {
    Mao: [{ stem: "Yi", element: "Wood", tenGod: "Resource" }],
    You: [{ stem: "Xin", element: "Metal", tenGod: "Officer" }]
  },
  advancedAnalysis: {
    elementDiagnosis: {
      strongest: "Wood",
      weakest: "Earth"
    },
    seasonalCommand: {
      season: "Spring",
      dayMasterCondition: "Drained by Season"
    }
  }
};

async function runIntegrationTests() {
  console.log("Running DeepSeek API integration tests...\n");
  let passed = 0;
  let failed = 0;

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

  const api = new DeepSeekAPI();

  // ─── 测试 1: analyzeChart ─────────────────────
  await testAsync("analyzeChart returns valid JSON with expected fields", async () => {
    const result = await api.analyzeChart(mockChartData);

    assert.ok(result, "Expected result object");
    assert.ok(Array.isArray(result.elementalFlow), "Expected elementalFlow array");
    assert.ok(typeof result.flowSummary === "string", "Expected flowSummary string");
    assert.ok(result.strengthAnalysis, "Expected strengthAnalysis");
    assert.ok(result.yearlyForecast, "Expected yearlyForecast");
    assert.ok(Array.isArray(result.recommendedElements), "Expected recommendedElements array");
    assert.ok(Array.isArray(result.timingWindows), "Expected timingWindows array");

    // 验证具体数据引用（prompt 要求 AI 必须引用具体名称）
    const summaryLower = (result.flowSummary || "").toLowerCase();
    const hasSpecificReference =
      summaryLower.includes("wood") ||
      summaryLower.includes("gui") ||
      summaryLower.includes("water") ||
      summaryLower.includes("spring");
    assert.ok(hasSpecificReference, "flowSummary should reference specific chart elements");
  });

  // ─── 测试 2: generateReading ──────────────────
  await testAsync("generateReading returns valid reading JSON", async () => {
    const analysisResult = {
      elementalFlow: [{ from: "Wood", to: "Fire", strength: "strong", meaning: "Wood feeds Fire" }],
      flowSummary: "Wood dominates.",
      strengthAnalysis: { dominantReason: "Spring season.", weaknessRisk: "Earth thin." },
      yearlyForecast: { year: 2026, elementOfYear: "Fire", overallAssessment: "Good year." },
      recommendedElements: ["Fire", "Metal"],
      timingWindows: [{ period: "Mar-May 2026", element: "Wood", note: "Growth" }]
    };

    const result = await api.generateReading(mockChartData, analysisResult, "career");

    assert.ok(result, "Expected reading result");
    assert.ok(typeof result.personality === "string", "Expected personality string");
    assert.ok(typeof result.currentYearAnalysis === "string", "Expected currentYearAnalysis string");
    assert.ok(Array.isArray(result.tailoredAdvice), "Expected tailoredAdvice array");
    assert.ok(typeof result.masterClosing === "string", "Expected masterClosing string");
    assert.ok(result.productRecommendation, "Expected productRecommendation");

    // 验证情绪四步曲的痕迹
    const personalityLower = (result.personality || "").toLowerCase();
    const hasDayMasterRef = personalityLower.includes("gui") || personalityLower.includes("water");
    assert.ok(hasDayMasterRef, "personality should reference Day Master by name");

    // 验证禁止词检查
    const bannedWords = ["generally", "typically", "usually", "for most people"];
    const allText = `${result.personality} ${result.currentYearAnalysis} ${result.masterClosing}`.toLowerCase();
    const foundBanned = bannedWords.filter(w => allText.includes(w));
    if (foundBanned.length > 0) {
      console.warn(`    WARNING: Found banned words: ${foundBanned.join(", ")}`);
    }
  });

  // ─── 测试 3: prompt 兜底 ──────────────────────
  await testAsync("fallback prompts work when files are missing", async () => {
    // 模拟 fetch 返回 404
    const originalFetch = global.fetch;
    global.fetch = async (url, options) => {
      if (typeof url === "string" && url.endsWith(".txt")) {
        return { ok: false, status: 404, async text() { return "Not found"; } };
      }
      return originalFetch(url, options);
    };

    const api2 = new DeepSeekAPI(API_KEY);
    const result = await api2.analyzeChart(mockChartData);
    assert.ok(result.elementalFlow, "Expected elementalFlow even with fallback prompt");

    global.fetch = originalFetch;
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runIntegrationTests().catch((err) => {
  console.error("Integration test runner error:", err);
  process.exit(1);
});
