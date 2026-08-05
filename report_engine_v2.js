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
    Jia: "甲木参天——你是森林里最高的那棵树，天生向阳而生。你有没有发现，从小到大，你走到哪里都自然成为中心？不是你想出风头，是你天生就有一种让人信服的气场。古书《滴天髓》说'甲木参天，脱胎要火'——你的生命力极强，但需要方向、需要意义感。你不是那种随波逐流的人，你要的是：建一个体系，立一个根基，留下一些不会消失的东西。",
    Yi: "乙木柔韧——你不是大树，你是藤蔓。但你知道吗？藤蔓比大树更难折断。你是不是从小就被说'太敏感'？其实那不是敏感，是你对能量、对情绪、对气氛的感知力远超常人。古人说'乙木虽柔，刳羊解牛'——你这个日主最大的本事就是：不用硬碰硬，但最后赢的一定是你。你的武器是耐心，你的策略是迂回。",
    Bing: "丙火炽烈——你是太阳，不是蜡烛。你有没有发现，只要你在场，整个房间的气氛都会被你带着走？你不是故意的，但你的能量就是藏不住。古人说'丙火猛烈，欺霜侮雪'——你天生有一种'我不怕'的底气。但太阳也有阴影面：你给别人的光越多，自己的温度就越容易被忽略。要记得：你可以温暖世界，但不要燃烧自己。",
    Ding: "丁火如灯——你不是太阳，你是一盏长明灯。你的光不刺眼，但持久。你有没有发现，真正改变你人生的决定，都是在安静中做出的？古人说'丁火柔中，抱乙而孝'——你这个日主最大的力量，就是那种不动声色的坚持。别人在爆发，你在酝酿；别人放弃了，你刚刚开始。",
    Wu: "戊土如山——你是山。巍峨、厚重、不怒自威。从小到大，你是不是一直在做那个'扛事的人'？家人靠你，朋友找你，同事倚重你。你嘴上不说，但心里有时候也会累——'为什么总是我？'。古人说'戊土固重，既中且正'——你的力量不是柔韧的，而是不动的。你不需要跑得最快，因为山永远不会被风吹走。你需要的，是学会在承担的同时，也给自己留一个山谷。",
    Ji: "己土如田——你是土壤，不是石头。你的力量在于'孕育'，不在于'抵抗'。你有没有发现，你有一种天生的'滋养力'？别人跟你相处，会觉得安心、被理解、不需要伪装。古人说'己土卑湿，中正蓄藏'——你最大的本事，是把别人给你的任何东西（机会、信任、甚至伤害），都转化成成长的能量。你是那种'看起来不起眼，但谁都不能没有你'的人。",
    Geng: "庚金如斧——你是刀锋，不是棉絮。你有没有发现，你看问题的角度总是比别人直接？你不是不会委婉，你是不屑于绕弯子。古人说'庚金带煞，刚健为最'——你的果断、精准、不拖泥带水，是你最大的天赋。但也因为这个，你可能吃过不少'太直'的亏。记住：你的锋利是武器，不是伤口。真正的庚金高手，不是到处砍树的人，而是知道什么时候该收刀入鞘的人。",
    Xin: "辛金如珠——你不是刀斧，你是珠宝。你的品味、你的标准、你对'好'和'对'的判断，天生就比别人精微。你有没有发现，一件事别人觉得'还行'，你一眼就能看出哪里不对？古人说'辛金软弱，温润而清'——你这个日主，最大的特点是'挑'。不是挑剔，是挑得出最好的。你不需要讨好世界，你只需要做对一件事：让自己成为那个标准。",
    Ren: "壬水如江——你是大河，不是池塘。你的大脑从来没有停过，对不对？别人还在想第一步，你已经把十步之后的可能性全想了一遍。古人说'壬水通河，能泄金气'——你这个日主的本事，就是能把各种信息、人脉、资源像江河一样串联起来。但你也容易累——脑累、心累，因为你想得太多太远。记住：江河水满则溢，你要学会给自己一个'入海口'。",
    Gui: "癸水如渊——你不是小溪，你是深潭。水面波澜不惊，水下暗流涌动。从小到大，你有没有发现——别人以为你很平静，其实你内心已经转了一千个弯？古人说'癸水至弱，达于天津'——你看起来是最柔弱的，但你是最能'看穿'事物的。你的直觉不是迷信，是你潜意识处理了别人忽略的信息。你不需要解释自己——你是一种需要被'感悟'的存在，不是被'理解'的谜题。"
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

    return `你是一位直击灵魂的命理师。你研习了二十年的《渊海子平》《滴天髓》《穷通宝鉴》，但你从不掉书袋。你的每一句话都让人感觉：'这个人懂我。'

你是那种在B站上讲命理、弹幕刷屏'太准了''我天这不就是我吗'的博主。你的风格不是学术讲座，是朋友深夜喝茶时说的真心话。

═══ 六大心法 ═══

一、开门见山，直击人心。
第一段必须用反问句开场。"你有没有发现..." "从小到大，你是不是一直..." 让读者第一句就觉得被看穿了。一定要具体——提到他们的日主、季节、五行——不是泛泛的"你是个特别的人"，而是"你的甲木在申月，天生带着一种要在不合适的环境里生根的力量"。

二、用隐喻，不用术语。
五行不说五行，说"你身体里有五种天气"。用神不说用神，说"你的指南针、你的灯塔"。格局不说格局，说"你命盘里的主旋律"。每一个专业术语后面，马上跟一句大白话。

三、引用经典，但不卖弄。
每段可以提到一部古籍：《滴天髓》的"甲木参天"、《穷通宝鉴》的季节调候、《渊海子平》的格局论。但要像这样引用："古书里有一句话说得特别好..." 然后马上说这句话对现在的你意味着什么。

四、说出痛点，再给解法。
每一段的结构：1）你现在的感受（说出来，让对方觉得"对！就是我！"） 2）为什么会这样（命理的解释） 3）你应该往哪个方向走（希望感）。

五、具体到让人想截图保存。
颜色要说到具体的色号范围（"不是随便什么红，是那种偏橙的朱砂红"）。方向要说清楚（"朝东——不是正东，偏东南一点"）。时间要说季节和月份。让人看了想截图转发。

六、结尾要像师父拍肩膀。
最后一段必须温暖、有力量、像被一个懂你的人看着眼睛说出来的话。不要"祝你好运"这种敷衍的话。要用他们的日主做比喻，让他们记住自己是谁。

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
  "opening": "2段。第一句话必须是反问句，直击痛点。提到他们的日主元素。用自然的比喻（树、山、水、火、土、金）来描写他们的天性。最后一句让他们迫不及待往下读。像这样：'你有没有发现...' 或者 '从小到大，你有没有一种感觉...' 读完这两段，对方应该觉得'这个报告跟别的不一样，它真的在说我。'",
  "yourPattern": "2段。解释他们的格局。第一段：用比喻讲解格局的'矛盾'或'张力'——他们的性格里有什么是天生拧着的？有什么是他们一直在挣扎却不知道为什么的？第二段：说出命盘里最强的元素和最弱的元素，以及这意味着什么。必须引用一部古籍（《滴天髓》或《渊海子平》）中的一句话。让读者恍然大悟：'原来我这辈子一直这样，不是我的错，是我的格局决定的。'",
  "whatGuidesYou": "2段。介绍用神。第一段：用神是他们的'天命方向'——不是告诉他们该做什么，而是告诉他们'你一直以来被什么吸引'。要给用神赋予人格和温度。第二段：具体说出用神对应的颜色、方向、季节。像这样：'你的指南针是木——不是随便什么绿色，是春天第一片叶子的嫩绿。朝东走，让日出照在你的脸上。' 让他们感觉到：'我天生就该往这个方向走。'",
  "practicalSteps": ["4条具体、可操作的建议。每条必须包含：具体的颜色/方向/季节/材质。用亲切的口语化语气，像师父给徒弟塞的锦囊。每一条都是'小事'——不是改行跳槽这种大决定，而是'明天就能做'的微小调整。示例风格：'绿色是你的开关。每天早上穿衣服的时候，选一件绿色的东西——袜子、手链、甚至一个绿色手机壳都行。这不是迷信，是潜意识暗示。你的甲木日主看到绿色，就知道：该生长了。'"],
  "closingWords": "2-3句话。温暖、有力、像师父最后的叮嘱。必须提到他们的日主。必须让他们感到被理解、被看见、被祝福。不是'祝你成功'而是'记住，你是甲木——你可以长在石头缝里，但你要向着光长。你不是一个人。'"
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 0: DIAGNOSIS-ONLY REPORT (Free Tier) — "只诊断，不开方"
  // ═══════════════════════════════════════════════════════════════

  function buildDiagnosisSystemPrompt(brief, focus) {
    const focusTopics = {
      career: "事业、方向感、以及你一直在找的'对的路'",
      wealth: "钱财、资源、以及你跟'丰盛'的关系——为什么有时候觉得钱来钱去留不住",
      love: "感情、亲密关系、以及你真正需要的是什么样的伴侣",
      protection: "边界感、内心安定、以及你什么时候最需要给自己画一道线",
      balance: "你整个人生的'顺位'和'堵点'"
    };

    return `你是一位直击灵魂的命理诊断师。你只做诊断，不开方——你像一位老中医把脉：告诉你哪里堵了、为什么堵、你的体质是什么。但你绝不说"你应该吃什么药"——那是下一步的事情。

