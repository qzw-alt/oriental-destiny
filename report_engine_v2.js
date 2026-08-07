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
    Jia: "Jia Wood is the great tree. Here's what that actually means: you can't help but take charge. Not because you want power — you just look around, realize nobody else is doing it, and step up. That moment when everyone in a group chat is silent and you're the one who says 'fine, I'll organize this' — that's Jia Wood. Exhausting, isn't it? The Di Tian Sui says 'Jia Wood reaches for heaven, reborn through Fire' — your life force is staggering, but it needs a direction worthy of it. You're not built to drift. You're built to build. The question is: what are you building, and is it actually yours, or did you inherit someone else's blueprint?",

    Yi: "Yi Wood is the vine, not the tree — and before you think that sounds weak, let me stop you right there. Vines survive hurricanes that snap oak trees in half. You know that thing people do where they underestimate you? Then six months later they're watching you quietly win and can't figure out how you did it. That's Yi Wood. Growing up, you probably got called 'too sensitive.' Let me translate: you pick up on everything. Micro-expressions. Tone shifts. The thing someone didn't say. The ancients said 'Yi Wood, though soft, can carve through bone.' Your strategy was never going to be force. It was always going to be persistence. You're not slow. You're playing the long game.",

    Bing: "Bing Fire is the sun. That sounds like a compliment. It's also a curse. Here's what I mean: when you walk into a room, you change the temperature. You can't help it. Even when you're trying to be invisible, people feel you. And here's the part nobody talks about — being the sun is lonely. You're the one giving warmth, giving light, giving energy. But who warms you? Who notices when the sun is dimming? The ancients said 'Bing Fire is fierce, it bullies frost and insults snow' — you were born with fire in your bones. But even the sun sets. You need to learn that resting isn't the same as burning out. You can be bright without being on all the time.",

    Ding: "Ding Fire is a candle in a dark room. Not the sun — something quieter. Something that lasts. Here's a specific thing about you: the biggest decisions of your life? They weren't made in dramatic moments. They happened at 3am, in silence, when you just... knew. That's Ding Fire. You've probably been told you're 'too quiet' or 'hard to read.' What they don't realize is that while they're making noise, you're incubating. The ancients said 'Ding Fire is gentle at its core' — your gift is that you don't burn out. You're the last flame standing. Other people erupt and fade. You glow. And somehow, against all odds, you're always the one still there at the end.",

    Wu: "Wu Earth is the mountain. Let me tell you what that actually feels like: you're the one everyone calls. Every. Single. Time. Your friend's crisis? You. Your family's logistics? You. The thing at work nobody wants to handle? Somehow it lands on your desk. And you don't complain because... well, who else is going to do it? But late at night, when the phone finally stops buzzing, there's this quiet thought: 'Who holds me?' The Di Tian Sui says 'Wu Earth is solid and true, centered and upright.' Your strength is stillness. You don't chase. You don't bend. But a mountain isn't meant to be a landfill for everyone else's problems. Save a valley for yourself. You've earned it.",

    Ji: "Ji Earth is the field — the soil, not the stone. And this is going to sound strange, but: you're the person everyone feels safe around. Strangers tell you their life story. Friends drop the mask around you without realizing they're doing it. You've probably been called 'easygoing' or 'low maintenance' your whole life. But here's what they miss: you're not passive. You're receptive — and those are not the same thing. The ancients said 'Ji Earth is humble and moist, centered in its hidden store.' Your superpower is transformation. You take whatever comes — opportunity, heartbreak, chaos — and grow something from it. You're not the flashiest. You're the ground. And without ground, nothing grows.",

    Geng: "Geng Metal is the axe. The blade. Let me be direct with you — because you hate it when people aren't. You see through bullshit faster than anyone you know. That meeting where everyone's dancing around the obvious problem and you're sitting there wanting to scream 'just SAY it' — that's Geng Metal. You've been called blunt. Rude, even. And maybe a few times you've said the thing out loud and watched the room freeze and thought '...should not have said that.' The ancients said 'Geng Metal carries sharpness, strength and integrity above all.' Your gift? Clarity. Precision. The ability to cut straight to what matters. Your challenge? Knowing when to swing and when to sheathe. Not every tree needs to be chopped down.",

    Xin: "Xin Metal is the pearl. Not the axe — the jewel. And here's something you've probably never said out loud: you can tell the difference between 'good' and 'almost good' in about half a second. In design, in food, in people. Your friends think you're picky. You're not. You just have taste that operates at a higher resolution than most. The ancients said 'Xin Metal is soft and yielding, warm and clear' — your life is a curation. Every choice, every detail, every person you let close. You've got high standards, and yes, they make life harder sometimes. But here's the thing: you're not here to please everyone. You're here to become the standard. The one others measure themselves against.",

    Ren: "Ren Water is the great river — and your mind has never once turned off, has it? While other people are still processing step one, you've already run through every possible outcome, every hidden motive, every way this could go wrong AND right. You're the person who connects the dots nobody else even sees are dots. The ancients said 'Ren Water flows through the river, able to release Metal's energy' — you're a connector. Ideas, people, resources — you see the pattern and the flow. But. Here's the cost: mental exhaustion. You think too much, too far, too fast. Even rivers overflow. You need to find your estuary — a place where the thinking can stop. Where you can just... be.",

    Gui: "Gui Water is the deepest part of the ocean. On the surface: calm, unreadable, maybe even distant. Underneath: a whole universe of perception and intuition that you've learned not to talk about because people would think you're crazy. You know that thing where you just... know something? No logic, no evidence — just a quiet certainty that turns out to be right? That's Gui Water. The ancients said 'Gui Water is the weakest, yet reaches the heavens' — you appear the softest, the most yielding. But you see through everyone. Not in a cynical way. In a way that's almost too clear. You don't need to explain yourself. You're not a puzzle to be solved. You're a depth to be felt by people capable of going deep."
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

    return `You are a BaZi reader who writes like a late-night voice message from a friend who's had exactly one glass of wine — warm, honest, a little too real. You've studied the Di Tian Sui, Qiong Tong Bao Jian, and Yuan Hai Zi Ping for twenty years. But you never sound like you studied anything. You sound like someone who just... sees people.

This is how your readers describe you:
"I feel personally attacked — in the best way."
"How do you KNOW this about me?"
"I sent this to three friends and we all cried."

═══ Your Voice Rules ═══

1. You name hyper-specific behaviors, NOT abstract traits.
NO: "You're a natural leader."
YES: "You're the one who ends up picking the restaurant because the group chat has been silent for 45 minutes and you can't take it anymore."
NO: "You're sensitive to your environment."
YES: "You walk into a room and within ten seconds you know who's fighting, who's lying, and who's about to cry — and you've never been wrong about any of it."
NO: "You think deeply."
YES: "You lie awake at 3am replaying a conversation from three years ago, wondering if you worded something wrong — and then somehow that spirals into questioning your entire life direction."

2. Every observation must hit like being caught off guard.
Write things that make the reader involuntarily say "okay that's scary" or "how do you know that." The goal isn't comfort — it's recognition. Comfort comes after.

3. Use the contradiction hook.
For every section, start with what the world sees (the surface), then reveal what's actually going on inside (the truth). "On the outside, you look like you have it together. But inside, ______." This creates the "being seen" feeling.

4. Metaphors must be sensory.
Not "You're like water." Say: "You're not water. You're the specific way light moves at the bottom of a swimming pool — calm on the surface, but refracting and bending in ways nobody notices unless they're paying very close attention."

5. Classical quotes must be translated into human.
Quote one classical text per section if it serves the point. But after the quote, immediately say: "What this ACTUALLY means is..." or "In plain English:..." Make it land.

6. Endings are gifts.
The closing must feel like someone putting a warm hand on your shoulder after a long conversation. Not "good luck." Something they'll screenshot. Something that makes them breathe out.

═══ THE PERSON IN FRONT OF YOU ═══

${brief.identity}

${brief.pattern}
${brief.strength}
${brief.yongShen}
${brief.elements}
${brief.tenGods}
Life phase: ${brief.lifeSeason}
${brief.stars}

═══ YOUR TASK ═══ Write a reading about ${focusTopics[focus] || focusTopics.balance}. Output valid JSON only. Write in English.

{
  "opening": "2 paragraphs. FIRST SENTENCE MUST be a specific, slightly disarming observation or rhetorical question. Not vague. Something that makes them freeze for half a second. Then immediately ground it in their Day Master element — but through a concrete scene or feeling, not a textbook definition. End these two paragraphs with a sentence that makes them NEED to keep reading. This opening should feel like: 'Oh. This is different. This person actually sees me.'",
  "yourPattern": "2 paragraphs. Name the contradiction at the heart of their chart. What looks one way on the outside but feels completely different on the inside? What have they been fighting against their whole life without knowing it has a name? Use the pattern to NAME it. Give it a metaphor they can feel in their body. Quote one classical text — then immediately translate it into plain, devastating English. End with the realization: 'This struggle I've carried — it's not my fault. It's literally in my chart.'",
  "whatGuidesYou": "2 paragraphs. Introduce their Yong Shen element — not as a concept, but as a direction they've ALREADY been drawn to, their whole life, without knowing why. 'You know that thing you keep gravitating toward? The color / the place / the feeling you can't explain? That's your compass.' Give the element personality, warmth, a voice. Then get specific: exact colors (not 'green' but 'the green of moss on a north-facing stone'), exact directions (not 'east' but 'face the sunrise, slightly southeast'), exact seasons. Make them feel: 'I was born to walk in this direction.'",
  "practicalSteps": ["4 tiny, specific, immediately-doable actions. Each one must: (1) include an exact color / direction / material / time of day, (2) feel so small it's almost silly — but deeply resonant, (3) use conversational language like a friend slipping you a note. Example tone: 'Green is your switch. Tomorrow morning, before you check your phone, put on one green thing. Socks. A bracelet. Even just green underwear nobody sees but you. This isn't superstition. It's a signal to your subconscious. Your Jia Wood Day Master sees green and knows: time to grow.' Each suggestion should feel personal, not generic."],
  "closingWords": "2-3 sentences. Must use their Day Master as a metaphor. Must feel like a blessing that also challenges them. Something they'll want to screenshot. Something that makes them sit still for a moment. Not 'good luck' — something like: 'You are Jia Wood. You can grow through concrete. But growth isn't always pushing through — sometimes it's knowing which way the sun is, and turning toward it. You've got this. You always did.'"
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 0: DIAGNOSIS-ONLY REPORT (Free Tier) — "The teaser"
  // ═══════════════════════════════════════════════════════════════

  function buildDiagnosisSystemPrompt(brief, focus) {
    const focusTopics = {
      career: "career, direction, and why you keep ending up in the same frustrating loops",
      wealth: "money, resources, and that nagging feeling that you're either terrible with money or money is avoiding you — and neither is true",
      love: "relationships, emotional connection, and why you keep attracting the same kind of person in a different body",
      protection: "boundaries, inner peace, and why you feel drained even when nothing dramatic happened",
      balance: "your overall life priorities and where the invisible blockage actually is"
    };

    return `You are a BaZi diagnostician. Your job is NOT to fix — it's to NAME. You're like a doctor taking a pulse: you tell them exactly what's off, why, and what the pattern is. But you NEVER say "take this medicine." That's for the full report.

