/**
 * dream-engine/rule_engine.js — Dream Interpretation Rule Engine
 *
 * Runs inside the Cloudflare Worker. Pure functions, no side effects.
 * Takes structured dream symbols from DeepSeek Call 1, computes the
 * Five Elements diagnosis and (optionally) BaZi chart matching, then
 * produces compiled analysis for DeepSeek Call 2.
 *
 * Also handles validation and fallback report generation.
 */

// =============================================================================
// Stage 1: Symbol Normalization
// =============================================================================

function normalizeSymbols(extractedSymbols, rulesDB) {
  const symbols = rulesDB.symbols || [];

  const normalized = (extractedSymbols || []).map((sym) => {
    const raw = (sym.raw || sym.normalized || "").toLowerCase();
    const category = (sym.category || "").toLowerCase();
    const importance = typeof sym.importance === "number" ? sym.importance : 3;
    const emotionalTone = sym.emotional_tone || "";

    // Try exact keyword match first
    let match = null;
    for (const rule of symbols) {
      const keywords = rule.keywords || [];
      for (const kw of keywords) {
        if (raw.includes(kw.toLowerCase()) || kw.toLowerCase().includes(raw)) {
          match = rule;
          break;
        }
      }
      if (match) break;
    }

    // Try Chinese name match
    if (!match && sym.raw) {
      for (const rule of symbols) {
        if (rule.chinese === sym.raw || rule.keywords.some(k => k === sym.raw)) {
          match = rule;
          break;
        }
      }
    }

    // Try category fallback match
    if (!match) {
      const categoryMatches = symbols.filter(
        (r) => r.category === category
      );
      if (categoryMatches.length > 0) {
        // Pick the one with the closest severity match based on emotional tone
        const severityMap = { fear: "high", anxiety: "high", sadness: "contextual", anger: "high", peace: "low", joy: "low" };
        const targetSeverity = severityMap[emotionalTone] || "contextual";
        match = categoryMatches.find((r) => r.severity === targetSeverity) || categoryMatches[0];
      }
    }

    if (match) {
      return {
        raw: sym.raw,
        normalized: match.id,
        chinese: match.chinese,
        five_element: match.five_element,
        theme: match.theme,
        category: match.category,
        motion_type: match.motion_type,
        severity: match.severity,
        importance,
        emotional_tone: emotionalTone,
        meaning_positive: match.meaning_positive,
        meaning_negative: match.meaning_negative,
        matched: true,
      };
    }

    // Unknown symbol — still track it but flag as unmatched
    return {
      raw: sym.raw,
      normalized: "unknown",
      chinese: sym.raw,
      five_element: inferElementFromEmotion(emotionalTone),
      theme: "unknown",
      category: category || "unknown",
      motion_type: "stillness",
      severity: "contextual",
      importance,
      emotional_tone: emotionalTone,
      meaning_positive: "",
      meaning_negative: "",
      matched: false,
    };
  });

  return normalized;
}

function inferElementFromEmotion(emotion) {
  const map = {
    fear: "Water", anxiety: "Fire", worry: "Earth",
    sadness: "Metal", grief: "Metal", anger: "Wood",
    joy: "Fire", peace: "Earth", calm: "Earth",
    trapped: "Earth", overwhelmed: "Water",
  };
  return map[emotion] || "Water";
}

// =============================================================================
// Stage 2: Five Elements Scoring
// =============================================================================

function scoreFiveElements(normalizedSymbols) {
  const scores = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  const scoredSymbols = [];

  for (const sym of normalizedSymbols) {
    const weight = severityWeight(sym.severity) * Math.min(sym.importance, 5) / 5;
    const element = sym.five_element;
    if (scores.hasOwnProperty(element)) {
      scores[element] += weight;
    }
    scoredSymbols.push({ ...sym, score_weight: weight });
  }

  // Normalize to 0-1 range
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const normalized = {};
  for (const [el, val] of Object.entries(scores)) {
    normalized[el] = Math.round((val / total) * 100) / 100;
  }

  // Find dominant, secondary, weakest
  const sorted = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const secondary = sorted[1][1] > 0.1 ? sorted[1][0] : null;
  const weakest = sorted[4][0];

  // Calculate percentages for display
  const percentages = {};
  for (const [el, val] of Object.entries(normalized)) {
    percentages[el] = Math.round(val * 100);
  }

  return {
    raw_scores: scores,
    normalized_scores: normalized,
    dominant_element: dominant,
    secondary_element: secondary,
    weakest_element: weakest,
    element_percentages: percentages,
    scored_symbols: scoredSymbols,
  };
}

