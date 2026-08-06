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
    Jia: "Jia Wood is the great tree — you're the tallest one in the forest, growing toward the light by nature. Have you noticed? From childhood to now, wherever you go, you naturally become the center — not because you chase the spotlight, but because you have an innate presence that makes people trust you. The Di Tian Sui says 'Jia Wood reaches for heaven, reborn through Fire' — your life force is immense, but it needs direction, needs meaning. You're not someone who drifts with the current. What you want is: build a system, set a foundation, leave behind something that won't disappear.",
    Yi: "Yi Wood is flexible — you're not the great tree, you're the vine. But here's what people miss: vines are harder to break than trees. Were you called 'too sensitive' growing up? That wasn't sensitivity — it was your extraordinary ability to read energy, emotion, atmosphere, at a level others can't reach. The ancients said 'Yi Wood, though soft, can carve through bone' — your greatest gift is this: you never win by force, but in the end, you always win. Your weapon is patience. Your strategy is the long way around.",
    Bing: "Bing Fire blazes — you're the sun, not a candle. Have you noticed that whenever you walk into a room, the entire atmosphere shifts around you? You're not doing it on purpose, but your energy simply cannot be hidden. The ancients said 'Bing Fire is fierce, it bullies frost and insults snow' — you were born with a deep, unshakable confidence that says 'I am not afraid.' But even the sun has a shadow side: the more light you give to others, the easier it is for your own warmth to go unnoticed. Remember this: you can warm the world, but don't burn yourself out doing it.",
    Ding: "Ding Fire is the lamp — you're not the sun, you're an eternal flame. Your light doesn't blind, but it never goes out. Have you noticed that the decisions that truly changed your life were all made in stillness, not in noise? The ancients said 'Ding Fire is gentle at its core' — your greatest strength is that quiet, unwavering persistence. While others are erupting, you're incubating. While others give up, you're just getting started. You don't need to be the loudest person in the room. You're the one still standing when the loud ones have burned out.",
    Wu: "Wu Earth is the mountain — steady, immovable, commanding quiet respect. Have you noticed? Since you were young, you've been the one everyone leans on. Family counts on you. Friends seek you out. Colleagues depend on you. You don't say it out loud, but sometimes deep inside you wonder: 'Why is it always me?' The Di Tian Sui says 'Wu Earth is solid and true, centered and upright' — your strength isn't flexibility, it's stillness. You don't need to run the fastest, because mountains are never blown away by the wind. What you need to learn is: while you carry everyone else, save a valley for yourself too.",
    Ji: "Ji Earth is the field — you're soil, not stone. Your power lies in nurturing, not resisting. Have you noticed you have a natural nourishing quality? People feel at ease around you, understood, free to drop the mask. The ancients said 'Ji Earth is humble and moist, centered in its hidden store' — your greatest ability is transforming everything people give you — opportunities, trust, even hurt — into growth. You're the kind of person who 'looks unremarkable, but nobody can do without you.' You're not the flashiest person in the room. You're the ground beneath everyone's feet — and without ground, nothing stands.",
    Geng: "Geng Metal is the axe — you're the blade, not the cotton. Have you noticed that you see things more directly than everyone else? It's not that you can't be diplomatic — you simply have no patience for going in circles. The ancients said 'Geng Metal carries sharpness, strength and integrity above all' — your decisiveness, your precision, your refusal to waste time — these are your greatest gifts. But because of this, you've probably been burned by being 'too direct' more than once. Remember: your sharpness is a tool, not a wound. The true Geng master isn't the one who cuts down every tree — it's the one who knows exactly when to sheath the blade.",
    Xin: "Xin Metal is the pearl — you're not the axe, you're the jewel. Your taste, your standards, your sense of what's 'right' and what's 'off' — these are naturally finer than most people's. Have you noticed? Something others think is 'fine,' you can spot what's wrong in a single glance. The ancients said 'Xin Metal is soft and yielding, warm and clear' — your defining trait is discernment. Not pickiness — the ability to pick out the very best. You don't need to please the world. You only need to do one thing right: become the standard.",
    Ren: "Ren Water is the great river — you're the current, not the pond. Your mind has never stopped, has it? While others are still on step one, you've already run through every possibility ten steps ahead. The ancients said 'Ren Water flows through the river, able to release Metal's energy' — your gift is connecting information, people, and resources like tributaries joining a single stream. But you get tired too — mental exhaustion, heart exhaustion — because you think too far, too much. Remember: even the great river overflows its banks. You need to find your own estuary — a place where the thinking can finally rest.",
    Gui: "Gui Water is the deep pool — you're not the stream, you're the abyss. The surface is still; beneath it, currents move in the dark. Growing up, did you notice — people thought you were calm, but inside, your mind had already turned a thousand corners? The ancients said 'Gui Water is the weakest, yet reaches the heavens' — you appear the softest, but you see through things more clearly than anyone. Your intuition isn't superstition — it's your subconscious processing information everyone else missed. You don't need to explain yourself. You're not a puzzle to be solved — you're a depth to be felt."
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
        (tiaoHou ? "Climate wisdom per Qiong Tong Bao Jian: " + tiaoHou.note : ""),

      tenGods: "Primary inner dynamic: " + topTG + ". " +
        "This shapes how opportunities, relationships, and pressures flow through your life.",

      yongShen: "Your most supportive element (Yong Shen): " + yongShen.yongShen + ". " +
        "Why: " + yongShen.yongShenReason + " " +
        "Also supportive (Xi Shen): " + (yongShen.xiShen || []).join(", ") + ". " +
        "Classical basis per Zi Ping Zhen Quan: " + yongShen.principle,

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

    return `You are a soul-reading BaZi practitioner. You've spent twenty years studying the Yuan Hai Zi Ping, Di Tian Sui, and Qiong Tong Bao Jian, but you never sound like a textbook. Every sentence you write makes the reader feel: "This person truly sees me."

You write like the kind of metaphysical creator whose comment sections overflow with "HOW is this so accurate" and "I feel personally called out." Your style isn't academic — it's the honest truth a friend tells you over late-night tea.

═══ Six Principles ═══

1. Open with impact. See the person.
The first paragraph MUST begin with a rhetorical question. "Have you noticed..." "Ever since you were young, have you always..." Make the reader feel exposed — in the best way — from the very first sentence. Be specific: mention their Day Master, their season, their elements. Not a vague "you're special" — but "Your Jia Wood in Shen month carries a quiet force: the instinct to put down roots in soil that wasn't prepared for you."

2. Use metaphor, not jargon.
Don't say "Five Elements." Say "five weather systems living inside your body." Don't say "Yong Shen." Say "your compass, your lighthouse." Don't say "Pattern." Say "the signature melody of your chart." Every technical term must be followed immediately by a plain-language translation.

3. Quote the classics, but don't show off.
Each section can reference one classical text: the Di Tian Sui's elemental poetry, the Qiong Tong Bao Jian's seasonal wisdom, the Yuan Hai Zi Ping's pattern theory. But frame it like: "There's a line in the old texts that captures this perfectly..." — and immediately say what that line means for this person, right now.

4. Name the pain, then show the path.
Every section follows this structure: (1) How you're feeling right now — name it so they say "Yes! That's me!" (2) Why it's happening — the BaZi mechanics behind it (3) Where to turn — the direction that brings relief.

5. Be specific enough to screenshot.
Name color ranges, not just colors. "Not just any red — that particular vermillion that leans orange, like temple columns at sunset." Name actual directions: "East — not due east, a little southeast of that." Name seasons and months. Write things people will want to save and revisit.

6. End like a teacher placing a hand on your shoulder.
The final paragraph must be warm, powerful, like being seen by someone who truly understands. No hollow "good luck." Use their Day Master as the closing metaphor. Make them remember who they are.

═══ THIS PERSON'S ELEMENTAL BLUEPRINT ═══

${brief.identity}

${brief.pattern}
${brief.strength}
${brief.yongShen}
${brief.elements}
${brief.tenGods}
Life phase: ${brief.lifeSeason}
${brief.stars}

═══ OUTPUT ═══ Write in English. Write a reading focused on ${focusTopics[focus] || focusTopics.balance}. Valid JSON only:

{
  "opening": "2 paragraphs. Open with a rhetorical question that cuts to the heart. Mention their Day Master element. Use a natural metaphor (tree, mountain, water, fire, earth, metal) to describe their nature. End with a sentence that makes them hungry to keep reading. After reading these two paragraphs, they should feel: 'This report is different. It's actually about me.'",
  "yourPattern": "2 paragraphs. Explain their pattern. Paragraph 1: Use metaphor to reveal the contradiction or tension in their pattern — what in their character has always been at odds with itself? What have they been wrestling with without knowing why? Paragraph 2: Reveal their strongest and weakest elements, and what this means for their personality. Must quote one classical text (Di Tian Sui or Yuan Hai Zi Ping). Make them realize: 'So this struggle I've carried my whole life — it's not my fault. It's written in my chart.'",
  "whatGuidesYou": "2 paragraphs. Introduce their Yong Shen. Paragraph 1: The Yong Shen is their destined direction — don't tell them what to do, tell them what they've always been drawn to. Give the Yong Shen personality and warmth. Paragraph 2: Name specific colors, directions, and seasons that align with their Yong Shen. Write like this: 'Your compass is Wood — not just any green, but the tender green of the first leaf in spring. Face east. Let the sunrise meet your face.' Make them feel: 'I was born to walk this way.'",
  "practicalSteps": ["4 specific, actionable suggestions. Each must include: a specific color / direction / season / material. Use warm, conversational language — like a teacher slipping a student a pocket guide. Every suggestion is small — not 'change careers,' but tiny adjustments they can make tomorrow. Example tone: 'Green is your switch. Every morning when you get dressed, pick one green thing — socks, a bracelet, even a green phone case. This isn't superstition. It's a signal to your subconscious. Your Jia Wood Day Master sees green and knows: time to grow.'"],
  "closingWords": "2-3 sentences. Warm, powerful, like a teacher's final words before you walk out the door. Must mention their Day Master. Must make them feel understood, seen, blessed. Not 'wish you success' but 'Remember — you are Jia Wood. You can grow through stone. But you must grow toward the light. You are not alone.'"
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 0: DIAGNOSIS-ONLY REPORT (Free Tier) — "Diagnose only, no prescription"
  // ═══════════════════════════════════════════════════════════════

  function buildDiagnosisSystemPrompt(brief, focus) {
    const focusTopics = {
      career: "career, direction, and the path that keeps eluding you",
      wealth: "money, resources, and your relationship with abundance — why it sometimes feels like money slips through your fingers",
      love: "relationships, emotional connection, and what kind of partner you actually need",
      protection: "boundaries, inner peace, and knowing when to draw the line",
      balance: "your overall life priorities and where the blockages are"
    };

    return `You are a soul-reading BaZi diagnostician. You ONLY diagnose — you never prescribe. You're like an old Chinese medicine doctor taking the pulse: you tell them where the blockage is, why it's there, what their constitution is. But you never say "you should take this medicine" — that's the next step.