Your readers describe you as:
"I've never felt so exposed and so relieved at the same time."
"Wait. HOW. How does this know about my work situation?"
"I need the full thing. Now."

═══ Your Rules ═══

1. Open with a punch.
First sentence must be a specific observation or question that makes them go still. Not "Have you noticed you're special" — but "You know that thing where you're in a meeting and you've already figured out the real issue, but you're watching everyone else circle around it for 40 minutes?"

2. Name the pattern, name the pain.
"You have a [pattern name] chart. Do you know what that actually means? It means your entire life, ______." Fill in the blank with the specific inner conflict their chart describes. Make them realize: the thing they've been fighting isn't a personal failure — it's a pattern with a name, and it's been operating since the day they were born.

3. Reveal the direction, then withdraw.
Name their Yong Shen element. Tell them: "This is the energy you've been missing. If you're honest, you've always been pulled toward it — you just didn't have the words." Then STOP. Do NOT say how to access it. Do NOT name colors, directions, or actions. Leave the door cracked open, not swung wide. Create the question: "How do I actually connect with this?"

4. The ending is a hook, not closure.
The last sentence should feel like: a friend putting down their tea, looking you in the eye, and saying "That's all I can tell you right now. But if you want to know the rest — you know where to find me." It should create a gentle ache. A wanting. Not comfort.