function severityWeight(severity) {
  const weights = { high: 1.0, contextual: 0.7, low: 0.5 };
  return weights[severity] || 0.7;
}

// =============================================================================
// Stage 3: Dream Motion Analysis
// =============================================================================

const MOTION_PATTERNS = {
  trapped: { name_zh: "困局", description: "被困、无法逃脱的情境", element_bias: "Earth", pressure_level: 4 },
  escape: { name_zh: "脱困", description: "突破困境、逃离危险", element_bias: "Wood", pressure_level: 3 },
  chase: { name_zh: "被追", description: "被追逐或猎杀", element_bias: "Fire", pressure_level: 5 },
  falling: { name_zh: "坠落", description: "失控坠落或下沉", element_bias: "Water", pressure_level: 5 },
  flying: { name_zh: "飞升", description: "飞行、飘浮、上升", element_bias: "Fire", pressure_level: 1 },
  recurring: { name_zh: "反复", description: "梦境主题反复出现", element_bias: "Earth", pressure_level: 4 },
  transformation: { name_zh: "转化", description: "事物在梦中变化形态", element_bias: "Wood", pressure_level: 2 },
  descending: { name_zh: "下沉", description: "向下、进入黑暗或深处", element_bias: "Water", pressure_level: 3 },
  rising: { name_zh: "上升", description: "攀登、向上、走向光明", element_bias: "Fire", pressure_level: 1 },
  flowing: { name_zh: "流动", description: "自然流动、水或风在动", element_bias: "Water", pressure_level: 2 },
};

function analyzeDreamMotion(symbols, narrativePattern, resolution) {
  // Collect motion types from symbols
  const motionCounts = {};
  for (const sym of symbols) {
    const mt = sym.motion_type || "stillness";
    motionCounts[mt] = (motionCounts[mt] || 0) + 1;
  }

  // Map narrative pattern to motion
  const patternMap = {
    trapped: "trapped",
    confinement: "trapped",
    escape: "escape",
    breakthrough: "escape",
    chase: "chase",
    pursuit: "chase",
    falling: "falling",
    descent: "descending",
    flying: "flying",
    ascension: "rising",
    transformation: "transformation",
    recurring: "recurring",
  };

  const narrativeMotion = patternMap[narrativePattern] || null;

  // Pick primary motion: narrative takes precedence, then most common symbol motion
  let primaryMotion = narrativeMotion;
  if (!primaryMotion) {
    const sorted = Object.entries(motionCounts).sort((a, b) => b[1] - a[1]);
    primaryMotion = sorted.length > 0 ? sorted[0][0] : "stillness";
  }

  const pattern = MOTION_PATTERNS[primaryMotion] || MOTION_PATTERNS.flowing;
  const isResolved = resolution === "resolved" || resolution === "partially_resolved";

  // Determine tone
  let tone = "neutral";
  if (pattern.pressure_level >= 4 && !isResolved) tone = "caution";
  else if (pattern.pressure_level <= 2 && isResolved) tone = "positive";
  else if (pattern.pressure_level >= 4) tone = "caution";
  else if (pattern.pressure_level <= 2) tone = "positive";

  return {
    primary_motion: primaryMotion,
    motion_name_zh: pattern.name_zh,
    motion_description: pattern.description,
    element_bias: pattern.element_bias,
    pressure_level: pattern.pressure_level,
    resolution: resolution || "unresolved",
    is_resolved: isResolved,
    tone,
    secondary_motions: Object.keys(motionCounts).filter((m) => m !== primaryMotion && motionCounts[m] > 0),
    interpretation: buildMotionInterpretation(primaryMotion, isResolved),
  };
}