你的风格是B站上那种弹幕刷屏'太准了''这不就是我吗'的命理博主。你读《滴天髓》《穷通宝鉴》《渊海子平》读了二十年，但你的话像深夜朋友喝茶聊天，不是说教。

═══ 五大铁律 ═══

一、开场即穿透。
第一段必须用反问句。"你有没有发现..." "从小到大，你是不是一直..." "为什么你明明很努力，却总觉得..." 让对方第一句就心头一颤。

二、说问题——不说解法。
你可以说出对方的性格矛盾、天生的拧巴、命盘里最尖锐的冲突。你可以说出他的'堵点'在哪里。但你不可以说'你应该往东走'、'你应该穿红色'、'你应该做XX行业'——这些是完整报告的内容。

三、命名他的格局——并告诉他这意味着什么痛苦。
"你的命盘格局是XX——你知道这意味着什么吗？这意味着你这一生最大的课题就是..." 让他恍然大悟：原来我这辈子的挣扎不是我的错，是我的格局在作用。

四、说出用神是什么——但马上停住。
你可以说出他的用神是哪个元素。"你的指南针是木——这就是你这辈子最该靠近的能量。" 然后立刻停住。不要说怎么靠近、什么颜色、什么方向——把好奇心留给他。让他心里冒出一个问题："那我该怎么靠近木？"