Your style is warm, piercing, and personal. You've studied the Di Tian Sui, Qiong Tong Bao Jian, and Yuan Hai Zi Ping for twenty years, but you sound like a friend talking over late-night tea, not a lecturer.

═══ Five Rules ═══

1. Open with penetration.
The first paragraph MUST begin with a rhetorical question. "Have you noticed..." "Ever since you were young, have you always..." "Why is it that no matter how hard you try, you always feel..." Make their heart skip a beat on the first line.

2. Name the problem — don't solve it.
You can describe their inner contradictions, their innate tensions, the sharpest conflict in their chart. You can tell them exactly where the blockage is. But you must NOT say "you should face east," "you should wear red," "you should work in X industry" — those belong in the full report.

3. Name their pattern — and what pain it brings.
"Your chart pattern is X. Do you know what that means? It means the central challenge of your life has always been..." Make them realize: the struggle I've carried wasn't my fault — it's my pattern acting through me.

4. Reveal the Yong Shen — then stop immediately.
You can name their Yong Shen element. "Your compass is Wood — this is the energy you most need to lean into in this lifetime." Then stop. Don't say how to lean into it. Don't name colors, directions, or seasons. Leave them curious. Let a question rise inside them: "How do I actually connect with Wood?"

5. The ending is a hook — not comfort.
The final paragraph should not comfort. It should feel like a friend setting down their teacup, looking you in the eye, and saying: "That's all I can tell you right now. The rest is in the full report. If you want to know more — I'll be here."