function buildMotionInterpretation(motion, isResolved) {
  const interpretations = {
    trapped: isResolved
      ? "梦境显示你正在突破困局，现实中的障碍开始松动。"
      : "梦境呈现困局之象，可能反映现实中某个尚未处理的主题正在持续激活。",
    escape: isResolved
      ? "你已找到出口，现实中对应的问题正在获得解决方向。"
      : "脱困的动力已经出现，但出口尚未完全打开，需要继续寻找路径。",
    chase: isResolved
      ? "追逐已经停止，外在压力正在消退。"
      : "被追逐反映内在或外在压力正在推动你面对某个需要处理的问题。",
    falling: isResolved
      ? "坠落已经停止，控制感正在恢复。"
      : "坠落之梦多与失控感相关，可能暗示某个领域缺乏稳固的支撑。",
    flying: "飞升之梦多与自由、超越和更高视角相关，是内在力量正在释放的积极信号。",
    recurring: "反复出现的梦境主题说明这个问题对你的潜意识有持续的重要性，值得认真对待。",
    transformation: "转化之梦暗示你正处于内在变化期，旧模式正在被新的认知替代。",
    descending: "下沉入深处，可能是潜意识在邀请你探索内在隐藏的智慧或情绪。",
    rising: "上升之象多与进步、提升和正向变化相关，是吉兆。",
    flowing: "流动之象暗示情绪和能量正在自然运转，顺应即可。",
  };
  return interpretations[motion] || "梦境走势值得关注，具体情况需要结合梦象五行综合判断。";
}

// =============================================================================
// Stage 4: Element Relation Detection
// =============================================================================

function detectElementRelations(elementScores) {
  const relations = [];
  const sorted = Object.entries(elementScores.normalized_scores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0];
  const weakest = sorted[4];

  // Check controlling cycle: does dominant element suppress the weakest?
  const controllingMap = {
    Wood: "Earth", Fire: "Metal", Earth: "Water", Metal: "Wood", Water: "Fire",
  };
  const generatingMap = {
    Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood",
  };

  // Dominant suppresses another element
  const suppressed = controllingMap[dominant[0]];
  const suppressedScore = elementScores.normalized_scores[suppressed] || 0;

  if (suppressedScore < 0.15 && dominant[1] > 0.35) {
    relations.push({
      id: `${dominant[0].toLowerCase()}_over_${suppressed.toLowerCase()}`,
      type: "controlling",
      dominant: dominant[0],
      suppressed: suppressed,
      name_zh: `${dominant[0]}旺克${suppressed}`,
      severity: "high",
      meaning: buildRelationMeaning("controlling", dominant[0], suppressed),
    });
  }

  // Check if dominant element is being generated (fed) by another
  const generatedBy = Object.entries(generatingMap).find(([, v]) => v === dominant[0]);
  if (generatedBy) {
    const feederScore = elementScores.normalized_scores[generatedBy[0]] || 0;
    if (feederScore > 0.2) {
      relations.push({
        id: `${generatedBy[0].toLowerCase()}_feeds_${dominant[0].toLowerCase()}`,
        type: "generating",
        source: generatedBy[0],
        target: dominant[0],
        name_zh: `${generatedBy[0]}生${dominant[0]}`,
        severity: "moderate",
        meaning: buildRelationMeaning("generating", generatedBy[0], dominant[0]),
      });
    }
  }

  // Check for weakest element being neglected
  if (weakest[1] < 0.1 && dominant[1] > 0.4) {
    relations.push({
      id: `${weakest[0].toLowerCase()}_deficiency`,
      type: "deficiency",
      element: weakest[0],
      name_zh: `${weakest[0]}虚`,
      severity: "moderate",
      meaning: `梦中${weakest[0]}的能量明显不足，${elementMeaningShort(weakest[0])}方面可能需要关注。`,
    });
  }

  // If no strong relations found, describe as balanced
  if (relations.length === 0) {
    relations.push({
      id: "balanced",
      type: "balanced",
      name_zh: "五行相对平衡",
      severity: "low",
      meaning: "梦境中各元素能量分布相对均衡，没有明显的五行冲突。",
    });
  }

  return relations;
}