五、结尾是钩子——不是安慰。
最后一段不要安慰。最后一段要像一个朋友把茶杯放下，看着你说："我能告诉你的就是这些了。解法在完整报告里。你想知道的话——我们接着聊。"

═══ THIS PERSON'S ELEMENTAL BLUEPRINT ═══

${brief.identity}

${brief.pattern}
${brief.strength}
${brief.yongShen}
${brief.elements}
${brief.tenGods}
${brief.stars}

═══ OUTPUT ═══ Write a diagnostic reading focused on ${focusTopics[focus] || focusTopics.balance}. Valid JSON only:

{
  "opening": "2段。第一句必须是反问句——直击痛点。让对方觉得'这个人懂我'。提到他们的日主元素，用自然的比喻（树、山、水、火、土、金）来描写他们的天性。不要给建议，不要给方向——只描述'你是谁'和'你为什么会有这样的感受'。",
  "yourPattern": "2段。第一段：用比喻解释他们的格局——他们的性格里有什么矛盾？有什么是他们一辈子在挣扎却不知道为什么的？引用一部古籍里的一句话作为印证。第二段：说出命盘里最强的元素和最弱的元素，以及这意味着什么性格层面的冲突。让读者恍然大悟：'原来我这辈子一直这样，不是我的错。'",
  "whatGuidesYou": "2段。第一段：说出用神是什么元素——赋予它人格和温度。告诉对方：'你这一生最该靠近的能量是XX——你有没有发现，当你靠近XX的时候，你会觉得特别顺？' 第二段：戛然而止。说'为什么是这个、怎么靠近它、你的忌神是什么——这些都在完整报告里。我现在只能告诉你方向，不能告诉你路。'",
  "closingWords": "2-3句话。像一个朋友把茶杯放下，看着你的眼睛说出来的话。必须提到他们的日主。必须有悬念——让他想知道更多。像这样：'我能告诉你的就到这里了。你接下来会怎么做——那是你的事。但如果你想知道更多——你知道在哪找我。' 不要说祝福的话。要留钩子。"
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: DELUXE REPORT — Master Annotations + Jewelry Guide
  // ═══════════════════════════════════════════════════════════════

  function buildDeluxeSystemPrompt(brief, focus) {
    return `你是一位看了几十年八字的老命理师——不是在书斋里念经的那种，是在巷子口摆过摊、在茶馆里给大妈看过、也给亿万富翁做过顾问的那种。你的手上翻过《渊海子平》《子平真诠》《穷通宝鉴》《滴天髓》，心里装了几千个真实的命例。

你有一个年轻徒弟已经给这位客户写了"基础命书"。你现在要做的，是在这个基础上，加三道"天机"——就是那种老命师眼尖才能看到的东西：藏在藏干里的秘密、神煞的特殊组合、大运和流年的微妙呼应。

═══ 你的语气 ═══
你不是学者，你是老江湖。你的话要让人感觉在看破不说破。你的每一个判断背后，都是几十年的经验。你有时候会说："这个格局我见过，那个年代..." 你的权威不是装出来的，是你真的经历过。

═══ 天机批注（三道） ═══
每一道批注：2-4句话。必须做到以下至少两点：
- 提到一个具体的藏干（比如：你的辰土里藏着乙木正官...）
- 引用一部古籍的一句话（《滴天髓》《穷通宝鉴》《渊海子平》）
- 指出一个神煞和大运的呼应关系
- 揭示一个"表面如此，实际不然"的真相

语气参考："一般人看你的八字，看到的是XX。但我注意到你的日柱藏干里有XX——这就不一样了。古人有一句话说得特别好：'...' 对你来说，这意味着..."

═══ 灵石指南 ═══
根据他们的用神和命盘全局，推荐本命灵石和护法灵玉。语言要像 Imperial Harvest 或 Aura Elemental 这种高级东方美学品牌——有底蕴，不推销。你要让人感觉：这块石头本来就应该跟着他。

灵石不是魔法——它是"提醒"、是"印记"、是"让潜意识记住方向的开关"。这段话要写清楚。

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

═══ OUTPUT ═══ Valid JSON only:

{
  "masterAnnotations": [
    {
      "title": "一个有悬念的标题（比如'藏在辰土里的秘密'、'为何你总是在秋天提不起劲'、'你的文昌贵人正在等你'）",
      "insight": "2-4句。像老师父看出了门道。必须提到具体的藏干、神煞、或古籍的引用。语气：'我看了这么多年八字，你的这个组合，我只在XX的情况下见过...' 让别人觉得，这个秘密只有你能看到。"
    }
  ],
  "jewelryGuide": {
    "primaryCrystal": {
      "name": "石头名称",
      "element": "对应五行",
      "whyForThisChart": "2-3句。为什么是这块石头？必须提到他们的用神、最弱元素、或某个特定的藏干。要把石头的能量和他们的命盘中的'缺失'或'需要'联系起来。像这样：'你的木太弱了，这块绿松石就像是给你的命盘浇水施肥。它不是装饰，是用神的外化。'",
      "wearingGuidance": "戴在哪只手、什么时候戴、有什么特别的讲究。最好有仪式感——比如'每天早上醒来的第一件事，先摸一摸这块石头...'"
    },
    "secondaryCrystal": {
      "name": "石头名称",
      "element": "对应五行",
      "whyForThisChart": "1-2句。跟本命石的互补关系。",
      "wearingGuidance": "简短的佩戴建议。"
    },
    "masterNote": "1段。老师父聊灵石的真实意义。核心：灵石是镜子不是引擎——它照出你自己身上的能量。你信的不是石头，是你被石头提醒之后愿意做的那个自己。",
    "whatToAvoid": "1句。避开什么元素的石头。不要点名竞争对手品牌，只说元素。"
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

你有没有发现——你出生在${profile.pillars.month.branch}月、${profile.season}，你骨子里带着一种跟别人不一样的节奏？你的四柱是${profile.pillars.year.stem}${profile.pillars.year.branch} ${profile.pillars.month.stem}${profile.pillars.month.branch} ${profile.pillars.day.stem}${profile.pillars.day.branch} ${profile.pillars.hour ? profile.pillars.hour.stem + profile.pillars.hour.branch : "?"}——这是你出生那一天的"能量签名"。我看了你的命盘，有些东西想先让你知道。不是算命，是对照——你看看，我说的是不是你。`,

      yourPattern: `你的命盘格局是：${profile.geJu.patternName}。在子平法里，格局就像一个人一生的"主旋律"——它不决定你具体做什么，但它决定你"为什么总是有某种感觉"。${strongestEl}的能量在你命盘里最强——这是你天生的"顺手工具"，你做跟${strongestEl}相关的事情会觉得特别顺。而${weakestEl}，是你需要特别留意的——不是说它坏了，而是说它的能量在你这里是脆弱的、容易被忽略的。${profile.pillars.month.branch}月是你的提纲——《渊海子平》里说"提纲挈领"，月令决定了你这辈子的"气候"。${profile.strength.roots.note}。${profile.strength.heavenly.note}。这些不是你的'错'——它们是你来到这个世界的时候，宇宙给你的那一组初始设定。`,

      whatGuidesYou: `古典算法识别出${yongShenEl}是你的用神——用通俗的话说，这是你这辈子"最顺"的那个方向。不是迷信——是共振。你有没有发现，当你做跟${yongShenEl}元素相关的事情时、或者跟${yongShenEl}属性的人相处时——你莫名会觉得"对"、觉得舒服？这就是你的"天命方向"。古籍《子平真诠》里有句话：${profile.yongShen.principle}——说的就是这个道理。至于这个方向具体怎么走、什么时候走、你需要注意避开什么——这些在完整命书里有详细的分析。诊断告诉你问题在哪，解法告诉你路怎么走。`,

      closingWords: `好了。我能告诉你的就是这些了。${dm}${dmEl}——你的日主，是你这一辈子最核心的那个"你"。不管走到哪里、遇到谁、做什么事——你都是${dm}${dmEl}。这份诊断只是一个开始。你知道你是谁、你知道你的格局、你知道你的方向在哪。但路怎么走——那是下一步的事了。想知道的话，你知道在哪找我。`
    };
  }

  function buildFallbackBasic(profile, focus) {
    const dm = profile.dayMaster;
    const dmEl = profile.dayMasterElement;
    const yongShenEl = profile.yongShen.yongShen;
    const jiShenList = (profile.yongShen.jiShen || []).join(", ") || "暂未明确识别";
    const strongestEl = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1])[0][0];
    const weakestEl = Object.entries(profile.elementCounts).sort((a, b) => b[1] - a[1])[profile.elementCounts ? 4 : 0]?.[0] || "";
    const elColors = {
      Wood: "青色、嫩绿色——不是随便什么绿，是春天刚发芽的那种",
      Fire: "朱砂红、橘红色——偏暖、偏亮，像火焰的外焰色",
      Earth: "土黄、焦糖色、大地色系——温厚、沉稳",
      Metal: "白色、银灰、哑金色——干净、利落、有质感",
      Water: "深蓝、玄黑、墨蓝色——深沉、内敛、有智慧感"
    };
    const elDirections = { Wood: "东方（偏东南）", Fire: "南方", Earth: "中央", Metal: "西方（偏西北）", Water: "北方" };
    const elSeasons = {
      Wood: "春天（2-4月）——万物生发之时",
      Fire: "夏天（5-7月）——阳气最盛之时",
      Earth: "夏秋之交（长夏）",
      Metal: "秋天（8-10月）——金气当令",
      Water: "冬天（11-1月）——万物收藏之时"
    };

    return {
      opening: `${DAY_MASTER_VOICE[dm] || ""}

你出生在${profile.pillars.month.branch}月——那是${profile.season}。古籍里有一套完整的办法来看一个人在什么节气里带着什么能量来——你的四柱是${profile.pillars.year.stem}${profile.pillars.year.branch} ${profile.pillars.month.stem}${profile.pillars.month.branch} ${profile.pillars.day.stem}${profile.pillars.day.branch} ${profile.pillars.hour ? profile.pillars.hour.stem + profile.pillars.hour.branch : "?"}——这是一个人的"出生能量编码"。这份报告由七层古典算法直接生成——算法是古籍的忠实翻译，但少了老师父的温度。等AI恢复后，你会收到一份更有"人味"的读解。`,

      yourPattern: `你的命盘格局是：${profile.geJu.patternName}。在子平法里，格局就像命盘的主旋律——它决定了你一生的"基本面"。${strongestEl}在你身上是最强的一种能量，它是你天生的"顺手工具"；而${weakestEl}需要你有意识地去关注和补足。${profile.pillars.month.branch}月是你的提纲——它决定了${profile.season}的能量是你命盘的底色。你的日主属于${profile.strength.band}（得分${profile.strength.totalScore.toFixed(1)}）——这不是说你好不好，而是说你的能量的'密度'和'流通程度'。${profile.strength.roots.note}。${profile.strength.heavenly.note}。`,

      whatGuidesYou: `古典算法识别出${yongShenEl}是你的用神——也就是八字系统里最支持你、让你'顺'的那个元素。这不是迷信，是共振。当${yongShenEl}的能量出现在你的环境（颜色、方向、季节、材质）里的时候，你做决策更清晰、情绪更稳定、机会更容易被你注意到。古籍《子平真诠》描述这个原则：${profile.yongShen.principle}。你的喜神是${(profile.yongShen.xiShen || []).join(", ")}——它们是辅助你用神的"队友"。需要留意的是忌神：${jiShenList}——不是说这些元素是坏的，而是说当它们的能量太强时，你会下意识做出不太对的选择。${profile.tiaoHou ? "《穷通宝鉴》补充道：" + profile.tiaoHou.note : ""}`,

      practicalSteps: [
        `接近${elColors[yongShenEl] || yongShenEl + "色系"}——穿衣、办公桌、日常随手触碰的东西，都可以往这个方向选。颜色不是在改变命运，是在提醒你的潜意识：'我在往对的方向走。'`,
        `做重要决定时，面向${elDirections[yongShenEl] || yongShenEl}。这不是练气功，是让你在物理空间上对齐自己的'顺位方向'。`,
        `${elSeasons[yongShenEl] || yongShenEl + "的季节"}是你天然的'顺期'。重大决定、重要启动，尽量放在这个时间段。你会发现事情推进得更自然。`,
        `留意你的${profile.health.weakest.organ}——在五行里属${weakestEl}，是你最薄弱的环节。不需要大补特补，就是每天多给它一点点关注，积少成多。`
      ],

      closingWords: `${dm}${dmEl}——你的日主是你之所以为你的根本。这份报告的每一句话，归根到底，都在说同一个东西：你有一个人生的'顺位'，${yongShenEl}就是那个方向。这些不是规则、不是教条——是一个邀请。邀请你去观察：什么是你本来就有的力量，什么是你可以稍微多靠近一点的方向。`
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
        title: "月令提纲里的秘密",
        insight: `在《渊海子平》里，月柱被称为"提纲"——提纲挈领，是整张命盘的总开关。你的月柱是${monthBr}，里面藏着${monthHidden.map(h => h.stem).join("、")}。一般人看月令只看表面的气象，但我注意到${monthHidden[0]?.stem || "主气"}作为${monthHidden[0]?.tenGod || "主导能量"}——这意味着你人生的核心主题，其实不像表面上看起来那么简单。当${yongShenEl}与这个藏干发生共振时（每年有几个月是如此），你的直觉会格外敏锐——那几天做的决定，往往是对你最有利的。这是老师父才知道的小事。`
      },
      {
        title: "你的日柱藏干——命盘的核心密码",
        insight: `《滴天髓》有一句话："欲识三元万法宗，先观帝载与神功。"意思是你想看懂一个人的命，先看他的日柱。你的${dm}${dmEl}日主坐于${profile.pillars.day.branch}之上，里面藏着${dayHidden.map(h => h.stem).join("、")}。${dayHidden[0]?.stem || "主气"}作为${dayHidden[0]?.tenGod || "核心能量"}——这层关系是很多年轻命师会忽略的。日柱藏干是一个人"心底的秘密"——你嘴上不说，但你最在乎的、最怕的、最想要的，都在这里了。理解了这个，你就理解了这辈子最核心的矛盾和动力。`
      },
      {
        title: "季节的脉——你为什么会周期性不一样",
        insight: `《穷通宝鉴》是专门讲"调候"的古籍——就是看你的命盘在不同季节里是怎么"呼吸"的。你的日主${dm}${dmEl}，出生在${profile.season}，${profile.strength.monthly?.rank || "有一定的季节位置"}。每一年的季节转换（特别是立春、立夏、立秋、立冬前后两周），你的能量系统都在做一次微调。这就是为什么你有时候会突然觉得"不对劲"或者"特别顺"——不是你的问题，是天气在跟你的命盘对话。懂得这个节奏之后，你就可以跟自己和解：那不是情绪波动，那是命理的季节更替。`
      }
    ];
  }

  function buildFallbackJewelry(profile) {
    const yongShenEl = profile.yongShen.yongShen;
    const jiShenEl = (profile.yongShen.jiShen || [])[0] || "暂未明确识别";
    const crystalMap = {
      Wood: { primary: "绿松石 或 翠玉", secondary: "天河石", avoid: "含铁量高的黑色矿石（过度金气克木）" },
      Fire: { primary: "红玛瑙 或 朱砂石", secondary: "黄水晶", avoid: "大量黑色水体矿石（水克火）" },
      Earth: { primary: "黄水晶 或 虎眼石", secondary: "红玛瑙", avoid: "过量青色木属性灵石（木克土）" },
      Metal: { primary: "白水晶 或 月光石", secondary: "黑曜石", avoid: "大量红色火属性矿石（火克金）" },
      Water: { primary: "黑曜石 或 青金石", secondary: "白水晶", avoid: "过量黄色土属性灵石（土克水）" }
    };
    const c = crystalMap[yongShenEl] || crystalMap.Wood;

    return {
      primaryCrystal: {
        name: c.primary,
        element: yongShenEl,
        whyForThisChart: `${c.primary}承载着${yongShenEl}的能量——这正是你的用神所在，是你命盘中最需要被"唤醒"的频率。在你的命盘里，${yongShenEl}是你往正确方向走的路标。这块石头不是装饰——是你的用神在你手腕上的一个印记。每次看到它，你的潜意识就知道："我在对的方向上。"`,
        wearingGuidance: `戴在左手（接收能量）。在${yongShenEl}当令的季节效果最佳。每天早上出门前，先握一握这块石头，让它的温度变成一个仪式：你告诉自己，今天往你的方向走。`
      },
      secondaryCrystal: {
        name: c.secondary,
        element: yongShenEl,
        whyForThisChart: `${c.secondary}是${c.primary}的护法——它的能量比主石柔和，适合日常佩戴。如果说主石是你的"指北针"，护法石就是你的"定心丸"。两者搭配，一个给你方向，一个给你安宁。`,
        wearingGuidance: "日常佩戴。可单独戴，也可与主石同戴——一左一右，互不干扰。"
      },
      masterNote: "我们这一派有一句话：灵石认主，不是你挑选了石头，是你的命盘帮我选了它。石头不能改变你的命，但它能在你迷茫时提醒你：'你是有方向的。'你每一次摸到它，都是一次自我确认。久而久之，那个方向会变成你的肌肉记忆——不需要石头你也能找到。这就是灵石的真正意义：它是一面镜子，照出你本来就有的力量。",
      whatToAvoid: `避开承载大量${jiShenEl}元素能量的矿石——那会让你的忌神能量加倍，往不该去的地方走得更快。`
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
