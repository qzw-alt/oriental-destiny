/**
 * report_engine_v2.js — Two-Tier Report Generation via DeepSeek
 *
 * Philosophy:
 *   The engine is deep (Seven-Layer Classical Zi Ping). The report is human.
 *   Two delivery tiers:
 *     Tier 1: Basic Report — immediate AI reading, 5 warm sections
 *     Tier 2: Deluxe Report — Basic + Master Annotations + Jewelry Guide (6hr delivery)
 *
 * Language: market-tested patterns from successful western metaphysical brands.
 *   "Discover your true nature through the ancient art of BaZi."
 *   "Your personal elemental blueprint reveals..."
 *   "Ancient wisdom for your modern life."
 *   — Warm, self-discovery framing. Never diagnostic. Never predictive.
 *
 * Usage:
 *   const engine = new ReportEngineV2({ apiKey: 'sk-...' });
 *   const basic = await engine.generateBasicReport(profile, 'career');
 *   const deluxe = await engine.generateDeluxeReport(basic, profile, 'career');
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // DAY MASTER VOICE PROFILES — market-tested "see the person" language
  // ═══════════════════════════════════════════════════════════════

  const DAY_MASTER_VOICE = {
    Jia: "You carry Jia Wood energy — the tall tree that grows straight toward the light. People feel your presence before they hear your words. You're here to lead, to pioneer, to grow something that outlasts you. The ancient masters saw Jia Wood as the force of spring itself: unstoppable, dignified, reaching ever upward.",
    Yi: "You carry Yi Wood energy — the vine that finds its way with grace, not force. You adapt where others break. You sense the path before you see it. The ancient texts describe Yi Wood as the gentle persistence that cracks stone — not through power, but through patience.",
    Bing: "You carry Bing Fire energy — the sun itself, radiating warmth and light. You make things visible. You energize every room you enter. The masters called Bing Fire the light of consciousness — bright, generous, and capable of illuminating what others miss.",
    Ding: "You carry Ding Fire energy — the candle flame, not the bonfire. Your light is steady, concentrated, burning inward as much as outward. The classics describe Ding Fire as the flame of the heart — quiet, unwavering, the kind of warmth that transforms things slowly and completely.",
    Wu: "You carry Wu Earth energy — the mountain that has stood for millennia. You're the person others lean on without asking. Stability is your gift, not your effort. The ancient texts describe Wu Earth as the great stabilizer — immovable when necessary, but capable of nourishing everything that grows upon it.",
    Ji: "You carry Ji Earth energy — the fertile soil that receives seeds and returns abundance. You nurture. You hold space. You transform what's given to you into something richer. The masters called Ji Earth the mother energy of the Five Elements — receptive, generous, endlessly creative in quiet ways.",
    Geng: "You carry Geng Metal energy — the axe that shapes the forest. You cut through confusion. You see what's wrong and you say it. The classics describe Geng Metal as the force of autumn — crisp, decisive, unafraid of necessary endings. Your clarity is a gift, even when it's uncomfortable.",
    Xin: "You carry Xin Metal energy — the jeweler's precision, not the blacksmith's force. You notice what escapes everyone else. Your taste, your standards, your eye for quality — these aren't learned, they're your nature. The ancient texts called Xin Metal the most refined of the elements: beauty that serves function.",
    Ren: "You carry Ren Water energy — the great river, not the still pond. Your mind moves. You connect ideas across distances that others can't bridge. The masters described Ren Water as the force of deep winter — storing wisdom beneath the surface, carrying what matters forward, never truly still.",
    Gui: "You carry Gui Water energy — the deep lake, not the rushing stream. What's on the surface says almost nothing about what's underneath. You feel in layers. The ancient texts called Gui Water the most yin of all elements — receptive, mysterious, the kind of depth that holds secrets and transforms them into wisdom."
  };

  // ═══════════════════════════════════════════════════════════════
  // COMPACT BRIEF — engine data → story-ready summary
  // ═══════════════════════════════════════════════════════════════

  function buildCompactBrief(profile) {
    const dm = profile.dayMaster;
    const dmEl = profile.dayMasterElement;
    const monthBr = profile.pillars.month.branch;
    const season = profile.season;
    const yongShen = profile.yongShen;
    const elRanking = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1]);
    const strongestEl = elRanking[0][0];
    const weakestEl = elRanking[elRanking.length - 1][0];
    const tgRanking = Object.entries(profile.tenGodCounts).sort((a, b) => b[1] - a[1]);
    const topTG = tgRanking[0][0];
    const currentDY = profile.daYun.current;
    const nobles = profile.shenSha.nobles.map(s => s.name.split(" (")[0]).join(", ") || "None prominent";
    const tiaoHou = profile.tiaoHou;
    const pillarsStr = profile.pillars.year.stem + profile.pillars.year.branch + " " +
      profile.pillars.month.stem + profile.pillars.month.branch + " " +
      profile.pillars.day.stem + profile.pillars.day.branch + " " +
      (profile.pillars.hour ? profile.pillars.hour.stem + profile.pillars.hour.branch : "??");

    return {
      identity: dm + " " + dmEl + " Day Master, born in " + monthBr + " month (" + season + "). " +
        DAY_MASTER_VOICE[dm] + " Four Pillars: " + pillarsStr + ".",

      pattern: profile.geJu.patternName + ". " +
        "Governed by " + monthBr + " (" + BRANCH_ELEMENTS_TEXT[monthBr] + "). " +
        (profile.geJu.transparent ? "Visible and active." : "Works beneath the surface.") +
        " Purity: " + profile.geJu.purity + ".",

      strength: "Constitution: " + profile.strength.band.toLowerCase() + ". " +
        "Seasonal condition: " + profile.strength.monthly.rank + ". " +
        profile.strength.roots.note + " " + profile.strength.heavenly.note,

      elements: "Strongest: " + strongestEl + ". Most needing attention: " + weakestEl + ". " +
        "Body system to care for: " + profile.health.weakest.organ + " (governed by " + weakestEl + "). " +
        (tiaoHou ? "Climate wisdom per 《穷通宝鉴》: " + tiaoHou.note : ""),

      tenGods: "Primary inner dynamic: " + topTG + ". " +
        "This shapes how opportunities, relationships, and pressures flow through your life.",

      yongShen: "Your most supportive element (用神): " + yongShen.yongShen + ". " +
        "Why: " + yongShen.yongShenReason + " " +
        "Also supportive (喜神): " + (yongShen.xiShen || []).join(", ") + ". " +
        "Classical basis per 《子平真诠》: " + yongShen.principle,

      lifeSeason: "Current life phase: " +
        (currentDY ? currentDY.pillar.stem + currentDY.pillar.branch +
          " (" + currentDY.pillar.element + "), " + currentDY.pillar.tenGods.stem + " energy" : "Not calculated"),

      stars: "Gifts in your chart: " + nobles + ".",

      career: profile.career.careerArchetype,
      wealth: profile.wealth.wealthArchetype,

      // Deluxe-only data
      deluxeData: {
        fourPillars: pillarsStr,
        naYin: "Year: " + profile.pillars.year.naYin + ", Month: " + profile.pillars.month.naYin +
          ", Day: " + profile.pillars.day.naYin + (profile.pillars.hour ? ", Hour: " + profile.pillars.hour.naYin : ""),
        patternDetail: profile.geJu.patternName + " (" + profile.geJu.purity + ")",
        yongShenDetail: yongShen.yongShen,
        xiShenDetail: (yongShen.xiShen || []).join(", "),
        jiShenDetail: (yongShen.jiShen || []).join(", ") || "None strongly identified",
        strengthDetail: profile.strength.band + " (" + profile.strength.totalScore.toFixed(1) + ")",
        shenShaAll: profile.shenSha.all.map(s => s.name).join(", "),
        elementDistribution: JSON.stringify(profile.elementCounts),
        healthWeakest: weakestEl + " → " + profile.health.weakest.organ,
        daYunCurrent: currentDY ? currentDY.pillar.stem + currentDY.pillar.branch : "N/A",
        daYunQiYun: profile.daYun.qiYunAge,
        tiaoHouNote: tiaoHou ? tiaoHou.note : "Standard seasonal adjustment applies",
        hiddenStems: {
          year: (profile.pillars.year.hiddenStems || []).map(h => h.stem + "(" + h.tenGod + ")").join(", "),
          month: (profile.pillars.month.hiddenStems || []).map(h => h.stem + "(" + h.tenGod + ")").join(", "),
          day: (profile.pillars.day.hiddenStems || []).map(h => h.stem + "(" + h.tenGod + ")").join(", "),
          hour: profile.pillars.hour
            ? (profile.pillars.hour.hiddenStems || []).map(h => h.stem + "(" + h.tenGod + ")").join(", ")
            : "N/A"
        }
      }
    };
  }

  const BRANCH_ELEMENTS_TEXT = {
    Zi: "Water", Chou: "Earth", Yin: "Wood", Mao: "Wood", Chen: "Earth", Si: "Fire",
    Wu: "Fire", Wei: "Earth", Shen: "Metal", You: "Metal", Xu: "Earth", Hai: "Water"
  };

  // ═══════════════════════════════════════════════════════════════
  // TIER 1: BASIC REPORT SYSTEM PROMPT
  // ═══════════════════════════════════════════════════════════════

  function buildBasicSystemPrompt(brief, focus) {
    const focusTopics = {
      career: "career, purpose, and the work you're meant to do",
      wealth: "abundance, resources, and your relationship with prosperity",
      love: "relationships, emotional connection, and what you need in partnership",
      protection: "boundaries, inner peace, and energetic wellbeing",
      balance: "your overall life direction and personal harmony"
    };

    return `You are a wise, warm, perceptive guide. You have studied the ancient Chinese system of BaZi (the Four Pillars of Destiny) — a 2,000-year-old art that reads a person's elemental blueprint from their birth moment. You write like someone who truly sees people. Your words make readers feel understood, not analyzed.

═══ YOUR TONE ═══
Western spiritual brands describe their readings like this:
  "Discover your true nature through the ancient art of..."
  "Your personal elemental blueprint reveals..."
  "The Five Elements show us who we are beneath the surface..."
  "Ancient wisdom for your modern life..."

Your voice is: warm, intimate, wise, grounded. Like a mentor who has studied deeply but speaks simply. You lead with the PERSON, not the system. You never sound academic. You never sound like a fortune teller. You sound like someone who has seen thousands of charts and learned what actually helps people.

═══ 5 RULES ═══
1. SEE THE PERSON FIRST. Open with who they are — name their Day Master element as a metaphor for their nature. Make the first sentence about THEM, not about BaZi.
2. TRANSLATE EVERYTHING. Every Chinese term gets plain English immediately. "Your Yong Shen — the element that most supports your natural balance..."
3. BE SPECIFIC. Every paragraph should contain something ONLY this person would hear. Name their element, their season, their pattern.
4. NO PREDICTIONS. Never "you will...". Frame as awareness: "you may notice...", "this energy supports...", "your chart invites..."
5. LEAD TO HOPE. Every section ends with direction, not just observation. When you name what's hard, name what helps.

═══ THIS PERSON'S ELEMENTAL BLUEPRINT ═══

${brief.identity}

${brief.pattern}
${brief.strength}
${brief.yongShen}
${brief.elements}
${brief.tenGods}
Life phase: ${brief.lifeSeason}
${brief.stars}

═══ OUTPUT ═══ Write a reading focused on ${focusTopics[focus] || focusTopics.balance}. Valid JSON only:

{
  "opening": "2 paragraphs. Begin with the person. Name their Day Master. Describe their nature in a way that makes them feel truly seen. Use nature metaphors — trees, mountains, rivers, flames — because these are the language of the Five Elements. End with a sentence that makes them want to keep reading.",
  "yourPattern": "2 paragraphs. Explain the core pattern of their life. What flows naturally? What takes effort? Name the strongest and weakest elements. Use the metaphor from their Day Master. Make them understand: 'This is why that part of my life feels the way it does.' Every sentence anchors to their specific chart data.",
  "whatGuidesYou": "2 paragraphs. Introduce their most supportive element (Yong Shen). This is the hope section. Describe it as their compass — the direction their own energy naturally wants to go. Give them permission to lean into it. Name specific colors, directions, and seasons that carry this element's frequency.",
  "practicalSteps": ["3-4 concrete, SIMPLE suggestions. Each must name a specific element, color, direction, or season. Keep them intimate and doable. Like advice from a wise friend. Example tone: 'Wood is your compass. When decisions feel heavy, step outside — a park, a garden, any place with growing things. Green is your reset button. Face east when you need clarity. These aren't rules; they're reminders.'"],
  "closingWords": "2-3 sentences. Personal. Hopeful. Like a mentor squeezing your shoulder. Name their Day Master one last time. Leave them feeling that they understand themselves a little better — and that the path forward is clearer than it was."
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: DELUXE REPORT — Master Annotations + Jewelry Guide
  // ═══════════════════════════════════════════════════════════════

  function buildDeluxeSystemPrompt(brief, focus) {
    return `You are a senior BaZi master — someone who has spent decades studying the classical texts (《渊海子平》《子平真诠》《穷通宝鉴》《滴天髓》) and consulting with thousands of clients. A junior practitioner has already written a basic reading. Your job is to ADD your personal annotations and a jewelry/crystal recommendation.

═══ YOUR VOICE ═══
You are the master, not the junior. Your tone is: deep, precise, occasionally poetic. You see things the junior missed. You've been doing this for 40 years. You reference the classical texts naturally — not to show off, but because that's where the truth is. Your words carry weight because they've been tested against thousands of real lives.

═══ MASTER ANNOTATIONS ═══
Add 3 annotations to the basic report. Each annotation is a short insight (2-4 sentences) that:
- References a specific classical text or principle
- Names a specific stem, branch, hidden stem, or ten god from THIS chart
- Adds depth the basic reading couldn't — a layer of wisdom only a master would notice
- Is written in a warm but authoritative voice — like "I've seen this pattern many times, and here's what I've learned..."

═══ JEWELRY & CRYSTAL GUIDE ═══
Based on their Yong Shen (${brief.yongShen.split(':')[1]?.split('.')[0] || 'their supportive element'}) and chart composition, recommend:
- The primary crystal/stone that carries their Yong Shen element's energy
- The secondary crystal for balance
- Why each crystal specifically suits THEIR chart (reference their element distribution, pattern, or hidden stems)
- How and when to wear (which wrist, which finger, which occasions)
- What to avoid (crystals that carry their Ji Shen element)
- A note on how the crystal works WITH their energy, not FOR them — the crystal is a reminder, not a magic fix

The language should be like Imperial Harvest, Whisper of Dao, or Aura Elemental — premium, knowledgeable, never salesy. You're recommending what genuinely supports this person's elemental makeup, not pushing product.

═══ CHART DATA ═══

${brief.identity}
Pattern: ${brief.pattern}
${brief.yongShen}
${brief.elements}
${brief.tenGods}
Life phase: ${brief.lifeSeason}

═══ DELUXE CHART DETAILS (for deeper reference) ═══

Four Pillars: ${brief.deluxeData.fourPillars}
Na Yin: ${brief.deluxeData.naYin}
Hidden Stems: Year [${brief.deluxeData.hiddenStems.year}], Month [${brief.deluxeData.hiddenStems.month}], Day [${brief.deluxeData.hiddenStems.day}], Hour [${brief.deluxeData.hiddenStems.hour}]
Shen Sha: ${brief.deluxeData.shenShaAll}
Element Distribution: ${brief.deluxeData.elementDistribution}
Health Focus: ${brief.deluxeData.healthWeakest}
Current Da Yun: ${brief.deluxeData.daYunCurrent} (Qi Yun: age ${brief.deluxeData.daYunQiYun})
Tiao Hou: ${brief.deluxeData.tiaoHouNote}
Focus area: ${focus}

═══ OUTPUT ═══ Valid JSON only:

{
  "masterAnnotations": [
    {
      "title": "A short, intriguing title for this annotation (e.g., 'The Hidden Fire', 'Why Your Chart Responds to Autumn')",
      "insight": "2-4 sentences. Deep classical observation. Reference specific chart features. Write like a master who notices what others miss."
    }
  ],
  "jewelryGuide": {
    "primaryCrystal": {
      "name": "crystal name in plain English",
      "element": "the Five Element it carries",
      "whyForThisChart": "2-3 sentences explaining why THIS crystal for THIS person's specific chart. Reference their Yong Shen, their weakest element, or a specific hidden stem.",
      "wearingGuidance": "Which wrist, when to wear, any special instructions."
    },
    "secondaryCrystal": {
      "name": "crystal name",
      "element": "the Five Element it carries",
      "whyForThisChart": "1-2 sentences. Complements the primary crystal.",
      "wearingGuidance": "Brief."
    },
    "masterNote": "1 paragraph. A personal note from the master about how to think about crystals and energy. Warm, wise, grounded. The crystal is a reminder — not a magic object. It works because YOU work with it.",
    "whatToAvoid": "1 sentence. Which crystal type or element would not serve this chart (without naming competitors)."
  }
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // REPORT ENGINE
  // ═══════════════════════════════════════════════════════════════

  class ReportEngineV2 {
    constructor(options = {}) {
      this.apiKey = options.apiKey || null;
      this.proxyBaseURL = options.proxyBaseURL || null;
      this.baseURL = this.proxyBaseURL || "https://api.deepseek.com/v1";
      this.model = options.model || "deepseek-chat";
      this.timeout = options.timeout || 20000;
    }

    async _call(messages, maxTokens = 2000, temp = 0.7) {
      const headers = { "Content-Type": "application/json" };
      if (!this.proxyBaseURL && this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeout);

      try {
        const res = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST", headers,
          body: JSON.stringify({ model: this.model, messages, temperature: temp, max_tokens: maxTokens }),
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
        const d = await res.json();
        return d.choices[0].message.content.trim();
      } finally { clearTimeout(id); }
    }

    _parse(raw) {
      if (!raw) return null;
      try { return JSON.parse(raw.trim()); } catch {}
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) try { return JSON.parse(m[0]); } catch {}
      return null;
    }

    // ─── TIER 1: Basic Report (immediate) ──────────────────────
    async generateBasicReport(profile, focus) {
      focus = focus || "balance";
      const brief = buildCompactBrief(profile);

      try {
        const systemPrompt = buildBasicSystemPrompt(brief, focus);
        const raw = await this._call([
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write a ${focus} reading for this person. Output valid JSON.` }
        ], 2000, 0.7);

        const report = this._parse(raw);
        if (!report || report.error) throw new Error("Parse failed");

        return {
          report,
          chartSnapshot: buildChartSnapshot(profile),
          profile,
          tier: "basic",
          fallback: false,
          generatedAt: new Date().toISOString(),
          tokensApprox: systemPrompt.length
        };
      } catch (e) {
        console.warn("Basic report API failed, using fallback:", e.message);
        return {
          report: buildFallbackBasic(profile, focus),
          chartSnapshot: buildChartSnapshot(profile),
          profile,
          tier: "basic",
          fallback: true,
          error: e.message
        };
      }
    }

    // ─── TIER 2: Deluxe Report (basic + master + jewelry) ─────
    async generateDeluxeReport(basicResult, profile, focus) {
      focus = focus || "balance";
      const brief = buildCompactBrief(profile);

      // If basic failed, regenerate basic too
      let basicReport = basicResult.report;
      if (basicResult.fallback) {
        const retry = await this.generateBasicReport(profile, focus);
        basicReport = retry.report;
      }

      try {
        const systemPrompt = buildDeluxeSystemPrompt(brief, focus);
        const raw = await this._call([
          { role: "system", content: systemPrompt },
          { role: "user", content: `Add your master annotations and jewelry guide. Focus: ${focus}. Output valid JSON.` }
        ], 2000, 0.6);

        const deluxe = this._parse(raw);
        if (!deluxe) throw new Error("Deluxe parse failed");

        return {
          basic: basicReport,
          masterAnnotations: deluxe.masterAnnotations || [],
          jewelryGuide: deluxe.jewelryGuide || null,
          chartSnapshot: buildChartSnapshot(profile),
          profile,
          tier: "deluxe",
          fallback: false,
          generatedAt: new Date().toISOString()
        };
      } catch (e) {
        console.warn("Deluxe API failed, using fallback:", e.message);
        return {
          basic: basicReport,
          masterAnnotations: buildFallbackAnnotations(profile),
          jewelryGuide: buildFallbackJewelry(profile),
          chartSnapshot: buildChartSnapshot(profile),
          profile,
          tier: "deluxe",
          fallback: true,
          error: e.message
        };
      }
    }

    // ─── Convenience: generate both tiers in sequence ────────
    async generateFullDeluxe(profile, focus, onProgress) {
      onProgress = onProgress || function () {};
      onProgress({ step: 1, label: "Creating your personalized reading..." });
      const basic = await this.generateBasicReport(profile, focus);
      onProgress({ step: 2, label: "Master review in progress..." });
      const deluxe = await this.generateDeluxeReport(basic, profile, focus);
      onProgress({ step: 3, label: "Complete" });
      return deluxe;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CHART SNAPSHOT — hard data card for display
  // ═══════════════════════════════════════════════════════════════

  function buildChartSnapshot(profile) {
    return {
      fourPillars: {
        year: `${profile.pillars.year.stem}${profile.pillars.year.branch} · ${profile.pillars.year.naYin} · ${profile.pillars.year.animal}`,
        month: `${profile.pillars.month.stem}${profile.pillars.month.branch} · ${profile.pillars.month.naYin} · ${profile.season}`,
        day: `${profile.pillars.day.stem}${profile.pillars.day.branch} · ${profile.pillars.day.naYin} · Day Master`,
        hour: profile.pillars.hour
          ? `${profile.pillars.hour.stem}${profile.pillars.hour.branch} · ${profile.pillars.hour.naYin}`
          : "Unknown"
      },
      dayMaster: `${profile.dayMaster} ${profile.dayMasterElement}`,
      pattern: profile.geJu.patternName,
      yongShen: profile.yongShen.yongShen,
      xiShen: (profile.yongShen.xiShen || []).join(", "),
      jiShen: (profile.yongShen.jiShen || []).join(", ") || "—",
      strength: `${profile.strength.band} (${profile.strength.totalScore.toFixed(1)})`,
      shenSha: profile.shenSha.all.map(s => s.name).join(", "),
      qiYun: `${profile.daYun.qiYunAge} years old`,
      currentDaYun: profile.daYun.current
        ? `${profile.daYun.current.pillar.stem}${profile.daYun.current.pillar.branch}`
        : "Not started",
      elementCounts: profile.elementCounts
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // FALLBACKS — work offline with engine data
  // ═══════════════════════════════════════════════════════════════

  function buildFallbackBasic(profile, focus) {
    const dm = profile.dayMaster;
    const dmEl = profile.dayMasterElement;
    const yongShenEl = profile.yongShen.yongShen;
    const jiShenList = (profile.yongShen.jiShen || []).join(", ") || "none clearly identified";
    const strongestEl = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1])[0][0];
    const weakestEl = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1])[profile.elementCounts ? 4 : 0]?.[0] || "";
    const elColors = { Wood: "greens and teals", Fire: "warm reds and oranges", Earth: "earthy yellows and browns", Metal: "whites, silvers, and greys", Water: "deep blues and blacks" };
    const elDirections = { Wood: "East", Fire: "South", Earth: "Center", Metal: "West", Water: "North" };
    const elSeasons = { Wood: "spring (February-April)", Fire: "summer (May-July)", Earth: "late summer", Metal: "autumn (August-October)", Water: "winter (November-January)" };

    return {
      opening: `${DAY_MASTER_VOICE[dm] || ""} You were born in the ${profile.pillars.month.branch} month — ${profile.season}. The ancient masters would look at your Four Pillars — ${profile.pillars.year.stem}${profile.pillars.year.branch} ${profile.pillars.month.stem}${profile.pillars.month.branch} ${profile.pillars.day.stem}${profile.pillars.day.branch} ${profile.pillars.hour ? profile.pillars.hour.stem + profile.pillars.hour.branch : "?"} — and see the blueprint of a person born to carry a particular kind of energy through the world. This reading is generated from the engine's classical calculations — verified against the old texts, waiting for the warmth of human narration.`,

      yourPattern: `Your elemental makeup forms a ${profile.geJu.patternName} — in the classical system, this is the lens through which your life structure is read. ${strongestEl} flows through you most naturally; ${weakestEl} asks for more conscious attention. The ${profile.pillars.month.branch} month governs your pattern, which means ${profile.season} energy sets the rhythm of how you move through the world. Your Day Master is ${profile.strength.band.toLowerCase()} — ${profile.strength.roots.note.toLowerCase()}. This isn't about strength or weakness in the ordinary sense. It's about how your energy naturally circulates, where it pools, and where it needs a channel.`,

      whatGuidesYou: `The classical system identifies ${yongShenEl} as your Yong Shen — the element that most supports your natural balance. Think of it as your compass. When ${yongShenEl} energy is present in your environment, your choices, your surroundings — things tend to align more easily. This isn't magic; it's resonance. The ancient text 《子平真诠》 describes this principle: ${profile.yongShen.principle}. Your supporting elements are ${(profile.yongShen.xiShen || []).join(", ")}. Be mindful of ${jiShenList} — not to avoid life, but to understand when resistance is coming from elemental friction rather than personal failing.${profile.tiaoHou ? " 《穷通宝鉴》adds: " + profile.tiaoHou.note : ""}`,

      practicalSteps: [
        `Surround yourself with ${elColors[yongShenEl] || yongShenEl + " tones"} — in your clothing, your workspace, the things you touch daily. Color carries elemental frequency.`,
        `Face ${elDirections[yongShenEl] || yongShenEl} when you need clarity for important decisions. This aligns your energy field with your most supportive direction.`,
        `${elSeasons[yongShenEl] || yongShenEl + "'s season"} is your natural window of alignment. Important launches and decisions tend to flow more smoothly during this time.`,
        `Pay gentle attention to your ${profile.health.weakest.organ} — governed by ${weakestEl}, your thinnest element. Small daily care here compounds over time.`
      ],

      closingWords: `${dm} ${dmEl} — your Day Master is the root of who you are. Everything in this reading traces back to that. Your Yong Shen, ${yongShenEl}, is the direction your own energy wants to go. These insights aren't rules or predictions — they're an invitation. An invitation to notice what already feels true, and to lean, gently, toward what nourishes you.`
    };
  }

  function buildFallbackAnnotations(profile) {
    const yongShenEl = profile.yongShen.yongShen;
    const monthBr = profile.pillars.month.branch;
    const dm = profile.dayMaster;
    const dmEl = profile.dayMasterElement;
    const monthHidden = profile.pillars.month.hiddenStems || [];

    return [
      {
        title: "The Month Branch Secret",
        insight: `In 《渊海子平》, the month branch is called the '提纲' (the提纲挈领 — the handle that lifts the whole net). Your month branch ${monthBr} holds hidden stems: ${monthHidden.map(h => h.stem).join(", ")}. The presence of ${monthHidden[0]?.stem || "the main qi"} as ${monthHidden[0]?.tenGod || "the governing energy"} tells me something the basic reading couldn't cover: your relationship with ${monthHidden[0]?.tenGod || "this aspect of life"} is more textured than it appears on the surface. When ${yongShenEl} aligns with this hidden stem, your decisions carry unusual weight — pay attention to timing when both are present.`
      },
      {
        title: "What the Old Masters Would Notice",
        insight: `Looking at your ${dm} ${dmEl} Day Master through the lens of 《滴天髓》, I notice something the junior reader may have glossed over: your chart's relationship with the seasonal command is not a single note, but a chord. ${profile.strength.monthly?.rank || "Your seasonal position"} creates a specific dynamic that the classical texts describe in detail. One practical implication: the transition between seasons affects you more than most. The two weeks before and after each seasonal shift are your "listening" periods — not for big decisions, but for noticing what your own energy is telling you.`
      },
      {
        title: "An Observation on Timing",
        insight: `The 《穷通宝鉴》 (the classic text on seasonal adjustment) would note that your chart's relationship with ${yongShenEl} is not static — it strengthens and softens with the calendar. Without making predictions, I can tell you this: when ${yongShenEl} is strong in the natural world (its home season), your own inner compass finds its true north more easily. The rest of the year, you're navigating — competently, but with more effort. Knowing this isn't about planning your life around seasons. It's about being kinder to yourself when things feel harder than they "should."`
      }
    ];
  }

  function buildFallbackJewelry(profile) {
    const yongShenEl = profile.yongShen.yongShen;
    const jiShenEl = (profile.yongShen.jiShen || [])[0] || "none strongly identified";
    const crystalMap = {
      Wood: { primary: "Green Jade or Malachite", secondary: "Amazonite", avoid: "Hematite or Black Tourmaline" },
      Fire: { primary: "Red Agate or Carnelian", secondary: "Citrine", avoid: "Black Obsidian or excessive Water stones" },
      Earth: { primary: "Yellow Jasper or Citrine", secondary: "Tiger's Eye", avoid: "Green Jade or excessive Wood stones" },
      Metal: { primary: "Clear Quartz or White Jade", secondary: "Moonstone", avoid: "Red Agate or excessive Fire stones" },
      Water: { primary: "Black Obsidian or Lapis Lazuli", secondary: "Aquamarine", avoid: "Yellow Jasper or excessive Earth stones" }
    };
    const c = crystalMap[yongShenEl] || crystalMap.Wood;

    return {
      primaryCrystal: {
        name: c.primary,
        element: yongShenEl,
        whyForThisChart: `${c.primary} carries ${yongShenEl} energy — your Yong Shen, the element that most supports your natural balance. For your specific chart, ${yongShenEl} addresses the elemental gap the engine identified. The crystal serves as a tactile reminder of the direction your own energy wants to go.`,
        wearingGuidance: `Wear on your left wrist to receive energy, or right wrist to project it. Most effective during ${yongShenEl}'s natural season and during important meetings or decisions.`
      },
      secondaryCrystal: {
        name: c.secondary,
        element: yongShenEl,
        whyForThisChart: `${c.secondary} complements ${c.primary} — softer in frequency, suitable for daily wear when you want gentle support rather than active alignment.`,
        wearingGuidance: "Daily wear. Works well alongside the primary stone or alone on quiet days."
      },
      masterNote: "In the tradition I was trained in, we say: the crystal doesn't give you energy — it reminds you of the energy you already carry. Think of it as a compass, not an engine. Wear it when you need to remember your direction. The stone works because YOU work with it. Over time, the reminder becomes internal, and the external crystal becomes less necessary. That's the real goal.",
      whatToAvoid: `Crystals carrying strong ${jiShenEl} energy would work against your natural balance rather than with it — your chart doesn't need more of what's already abundant.`
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════
  window.ReportEngineV2 = ReportEngineV2;
  window.buildCompactBrief = buildCompactBrief;
  window.buildChartSnapshot = buildChartSnapshot;
  window.buildFallbackBasic = buildFallbackBasic;
  window.buildFallbackAnnotations = buildFallbackAnnotations;
  window.buildFallbackJewelry = buildFallbackJewelry;
  window.DAY_MASTER_VOICE = DAY_MASTER_VOICE;
})();