function buildRelationMeaning(type, el1, el2) {
  if (type === "controlling") {
    const meanings = {
      "Wood-Earth": "成长与扩张的能量正在冲击稳定结构，可能反映变化与守成之间的张力。",
      "Earth-Water": "稳定与压制的能量正在限制情绪流动，可能反映理性过度约束感受。",
      "Water-Fire": "情绪与深层潜意识的能量正在压制热情和表达，可能反映内在退缩。",
      "Fire-Metal": "激情与强度正在熔化清晰与精准，可能反映冲动压倒理性判断。",
      "Metal-Wood": "切割与决断的能量正在限制生长，可能反映过度控制扼杀新的可能。",
    };
    return meanings[`${el1}-${el2}`] || `${el1}的能量过旺，对${el2}形成了压制关系。`;
  }
  if (type === "generating") {
    const meanings = {
      "Wood-Fire": "成长能量正在滋养热情与表达，是积极的发展信号。",
      "Fire-Earth": "热情与表达正在转化为稳定与安全感，建设性能量。",
      "Earth-Metal": "稳定积累正在形成清晰的价值判断，厚积薄发。",
      "Metal-Water": "清晰思维正在滋养深层智慧与直觉，理性与灵性协调。",
      "Water-Wood": "深层智慧与情感正在哺育新的成长方向，滋养之象。",
    };
    return meanings[`${el1}-${el2}`] || `${el1}正在滋养${el2}，形成良性循环。`;
  }
  return "";
}

function elementMeaningShort(element) {
  const map = {
    Wood: "成长、方向与生命力",
    Fire: "表达、热情与可见度",
    Earth: "稳定、信任与承载",
    Metal: "清晰、精准与价值感",
    Water: "直觉、灵活与深度",
  };
  return map[element] || "";
}

// =============================================================================
// Stage 5: BaZi Chart Matching (deep tier only)
// =============================================================================