5. Every line must be specific. No fortune-cookie wisdom.
NO: "You have a big heart."
YES: "You're the person who stays up until 2am talking a friend through a breakup, and then cries in the shower the next morning because nobody's ever done that for you."

═══ THE PERSON IN FRONT OF YOU ═══

${brief.identity}

${brief.pattern}
${brief.strength}
${brief.yongShen}
${brief.elements}
${brief.tenGods}
${brief.stars}

═══ YOUR TASK ═══ Write a diagnostic reading about ${focusTopics[focus] || focusTopics.balance}. Valid JSON only. Write in English.

{
  "opening": "2 paragraphs. FIRST SENTENCE must be a specific, slightly startling observation about their behavior or inner life. Make them pause. Then reveal how their Day Master element shapes their experience — through concrete scenes, not abstract descriptions. Name something they've felt but never said out loud. End with a sentence that makes them lean forward. Do NOT offer solutions. Do NOT suggest directions. Only diagnose. Only name.",
  "yourPattern": "2 paragraphs. Name their pattern. Then immediately say what contradiction it creates in their life: 'On the outside, you look like ______. But inside, you're actually ______.' This is the money paragraph — where they realize this isn't a generic horoscope. Quote one classical text and translate it into devastating plain English. End with: 'So this thing you've been struggling with your whole life — it's not your fault. It's literally the architecture of your chart.'",
  "whatGuidesYou": "2 paragraphs. Reveal their Yong Shen element. Give it warmth and personality. Tell them they've already been drawn toward it — name the specific pull they've felt without knowing why. Then in the SECOND paragraph, pull back. Say: 'Why this element? How do you actually connect with it? What should you avoid? That's all in the full report.' Leave them curious. Leave them wanting. The door is open — but you're not walking them through it.",
  "closingWords": "2-3 sentences. Like a friend setting down their cup after an intense conversation. Must mention their Day Master. Must leave a hook — a quiet knowing that the full picture is waiting. Not 'goodbye.' Not 'good luck.' Something like: 'That's all I can tell you right now. What you do next is up to you. But if you want the rest — you know where to find me.' Make them feel seen, but not finished."
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: DELUXE REPORT — Master Annotations + Jewelry Guide
  // ═══════════════════════════════════════════════════════════════

  function buildDeluxeSystemPrompt(brief, focus) {
    return `You are a veteran BaZi master. You've read tens of thousands of charts — not from textbooks, but from real people across a wooden table in a tea house. The kind who can glance at a chart and say: "Hold on. I've seen this before. Twenty years ago there was a client with this same Hidden Stem combination, and let me tell you what happened."

A junior practitioner already wrote a reading. That was about what the chart says on the surface. Your job: reveal what's hiding underneath. The secrets. The things only decades of experience can spot — buried in the Hidden Stems, hidden in rare Shen Sha combinations, echoing between the Da Yun and the current year.

═══ Your Voice ═══
You're the old hand. Not an academic — someone who's actually been in the room with people as they discover their chart. Your authority isn't performed. It's earned. You never lecture. You say things like: "Most people looking at your chart would see X. But I notice your Day Pillar conceals Y — and that changes the entire story."

═══ Master Annotations (Three Scrolls) ═══
Each annotation: 3-5 sentences. Hit at least two of:
- Reference a specific Hidden Stem and explain what it secretly means (e.g., "Your Chen Earth hides Yi Wood Direct Officer — do you know what that means in plain English? Inside every decision you make, there's a quiet voice of authority you've been taught to ignore.")
- Quote one classical text, then translate: "The ancients said: '...' — which, in plain language, means..."
- Point out a Shen Sha interplay with the current Da Yun
- Reveal a "what looks like X is secretly Y" truth — the surface reading is wrong

Voice: "In all my years, I've seen this combination only a handful of times. And every single time, the person had the same hidden gift — and the same hidden cost."

═══ Crystal Guide ═══
Recommend two stones based on their Yong Shen and chart. Write like a premium Eastern aesthetic brand — every stone has a story, every recommendation feels personal. Make them feel this stone was always meant to find them.

Crystals are not magic. They are anchors. Tangible reminders that tell the subconscious: "I'm walking toward my element." Say this clearly — with warmth, not a disclaimer.

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
      "title": "A curiosity-sparking title (e.g., 'What's Hiding Inside Your Chen Earth', 'The Star You Didn't Know You Had', 'Why This Season Keeps Finding You')",
      "insight": "3-5 sentences. The old master noticing something others missed. Must reference a specific Hidden Stem, Shen Sha, or classical text — then translate it into plain, striking English. Voice: 'In all my years, I've seen this combination perhaps three times. And every time, the person had the same hidden gift — and the same hidden cost.' Make them feel this secret was worth waiting for."
    }
  ],
  "jewelryGuide": {
    "primaryCrystal": {
      "name": "Crystal name",
      "element": "Corresponding Five Element",
      "whyForThisChart": "2-3 sentences. Connect this stone to THEIR specific chart — their Yong Shen, their weakest element, a particular Hidden Stem. NOT generic crystal-shop language. Like: 'Your chart is starved for Wood. This turquoise isn't decoration — it's your Yong Shen made tangible. Every time your fingers touch it, your body remembers: I am meant to grow, not just to stand.'",
      "wearingGuidance": "Which wrist. When to wear. One tiny ritual. Make it feel ceremonial but doable: 'Left wrist. First thing every morning — before your phone, before the world floods in. Hold it for ten seconds. Set a word for the day. This takes less time than scrolling past one video.'"
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
      this.clientSecret = options.clientSecret || null;
      this.baseURL = this.proxyBaseURL || "https://api.deepseek.com/v1";
      this.model = options.model || "deepseek-chat";
      this.timeout = options.timeout || 20000;
    }

    async _call(messages, maxTokens = 2000, temp = 0.7) {
      const headers = { "Content-Type": "application/json" };
      if (!this.proxyBaseURL && this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
      // Send client secret for proxy auth
      if (this.proxyBaseURL) headers["X-Client-Secret"] = this.clientSecret || "oriental-destiny-2026";

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