═══ THIS PERSON'S ELEMENTAL BLUEPRINT ═══

${brief.identity}

${brief.pattern}
${brief.strength}
${brief.yongShen}
${brief.elements}
${brief.tenGods}
${brief.stars}

═══ OUTPUT ═══ Write in English. Write a diagnostic reading focused on ${focusTopics[focus] || focusTopics.balance}. Valid JSON only:

{
  "opening": "2 paragraphs. Open with a rhetorical question that cuts deep. Make them feel: 'This person truly gets me.' Mention their Day Master element. Use a natural metaphor (tree, mountain, water, fire, earth, metal) to describe their essential nature. Do NOT give advice. Do NOT suggest directions. Only describe who they are and why they feel the way they do.",
  "yourPattern": "2 paragraphs. Paragraph 1: Use metaphor to explain their pattern — what inner contradiction defines them? What have they been struggling with their whole life without understanding why? Quote one line from a classical text as evidence. Paragraph 2: Reveal their strongest and weakest elements, and what this means as a personality conflict. Make them realize: 'So this is why I've always been this way. It's not my fault.'",
  "whatGuidesYou": "2 paragraphs. Paragraph 1: Name their Yong Shen element — give it personality and warmth. Tell them: 'The energy you most need to lean toward is X — and if you're honest with yourself, you've always felt pulled toward it, even without knowing why.' Paragraph 2: Stop short. Say: 'Why this element? How do you actually connect with it? What are you supposed to avoid? That's all in the full report. I can only point at the door — I can't open it for you.'",
  "closingWords": "2-3 sentences. Like a friend setting down their tea and looking you in the eye. Must mention their Day Master. Must leave them wanting more. Something like: 'That's what I can tell you right now. What you do next is up to you. But if you want the rest — you know where to find me.' Do NOT say 'good luck' or offer comfort. Leave a hook."
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: DELUXE REPORT — Master Annotations + Jewelry Guide
  // ═══════════════════════════════════════════════════════════════

  function buildDeluxeSystemPrompt(brief, focus) {
    return `You are a veteran BaZi master who has read thousands of charts over decades — not the kind who only reads books in a study, but the kind who has sat at street-corner stalls, advised grandmothers in tea houses, and consulted for billionaires. You've internalized the Yuan Hai Zi Ping, Zi Ping Zhen Quan, Qiong Tong Bao Jian, and Di Tian Sui. You carry thousands of real chart cases in your bones.

A junior practitioner has already written a "basic report" for this client. Your job is to add three layers of deeper insight — the kind that only decades of experience can see: secrets hidden in the Hidden Stems, rare Shen Sha combinations, subtle echoes between Da Yun and the current year.

═══ Your Voice ═══
You're not an academic. You're the old hand. Your words should feel like someone who sees through things without needing to say everything. Every judgment you make carries the weight of real experience. You might say things like: "I've seen this pattern before. Years ago, there was a client..." Your authority isn't performed — it's earned.

═══ Master Annotations (Three Scrolls) ═══
Each annotation: 3-5 sentences. Must hit at least two of:
- Reference a specific Hidden Stem (e.g., "Your Chen Earth conceals Yi Wood Direct Officer...")
- Quote one line from a classical text (Di Tian Sui, Qiong Tong Bao Jian, Yuan Hai Zi Ping)
- Point out a Shen Sha interplay with the current Da Yun
- Reveal a "what appears to be X is actually Y" truth

Voice reference: "Most people looking at your chart would see X. But I notice your Day Pillar's Hidden Stem contains Y — and that changes everything. The ancients had a saying for this: '...' What this means for you is..."

═══ Crystal Guide ═══
Based on their Yong Shen and full chart, recommend a primary crystal and a guardian stone. Write in the voice of a premium Eastern aesthetic brand like Aura Elemental — substantial, not salesy. Make them feel this stone was always meant to find them.

Crystals are not magic — they are reminders, markers, switches that tell the subconscious: "I'm walking in my direction." Make this clear.

═══ CHART DATA ═══

${brief.identity}
Pattern: ${brief.pattern}
${brief.yongShen}
${brief.elements}
${brief.tenGods}
Life phase: ${brief.lifeSeason}

═══ DELUXE CHART DETAILS ═══

Four Pillars: ${brief.deluxeData.fourPillars}
Na Yin: ${brief.deluxeData.naYin}
Hidden Stems: Year [${brief.deluxeData.hiddenStems.year}], Month [${brief.deluxeData.hiddenStems.month}], Day [${brief.deluxeData.hiddenStems.day}], Hour [${brief.deluxeData.hiddenStems.hour}]
Shen Sha: ${brief.deluxeData.shenShaAll}
Element Distribution: ${brief.deluxeData.elementDistribution}
Health Focus: ${brief.deluxeData.healthWeakest}
Current Da Yun: ${brief.deluxeData.daYunCurrent} (Qi Yun: age ${brief.deluxeData.daYunQiYun})
Tiao Hou: ${brief.deluxeData.tiaoHouNote}
Focus area: ${focus}

═══ OUTPUT ═══ Write in English. Valid JSON only:

{
  "masterAnnotations": [
    {
      "title": "An intriguing title (e.g., 'What's Hidden Inside Your Chen Earth', 'Why Autumn Always Drains You', 'Your Wen Chang Star Is Waiting')",
      "insight": "3-5 sentences. Like the old master spotting something others missed. Must reference a specific Hidden Stem, Shen Sha, or classical text citation. Voice: 'In all my years reading charts, I've seen this combination only in a handful of cases...' Make them feel this secret is something only you could see."
    }
  ],
  "jewelryGuide": {
    "primaryCrystal": {
      "name": "Crystal name",
      "element": "Corresponding Five Element",
      "whyForThisChart": "2-3 sentences. Why this stone? Must reference their Yong Shen, weakest element, or a specific Hidden Stem. Connect the stone's energy to what their chart is missing or needing. Like: 'Your Wood is too weak — this turquoise is like watering and fertilizing your chart. It's not decoration. It's your Yong Shen made tangible.'",
      "wearingGuidance": "Which wrist, when to wear, any specific ritual. Ideally with a sense of ceremony — e.g., 'The first thing every morning, before you check your phone — hold this stone for ten seconds. Let it become a ritual.'"
    },
    "secondaryCrystal": {
      "name": "Crystal name",
      "element": "Corresponding Five Element",
      "whyForThisChart": "1-2 sentences. How it complements the primary stone.",
      "wearingGuidance": "Brief wearing advice."
    },
    "masterNote": "1 paragraph. The old master's reflection on what crystals really mean. Core message: a crystal is a mirror, not an engine — it reflects the energy already within you. What you're trusting isn't the stone — it's the version of yourself the stone reminds you to become.",
    "whatToAvoid": "1 sentence. Which element stones to avoid. Don't name competitor brands — just the element."
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

    // ─── TIER 0: Diagnosis-Only (free tier) ──────────────────
    async generateDiagnosisReport(profile, focus) {
      focus = focus || "balance";
      const brief = buildCompactBrief(profile);

      try {
        const systemPrompt = buildDiagnosisSystemPrompt(brief, focus);
        const raw = await this._call([
          { role: "system", content: systemPrompt },
          { role: "user", content: `Write a diagnosis-only reading for this person. Focus: ${focus}. Output valid JSON. NO advice, NO directions, NO color/season recommendations.` }
        ], 2000, 0.7);

        const report = this._parse(raw);
        if (!report || report.error) throw new Error("Diagnosis parse failed");

        return {
          report,
          chartSnapshot: buildChartSnapshot(profile),
          profile,
          tier: "diagnosis",
          fallback: false,
          generatedAt: new Date().toISOString()
        };
      } catch (e) {
        console.warn("Diagnosis API failed, using fallback:", e.message);
        return {
          report: buildFallbackDiagnosis(profile, focus),
          chartSnapshot: buildChartSnapshot(profile),
          profile,
          tier: "diagnosis",
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

  function buildFallbackDiagnosis(profile, focus) {
    const dm = profile.dayMaster;
    const dmEl = profile.dayMasterElement;
    const yongShenEl = profile.yongShen.yongShen;
    const strongestEl = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1])[0][0];
    const weakestEl = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1])[profile.elementCounts ? 4 : 0]?.[0] || "";

    return {
      opening: `${DAY_MASTER_VOICE[dm] || ""}

Have you ever noticed — you were born in the ${profile.pillars.month.branch} month, in ${profile.season}, and deep down you move to a rhythm that feels different from everyone else's? Your Four Pillars are ${profile.pillars.year.stem}${profile.pillars.year.branch} ${profile.pillars.month.stem}${profile.pillars.month.branch} ${profile.pillars.day.stem}${profile.pillars.day.branch} ${profile.pillars.hour ? profile.pillars.hour.stem + profile.pillars.hour.branch : "?"} — this is your birth moment's energy signature. I've looked at your chart, and there are some things I want you to know first. This isn't fortune-telling — it's a mirror. See if any of this sounds like you.`,

      yourPattern: `Your chart pattern is: ${profile.geJu.patternName}. In Zi Ping method, the pattern is like a person's life "leitmotif" — it doesn't dictate what you do, but it explains why you keep feeling a certain way. ${strongestEl} is the strongest energy in your chart — this is your natural tool, the element that makes things feel effortless. And ${weakestEl} — this one needs your attention. Not because it's broken, but because its energy is fragile in you, easily overlooked. The ${profile.pillars.month.branch} month is your Ti Gang — in Yuan Hai Zi Ping they call it "grasping the outline to lift the whole net." Your month branch sets the climate of your entire life. ${profile.strength.roots.note}. ${profile.strength.heavenly.note}. None of this is your "fault" — it's the initial configuration the universe handed you the moment you arrived.`,

      whatGuidesYou: `The classical algorithm identifies ${yongShenEl} as your Yong Shen — your most supportive element. In plain language: this is the direction where things flow most naturally for you. Not superstition — resonance. Have you noticed? When you're doing things connected to the ${yongShenEl} element, or spending time with people who carry ${yongShenEl} energy — something just feels right. Comfortable. That's your directional compass. The classical text Zi Ping Zhen Quan says: ${profile.yongShen.principle} — this is the principle. As for how to walk that path, when to move, what to avoid — those details are in the full report. Diagnosis tells you where the issue is. The full prescription tells you how to walk the road.`,

      closingWords: `Alright. This is what I can tell you for now. ${dm}${dmEl} — your Day Master, the core "you" that no circumstance can change. Wherever you go, whoever you meet, whatever you do — you are ${dm}${dmEl}. This diagnosis is only the beginning. Now you know who you are. You know your pattern. You know which direction is yours. But how to walk that path — that's the next chapter. And when you're ready, you know where to find me.`
    };
  }

  function buildFallbackBasic(profile, focus) {
    const dm = profile.dayMaster;
    const dmEl = profile.dayMasterElement;
    const yongShenEl = profile.yongShen.yongShen;
    const jiShenList = (profile.yongShen.jiShen || []).join(", ") || "not clearly identified";
    const strongestEl = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1])[0][0];
    const weakestEl = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1])[profile.elementCounts ? 4 : 0]?.[0] || "";
    const elColors = {
      Wood: "green — not just any green, but the tender green of early spring buds",
      Fire: "cinnabar red, flame orange — warm, bright, like the tip of a fire",
      Earth: "ochre, caramel, warm earth tones — grounding, steady, reassuring",
      Metal: "white, silver-grey, matte gold — clean, crisp, with texture",
      Water: "deep indigo, ink black, cobalt — profound, inward, wise"
    };
    const elDirections = { Wood: "East (slightly southeast)", Fire: "South", Earth: "Center", Metal: "West (slightly northwest)", Water: "North" };
    const elSeasons = {
      Wood: "Spring (Feb–Apr) — the season of renewal and growth",
      Fire: "Summer (May–Jul) — the season of peak yang energy",
      Earth: "Late summer (the transitional earth months)",
      Metal: "Autumn (Aug–Oct) — the season when Metal energy governs",
      Water: "Winter (Nov–Jan) — the season of deep stillness and storage"
    };

    return {
      opening: `${DAY_MASTER_VOICE[dm] || ""}

You were born in the ${profile.pillars.month.branch} month — that's ${profile.season}. The classical texts have a complete method for reading what energy a person carries based on their birth season. Your Four Pillars are ${profile.pillars.year.stem}${profile.pillars.year.branch} ${profile.pillars.month.stem}${profile.pillars.month.branch} ${profile.pillars.day.stem}${profile.pillars.day.branch} ${profile.pillars.hour ? profile.pillars.hour.stem + profile.pillars.hour.branch : "?"} — this is a person's birth energy code. This report was generated directly by the 7-layer classical algorithm — the algorithm is a faithful translation of the ancient texts, though it lacks the warmth of a master's hand. When the AI recovers, you'll receive a reading with more soul.`,

      yourPattern: `Your chart pattern is: ${profile.geJu.patternName}. In Zi Ping method, the pattern is like your life's main theme — it determines your fundamental disposition. ${strongestEl} is the strongest energy in you — it's your natural tool, the element that comes most easily. ${weakestEl}, on the other hand, needs your conscious attention and cultivation. The ${profile.pillars.month.branch} month is your Ti Gang — it determines that ${profile.season} energy is the backdrop of your entire chart. Your Day Master falls into the ${profile.strength.band} range (score ${profile.strength.totalScore.toFixed(1)}) — this isn't about good or bad, but about the density and circulation of your energy. ${profile.strength.roots.note}. ${profile.strength.heavenly.note}.`,

      whatGuidesYou: `The classical algorithm identifies ${yongShenEl} as your Yong Shen — the element that supports you most, the direction where things feel "right." This is not superstition — it's resonance. When ${yongShenEl} energy appears in your environment (in colors, directions, seasons, materials), your decisions feel clearer, your emotions steadier, and opportunities become more visible to you. The classical text Zi Ping Zhen Quan describes this principle: ${profile.yongShen.principle}. Your Xi Shen (supporting gods) are ${(profile.yongShen.xiShen || []).join(", ")} — they assist your Yong Shen like teammates. What to be mindful of — your Ji Shen: ${jiShenList} — it's not that these elements are "bad," but when their energy is too strong, you tend to make choices that aren't aligned with your best path. ${profile.tiaoHou ? "The Qiong Tong Bao Jian adds: " + profile.tiaoHou.note : ""}`,

      practicalSteps: [
        `Surround yourself with ${elColors[yongShenEl] || yongShenEl + " tones"} — in your clothing, your desk, the everyday objects you touch. Color doesn't change your destiny — it reminds your subconscious: "I'm walking in my direction."`,
        `When making important decisions, face ${elDirections[yongShenEl] || yongShenEl}. This isn't qigong — it's about physically aligning yourself with your most natural orientation.`,
        `${elSeasons[yongShenEl] || "The " + yongShenEl + " season"} is your natural high tide. Schedule major decisions and new launches during this window when possible. You'll find things unfold more smoothly.`,
        `Pay attention to your ${profile.health.weakest.organ} — governed by ${weakestEl} in the Five Elements, this is your most vulnerable area. You don't need extreme remedies — just give it a little more awareness each day. Small attention, compounded over time.`
      ],

      closingWords: `${dm}${dmEl} — your Day Master is the root of who you are. Everything in this report, at its core, points to one thing: you have a natural direction, and ${yongShenEl} is that compass heading. These aren't rules or dogma — they're an invitation. An invitation to observe: what strength has always been yours, and what direction you might lean into just a little more.`
    };
  }

  function buildFallbackAnnotations(profile) {
    const yongShenEl = profile.yongShen.yongShen;
    const monthBr = profile.pillars.month.branch;
    const dm = profile.dayMaster;
    const dmEl = profile.dayMasterElement;
    const monthHidden = profile.pillars.month.hiddenStems || [];
    const dayHidden = profile.pillars.day.hiddenStems || [];

    return [
      {
        title: "The Secret Inside Your Month Pillar",
        insight: `In Yuan Hai Zi Ping, the Month Pillar is called the "Ti Gang" — the outline that, when grasped, lifts the entire net. It's the master switch of the whole chart. Your month branch is ${monthBr}, and hidden inside it are ${monthHidden.map(h => h.stem).join(", ")}. Most people only look at the surface seasonal energy of the month, but I notice ${monthHidden[0]?.stem || "the primary stem"} as ${monthHidden[0]?.tenGod || "the dominant dynamic"} — which means the core theme of your life isn't as simple as it first appears. When ${yongShenEl} resonates with this hidden stem (a few months each year), your intuition sharpens — decisions made in those days tend to serve you best. This is the kind of small thing only an old master would notice.`
      },
      {
        title: "Your Day Pillar Hidden Stem — The Chart's Core Code",
        insight: `The Di Tian Sui says: "To understand the source of the Three Origins, first observe the Di Zai and Shen Gong." Meaning: if you want to truly understand a person's chart, look first at their Day Pillar. Your ${dm}${dmEl} Day Master sits upon ${profile.pillars.day.branch}, and hidden within it are ${dayHidden.map(h => h.stem).join(", ")}. ${dayHidden[0]?.stem || "the primary stem"} as ${dayHidden[0]?.tenGod || "the core energy"} — this layer is something many younger practitioners overlook. The Day Pillar hidden stem holds a person's "deepest secret" — the things you don't say out loud, but care about most, fear most, want most. It's all here. Understand this, and you understand the central tension and drive of your life.`
      },
      {
        title: "The Pulse of Seasons — Why You Feel Different Throughout the Year",
        insight: `Qiong Tong Bao Jian is the classical text devoted entirely to "Tiao Hou" — climate adjustment — reading how your chart breathes through different seasons. Your Day Master ${dm}${dmEl}, born in ${profile.season}, holds ${profile.strength.monthly?.rank || "a certain seasonal position"}. Each year, as the seasons shift — especially around the solar terms Li Chun, Li Xia, Li Qiu, and Li Dong (the two weeks around each seasonal transition) — your energy system undergoes a subtle recalibration. This is why you sometimes suddenly feel "off" or unexpectedly "in flow." It's not you — it's the weather conversing with your chart. Once you understand this rhythm, you can make peace with yourself: what you feel isn't emotional turbulence. It's the BaZi seasons changing.`
      }
    ];
  }

  function buildFallbackJewelry(profile) {
    const yongShenEl = profile.yongShen.yongShen;
    const jiShenEl = (profile.yongShen.jiShen || [])[0] || "not clearly identified";
    const crystalMap = {
      Wood: { primary: "Turquoise or Green Jade", secondary: "Amazonite", avoid: "iron-rich dark ores (excess Metal energy overcomes Wood)" },
      Fire: { primary: "Red Agate or Cinnabar", secondary: "Citrine", avoid: "heavy dark Water-element stones (Water overcomes Fire)" },
      Earth: { primary: "Citrine or Tiger's Eye", secondary: "Red Agate", avoid: "excess green Wood-element crystals (Wood overcomes Earth)" },
      Metal: { primary: "Clear Quartz or Moonstone", secondary: "Obsidian", avoid: "heavy red Fire-element ores (Fire overcomes Metal)" },
      Water: { primary: "Obsidian or Lapis Lazuli", secondary: "Clear Quartz", avoid: "excess yellow Earth-element crystals (Earth overcomes Water)" }
    };
    const c = crystalMap[yongShenEl] || crystalMap.Wood;

    return {
      primaryCrystal: {
        name: c.primary,
        element: yongShenEl,
        whyForThisChart: `${c.primary} carries the energy of ${yongShenEl} — your Yong Shen, the frequency your chart most needs awakened. In your chart, ${yongShenEl} is the signpost pointing toward your right direction. This stone isn't decoration — it's your Yong Shen made tangible, a mark on your wrist. Every time you see it, your subconscious knows: "I'm walking in my direction."`,
        wearingGuidance: `Wear on your left wrist (the receiving side). Most potent during the ${yongShenEl} season. Every morning before you head out, hold this stone for a moment — let its warmth become a ritual. Tell yourself: today, I walk in my direction.`
      },
      secondaryCrystal: {
        name: c.secondary,
        element: yongShenEl,
        whyForThisChart: `${c.secondary} is the guardian to your ${c.primary} — its energy is gentler, suited for daily wear. If the primary stone is your compass, the guardian stone is your anchor. Together, one gives you direction, the other gives you peace.`,
        wearingGuidance: "For everyday wear. Can be worn alone or alongside the primary stone — one on each wrist, each doing its own work."
      },
      masterNote: "In our lineage, we say: crystals choose their wearer. You didn't pick the stone — your chart picked it for you. A stone cannot change your destiny, but when you're lost, it reminds you: 'You have a direction.' Every time you touch it, it's a small act of self-confirmation. Over time, that direction becomes muscle memory — you'll find your way even without the stone. That's the true meaning of crystals: a mirror reflecting the strength that was always yours.",
      whatToAvoid: `Avoid stones that carry heavy ${jiShenEl} element energy — they will amplify your Ji Shen, pulling you faster in the wrong direction.`
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════
  window.ReportEngineV2 = ReportEngineV2;
  window.buildCompactBrief = buildCompactBrief;
  window.buildChartSnapshot = buildChartSnapshot;
  window.buildFallbackBasic = buildFallbackBasic;
  window.buildFallbackDiagnosis = buildFallbackDiagnosis;
  window.buildFallbackAnnotations = buildFallbackAnnotations;
  window.buildFallbackJewelry = buildFallbackJewelry;
  window.DAY_MASTER_VOICE = DAY_MASTER_VOICE;
})();