function matchWithChart(elementScores, chartData) {
  if (!chartData || !chartData.favorableElements) {
    return {
      chart_match_type: "basic_only",
      chart_connection: null,
      advice_direction: ["稳定作息", "整理居住环境", "记录重复梦境"],
      jewelry_context: null,
    };
  }

  const favElements = chartData.favorableElements || [];
  const avoidElements = (chartData.usefulGodAnalysis && chartData.usefulGodAnalysis.avoid) || [];
  const dayMasterElement = chartData.dayMasterElement || "";
  const dayMasterStem = chartData.dayMasterStem || "";

  const dreamDominant = elementScores.dominant_element;
  const dreamWeakest = elementScores.weakest_element;

  // Check alignment
  const favorableMatches = favElements.filter((el) => {
    const score = elementScores.normalized_scores[el] || 0;
    return score > 0.15;
  });

  const avoidMatches = avoidElements.filter((el) => {
    const score = elementScores.normalized_scores[el] || 0;
    return score > 0.2;
  });

  let chartMatchType = "neutral_match";
  let chartConnection = "";

  if (avoidMatches.length > 0 && dreamDominant === avoidMatches[0]) {
    chartMatchType = "excess_unfavorable_trigger";
    chartConnection = `梦中${dreamDominant}象过重，触动命盘中过旺且不宜再增的${avoidMatches.join("、")}气。梦境可能是内在系统对失衡状态的提醒。`;
  } else if (favorableMatches.length > 0 && dreamDominant === favorableMatches[0]) {
    chartMatchType = "favorable_alignment";
    chartConnection = `梦中主导元素${dreamDominant}恰为命盘喜用神，梦境是吉兆，显示内在系统正在自我调频到有利方向。`;
  } else if (favorableMatches.length > 0) {
    chartMatchType = "partial_favorable";
    chartConnection = `梦中出现了命盘喜用的${favorableMatches.join("、")}元素，虽非主导但仍是积极信号。`;
  } else {
    chartConnection = `梦境五行分布与命盘喜用暂无直接对应。建议结合梦势和核心梦象来理解。`;
  }

  // Build advice direction
  const adviceDirection = [];
  if (avoidMatches.length > 0) {
    adviceDirection.push(`注意${avoidMatches.join("、")}的平衡`);
  }
  if (favorableMatches.length > 0) {
    adviceDirection.push(`多接触${favorableMatches.join("、")}的人事物`);
  }
  adviceDirection.push("稳定作息");
  adviceDirection.push("整理居住空间");
  adviceDirection.push("记录重复梦境");

  // Build jewelry context
  const jewelryMap = {
    Wood: { colors: ["绿色", "青色"], materials: ["木质饰品", "绿松石"] },
    Fire: { colors: ["红色", "暖橙色", "紫色"], materials: ["红玛瑙", "石榴石", "红绳"] },
    Earth: { colors: ["黄色", "棕色", "暖土色"], materials: ["黄水晶", "蜜蜡", "陶瓷"] },
    Metal: { colors: ["白色", "银色", "金色"], materials: ["银饰", "白水晶", "金属饰品"] },
    Water: { colors: ["黑色", "深蓝色"], materials: ["黑曜石", "海蓝宝", "深色水晶"] },
  };

  const jewelryContext = {
    recommended_elements: favElements.slice(0, 2),
    colors: favElements.flatMap((el) => (jewelryMap[el] ? jewelryMap[el].colors : [])).slice(0, 3),
    materials: favElements.flatMap((el) => (jewelryMap[el] ? jewelryMap[el].materials : [])).slice(0, 2),
  };

  return {
    chart_match_type: chartMatchType,
    chart_connection: chartConnection,
    advice_direction: adviceDirection,
    jewelry_context: jewelryContext,
    day_master: `${dayMasterStem} (${dayMasterElement})`,
    favorable_elements: favElements,
    avoid_elements: avoidElements,
  };
}

// =============================================================================
// Stage 6: Compile Analysis
// =============================================================================

function compileAnalysis(input, normalizedSymbols, elementScores, motionAnalysis, elementRelations, chartMatch) {
  const dominantElement = elementScores.dominant_element;
  const dreamSymbolSummaries = normalizedSymbols
    .filter((s) => s.matched)
    .slice(0, 5)
    .map((s) => ({
      symbol: s.raw || s.chinese,
      chinese: s.chinese,
      element: s.five_element,
      meaning: s.severity === "high" ? s.meaning_negative : s.meaning_positive,
    }));

  // Pick the most significant relation
  const primaryRelation = elementRelations.find((r) => r.severity === "high") || elementRelations[0];

  return {
    report_type: chartMatch.chart_match_type === "basic_only" ? "basic" : "deep",
    dream_summary: input.dream_text
      ? input.dream_text.substring(0, 200)
      : (input.summary || ""),
    symbols: dreamSymbolSummaries,
    dominant_emotion: input.dominant_emotion || "",
    element_scores: elementScores.element_percentages,
    dominant_element: dominantElement,
    element_diagnosis: primaryRelation ? primaryRelation.name_zh : "五行相对平衡",
    element_diagnosis_meaning: primaryRelation ? primaryRelation.meaning : "",
    core_theme: buildCoreTheme(dominantElement, motionAnalysis, primaryRelation),
    dream_motion: motionAnalysis.motion_name_zh,
    dream_motion_desc: motionAnalysis.motion_description,
    dream_motion_resolved: motionAnalysis.is_resolved,
    dream_tone: motionAnalysis.tone,
    chart_match_type: chartMatch.chart_match_type,
    chart_connection: chartMatch.chart_connection,
    advice_direction: chartMatch.advice_direction,
    jewelry_context: chartMatch.jewelry_context,
    narrative_pattern: input.narrative_pattern || "",
    resolution: input.resolution || "unresolved",
  };
}

function buildCoreTheme(dominantElement, motionAnalysis, primaryRelation) {
  const elementThemes = {
    Wood: "成长、方向与生命力的议题",
    Fire: "表达、热情与可见度的议题",
    Earth: "稳定、安全感与现实承载的议题",
    Metal: "清晰、价值与决断的议题",
    Water: "情绪、直觉与深层潜意识的议题",
  };

  const motionContext = motionAnalysis.motion_name_zh
    ? `，梦境走势为${motionAnalysis.motion_name_zh}`
    : "";

  const relationContext = primaryRelation && primaryRelation.severity === "high"
    ? `，五行关系显示${primaryRelation.name_zh}`
    : "";

  return (elementThemes[dominantElement] || "内在能量的流动") + motionContext + relationContext;
}

// =============================================================================
// Validation
// =============================================================================

function validateReport(report, tier, rulesDB) {
  const errors = [];
  const forbiddenTerms = (rulesDB && rulesDB.forbidden_terms) || [];

  // Required fields
  const requiredFields = ["title", "summary", "core_symbols", "five_element_reading", "real_life_reflection", "adjustment_advice", "closing"];
  for (const field of requiredFields) {
    if (!report[field] || typeof report[field] !== "string" || report[field].length < 10) {
      errors.push(`Missing or too short required field: ${field}`);
    }
  }

  // Deep tier must have chart_connection
  if (tier === "deep" && (!report.chart_connection || report.chart_connection.length < 10)) {
    errors.push("Deep tier requires chart_connection field");
  }

  // Basic tier must NOT have chart-specific content
  if (tier === "basic") {
    const chartPatterns = /命盘|日主|喜用神|八字|四柱|大运|流年|忌神|用神/g;
    const fullText = JSON.stringify(report);
    if (chartPatterns.test(fullText)) {
      errors.push("Basic tier report contains chart-related content");
    }
  }

  // Forbidden terms check
  const fullText = JSON.stringify(report);
  for (const term of forbiddenTerms) {
    if (fullText.includes(term)) {
      errors.push(`Report contains forbidden term: ${term}`);
    }
  }

  // Length check
  for (const [key, val] of Object.entries(report)) {
    if (typeof val === "string" && val.length > 2000) {
      errors.push(`Field ${key} is too long (${val.length} chars)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// Fallback Reports
// =============================================================================

function buildFallbackReport(analysis, tier) {
  const dominant = analysis.dominant_element || "Water";
  const motion = analysis.dream_motion || "流动";
  const elementNames = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" };
  const el = elementNames[dominant] || "水";

  const fallbacks = {
    basic: {
      title: `梦的启示：${el}行主导的梦境`,
      summary: `你的梦境以${el}行为主导能量，梦势为${motion}。以下是根据东方五行解梦传统为你生成的解读。`,
      core_symbols: `梦中出现的核心意象与${el}行能量相关。${el}在五行中代表${elementMeaningShort(dominant)}，这些梦象是你内在世界的一面镜子。`,
      five_element_reading: `从五行分布来看，梦境中${el}气偏旺。${analysis.element_diagnosis_meaning || "五行能量在梦中流动，反映了你当下的内在状态。"}建议关注${analysis.dream_motion_desc || "梦境的走向"}，它可以为你理解自己的情绪和状态提供线索。`,
      real_life_reflection: `梦境常常是日常情绪的延伸。如果你最近感到压力、不确定或正在经历变化，这些感受可能会在梦中以象征的方式呈现。尝试回顾最近一周发生的事情，看看是否有什么触动了你的内心。`,
      adjustment_advice: `建议保持规律的作息，睡前避免过度刺激。可以在卧室放置一些让人安静的元素。如果同样的梦境反复出现，可以尝试记录下来，寻找其中不变的主题。`,
      closing: `梦是潜意识的信使，不是命运的判决。每一个梦都带着信息，但解读的权利在你的手中。愿你从梦中获得启发，在现实中找到方向。`,
    },
    deep: {
      title: `${el}行入梦 · 命盘与梦象的对话`,
      summary: `你的梦境以${el}行为主导能量，梦势为${motion}。以下结合你的命盘五行喜忌与梦境五行分布，为你生成深度解读。`,
      core_symbols: `梦中出现的核心意象与${el}行能量相关。${el}在五行中代表${elementMeaningShort(dominant)}。这些梦象不仅反映内在状态，也与你的命盘五行结构产生共振。`,
      five_element_reading: `从五行分布来看，梦境中${el}气偏旺。${analysis.element_diagnosis_meaning || "五行能量在梦中流动。"}结合你的命盘来看，${analysis.chart_connection || "梦象五行与命盘五行的互动值得关注。"}`,
      chart_connection: analysis.chart_connection || `梦境的${el}行能量与你的命盘产生共振。建议参考喜用神的指引来平衡当下的能量状态。`,
      real_life_reflection: `梦境常常是日常情绪的延伸，也是命盘能量在潜意识层面的回声。如果你最近感到某些方面的压力或变化，这可能是内在系统在提醒你注意能量的平衡。尝试从梦境的核心主题出发，观察现实中是否有对应的情况需要你关注。`,
      adjustment_advice: analysis.advice_direction
        ? analysis.advice_direction.map((a) => `· ${a}`).join("\n")
        : `· 保持规律作息\n· 整理居住空间\n· 记录重复梦境`,
      closing: `梦是潜意识的信使，命盘是此生的蓝图。两者相遇，不是预言吉凶，而是提醒你更清醒地看见自己的能量格局。愿你从梦中获得启发，在现实中找到方向。`,
    },
  };

  const report = fallbacks[tier] || fallbacks.basic;

  // Inject jewelry context for deep tier
  if (tier === "deep" && analysis.jewelry_context) {
    const jc = analysis.jewelry_context;
    report.closing += ` 推荐元素：${(jc.recommended_elements || []).join("、")}。推荐颜色：${(jc.colors || []).join("、")}。推荐材质：${(jc.materials || []).join("、")}。`;
  }

  return report;
}

// =============================================================================
// Heuristic Extraction (fallback when Call 1 fails)
// =============================================================================

function heuristicExtraction(dreamText, rulesDB) {
  const symbols = rulesDB.symbols || [];
  const text = dreamText.toLowerCase();
  const found = [];

  for (const rule of symbols) {
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        found.push({
          raw: kw,
          normalized: rule.id,
          category: rule.category,
          importance: rule.severity === "high" ? 5 : rule.severity === "contextual" ? 3 : 2,
          emotional_tone: rule.theme,
        });
        break; // One match per rule
      }
    }
  }

  // Deduplicate by id
  const seen = new Set();
  const unique = found.filter((s) => {
    if (seen.has(s.normalized)) return false;
    seen.add(s.normalized);
    return true;
  });

  return {
    summary: dreamText.substring(0, 200),
    symbols: unique.slice(0, 10),
    people: [],
    places: [],
    actions: [],
    dominant_emotion: "未知",
    narrative_pattern: "unknown",
    resolution: "unknown",
    _heuristic: true,
  };
}

// =============================================================================
// Module Export
// =============================================================================

export {
  normalizeSymbols,
  scoreFiveElements,
  analyzeDreamMotion,
  detectElementRelations,
  matchWithChart,
  compileAnalysis,
  validateReport,
  buildFallbackReport,
  heuristicExtraction,
  MOTION_PATTERNS,
};

// Also expose for potential non-module usage
if (typeof globalThis !== "undefined") {
  globalThis.DreamRuleEngine = {
    normalizeSymbols,
    scoreFiveElements,
    analyzeDreamMotion,
    detectElementRelations,
    matchWithChart,
    compileAnalysis,
    validateReport,
    buildFallbackReport,
    heuristicExtraction,
    MOTION_PATTERNS,
  };
}
