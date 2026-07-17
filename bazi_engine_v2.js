/**
 * bazi_engine_v2.js — Seven-Layer Classical Zi Ping BaZi Engine
 *
 * Architecture (per 《渊海子平》《子平真诠》《滴天髓》《穷通宝鉴》《三命通会》):
 *   Layer 1: Chart Layout (排盘) — Pillars, Hidden Stems, Na Yin, Kong Wang
 *   Layer 2: Strength Assessment (旺衰) — Monthly command, earthly roots, heavenly support
 *   Layer 3: Pattern Identification (格局) — Eight standard patterns + special patterns
 *   Layer 4: Useful God & Likes/Dislikes (用神喜忌) — Shun Yong / Ni Yong principle
 *   Layer 5: Symbolic Stars (神煞) — Tian Yi, Wen Chang, Tao Hua, Yi Ma, etc.
 *   Layer 6: Da Yun & Liu Nian (大运流年) — 10-year luck cycles + annual analysis
 *   Layer 7: Specialized Readings (专项分析) — Career, Wealth, Marriage, Health
 *
 * Usage:
 *   const profile = BaziEngineV2.calculateProfile({
 *     birthDate: "1990-05-15",
 *     birthTime: "14:30",
 *     birthLocation: "Beijing",
 *     gender: "male",
 *     lifeFocus: "career"
 *   });
 *
 * Dependencies: None (pure client-side computation)
 * Backward compatible: Exports as window.BaziEngineV2 (separate from window.BaziEngine)
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // CONSTANTS & LOOKUP TABLES
  // ═══════════════════════════════════════════════════════════════

  const STEMS = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
  const BRANCHES = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];
  const ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const STEM_ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
  const BRANCH_ELEMENTS = ["Water", "Earth", "Wood", "Wood", "Earth", "Fire", "Fire", "Earth", "Metal", "Metal", "Earth", "Water"];
  const POLARITY = ["Yang", "Yin", "Yang", "Yin", "Yang", "Yin", "Yang", "Yin", "Yang", "Yin"];
  const ELEMENT_ORDER = ["Wood", "Fire", "Earth", "Metal", "Water"];

  // Hidden Stems (支藏人元) — per 《渊海子平》
  const HIDDEN_STEMS = {
    Zi: ["Gui"],
    Chou: ["Ji", "Gui", "Xin"],
    Yin: ["Jia", "Bing", "Wu"],
    Mao: ["Yi"],
    Chen: ["Wu", "Yi", "Gui"],
    Si: ["Bing", "Wu", "Geng"],
    Wu: ["Ding", "Ji"],
    Wei: ["Ji", "Ding", "Yi"],
    Shen: ["Geng", "Ren", "Wu"],
    You: ["Xin"],
    Xu: ["Wu", "Xin", "Ding"],
    Hai: ["Ren", "Jia"]
  };
  const HIDDEN_STEM_RANKS = ["Main Qi", "Middle Qi", "Residual Qi"];

  // ═══════════════════════════════════════════════════════════════
  // NA YIN (纳音) — 60 Jia Zi sound elements
  // ═══════════════════════════════════════════════════════════════
  const NA_YIN = [
    "Sea Metal", "Sea Metal", "Furnace Fire", "Furnace Fire", "Forest Wood", "Forest Wood",
    "Roadside Earth", "Roadside Earth", "Sword Metal", "Sword Metal", "Mountain Fire", "Mountain Fire",
    "Stream Water", "Stream Water", "City Wall Earth", "City Wall Earth", "White Wax Metal", "White Wax Metal",
    "Willow Wood", "Willow Wood", "Spring Water", "Spring Water", "Roof Earth", "Roof Earth",
    "Thunder Fire", "Thunder Fire", "Pine Wood", "Pine Wood", "Flowing Water", "Flowing Water",
    "Sand Metal", "Sand Metal", "Mountain Fire", "Mountain Fire", "Flat Wood", "Flat Wood",
    "Wall Earth", "Wall Earth", "Gold Foil Metal", "Gold Foil Metal", "Covered Lamp Fire", "Covered Lamp Fire",
    "Heaven River Water", "Heaven River Water", "Great Station Earth", "Great Station Earth", "Hairpin Metal", "Hairpin Metal",
    "Mulberry Wood", "Mulberry Wood", "Great Stream Water", "Great Stream Water", "Sand Earth", "Sand Earth",
    "Heaven Fire", "Heaven Fire", "Pomegranate Wood", "Pomegranate Wood", "Ocean Water", "Ocean Water"
  ];

  // ═══════════════════════════════════════════════════════════════
  // TWELVE STAGE (长生十二宫)
  // ═══════════════════════════════════════════════════════════════
  const TWELVE_STAGE_START = {
    Jia: "Hai", Bing: "Yin", Wu: "Yin", Geng: "Si", Ren: "Shen",
    Yi: "Wu", Ding: "You", Ji: "You", Xin: "Zi", Gui: "Mao"
  };
  const TWELVE_STAGE_DIRECTION = {
    Jia: 1, Bing: 1, Wu: 1, Geng: 1, Ren: 1,
    Yi: -1, Ding: -1, Ji: -1, Xin: -1, Gui: -1
  };
  const TWELVE_STAGE_NAMES = [
    "Chang Sheng", "Mu Yu", "Guan Dai", "Lin Guan", "Di Wang",
    "Shuai", "Bing", "Si", "Mu", "Jue", "Tai", "Yang"
  ];
  const TWELVE_STAGE_MEANINGS = {
    "Chang Sheng": "Birth and renewal — fresh energy emerges, the beginning of strength and potential",
    "Mu Yu": "Exposure and sensitivity — attraction mixed with vulnerability, refinement without stability",
    "Guan Dai": "Formation and presentation — learning rank, preparing to stand on one's own",
    "Lin Guan": "Arrival and responsibility — usable strength crystallizes, direct action becomes possible",
    "Di Wang": "Peak force and confidence — the zenith of power, requiring wise regulation to avoid excess",
    "Shuai": "Decline and reduced momentum — the need to conserve rather than expand",
    "Bing": "Illness and fatigue — vulnerability surfaces, careful maintenance is required",
    "Si": "Ending and stillness — hidden pressure, the old form dissolves",
    "Mu": "Storage and reserve — what is buried or protected, containment is the natural state",
    "Jue": "Severance and emptiness — transition through void, renewal becomes necessary",
    "Tai": "Conception and quiet potential — early formation beneath the surface",
    "Yang": "Nourishment and protection — gradual recovery, preparation for the next cycle"
  };

  // ═══════════════════════════════════════════════════════════════
  // BRANCH RELATIONSHIPS (冲合刑害)
  // ═══════════════════════════════════════════════════════════════
  const BRANCH_CLASHES = {
    Zi: "Wu", Chou: "Wei", Yin: "Shen", Mao: "You", Chen: "Xu", Si: "Hai",
    Wu: "Zi", Wei: "Chou", Shen: "Yin", You: "Mao", Xu: "Chen", Hai: "Si"
  };
  const BRANCH_SIX_COMBINATIONS = {
    Zi: "Chou", Chou: "Zi", Yin: "Hai", Hai: "Yin",
    Mao: "Xu", Xu: "Mao", Chen: "You", You: "Chen",
    Si: "Shen", Shen: "Si", Wu: "Wei", Wei: "Wu"
  };
  const BRANCH_THREE_COMBINATIONS = {
    Shen: { with: ["Zi", "Chen"], element: "Water", name: "Shen-Zi-Chen Water" },
    Zi: { with: ["Shen", "Chen"], element: "Water", name: "Shen-Zi-Chen Water" },
    Chen: { with: ["Shen", "Zi"], element: "Water", name: "Shen-Zi-Chen Water" },
    Si: { with: ["You", "Chou"], element: "Metal", name: "Si-You-Chou Metal" },
    You: { with: ["Si", "Chou"], element: "Metal", name: "Si-You-Chou Metal" },
    Chou: { with: ["Si", "You"], element: "Metal", name: "Si-You-Chou Metal" },
    Yin: { with: ["Wu", "Xu"], element: "Fire", name: "Yin-Wu-Xu Fire" },
    Wu: { with: ["Yin", "Xu"], element: "Fire", name: "Yin-Wu-Xu Fire" },
    Xu: { with: ["Yin", "Wu"], element: "Fire", name: "Yin-Wu-Xu Fire" },
    Hai: { with: ["Mao", "Wei"], element: "Wood", name: "Hai-Mao-Wei Wood" },
    Mao: { with: ["Hai", "Wei"], element: "Wood", name: "Hai-Mao-Wei Wood" },
    Wei: { with: ["Hai", "Mao"], element: "Wood", name: "Hai-Mao-Wei Wood" }
  };
  const BRANCH_HARMS = {
    Zi: "Wei", Chou: "Wu", Yin: "Si", Mao: "Chen",
    Chen: "Mao", Si: "Yin", Wu: "Chou", Wei: "Zi",
    Shen: "Hai", You: "Xu", Xu: "You", Hai: "Shen"
  };
  const BRANCH_PENALTIES = {
    Yin: ["Si", "Shen"],
    Si: ["Shen", "Yin"],
    Shen: ["Yin", "Si"],
    Chou: ["Xu", "Wei"],
    Xu: ["Wei", "Chou"],
    Wei: ["Chou", "Xu"],
    Zi: ["Mao"],
    Mao: ["Zi"],
    Chen: ["Chen"],
    Wu: ["Wu"],
    You: ["You"],
    Hai: ["Hai"]
  };

  // ═══════════════════════════════════════════════════════════════
  // TEN GODS (十神)
  // ═══════════════════════════════════════════════════════════════
  const TEN_GOD_MEANINGS = {
    "Friend": "Peer force, self-assertion, identity, the need to stand independently",
    "Rob Wealth": "Competition, shared resources, social pressure, tendency for energy or wealth to scatter",
    "Eating God": "Talent, ease of expression, nourishment, creative output, inner contentment",
    "Hurting Officer": "Sharp expression, refusal of constraint, visibility, friction with authority",
    "Indirect Wealth": "Opportunity, movement, outside resources, flexible income, risk appetite",
    "Direct Wealth": "Stable income, responsibility, management, practical value, material grounding",
    "Seven Killings": "Pressure, risk, discipline, urgency, converting stress into courage and action",
    "Direct Officer": "Order, reputation, rules, rank, proper responsibility, social standing",
    "Indirect Resource": "Intuition, unconventional study, protection, inner recovery, hidden support",
    "Direct Resource": "Formal learning, patience, guidance, steady recovery, institutional support"
  };

  // ═══════════════════════════════════════════════════════════════
  // SEASONAL COMMAND (月令)
  // ═══════════════════════════════════════════════════════════════
  const BRANCH_SEASON = {
    Yin: "Spring", Mao: "Spring", Chen: "Spring",
    Si: "Summer", Wu: "Summer", Wei: "Summer",
    Shen: "Autumn", You: "Autumn", Xu: "Autumn",
    Hai: "Winter", Zi: "Winter", Chou: "Winter"
  };
  const SEASONAL_COMMAND_TEXT = {
    Spring: "Wood command is active — growth, direction, planning, and outward movement carry force",
    Summer: "Fire command is active — visibility, heat, expression, and urgency carry force",
    Autumn: "Metal command is active — order, judgment, standards, and cutting decisions carry force",
    Winter: "Water command is active — storage, reflection, depth, wisdom, and hidden movement carry force"
  };
  const SEASON_REGULATORS = {
    Spring: { primary: "Metal", secondary: "Earth", reason: "Spring Wood can become too spreading; Metal prunes and Earth anchors" },
    Summer: { primary: "Water", secondary: "Metal", reason: "Summer Fire can burn too hot and fast; Water cools and Metal contains" },
    Autumn: { primary: "Fire", secondary: "Water", reason: "Autumn Metal can become cold and sharp; Fire warms and Water prevents dryness" },
    Winter: { primary: "Fire", secondary: "Wood", reason: "Winter Water can become too cold and stored; Fire warms and Wood revives" }
  };

  // ═══════════════════════════════════════════════════════════════
  // TIAO HOU (调候) — Per 《穷通宝鉴》, monthly climate adjustment
  // ═══════════════════════════════════════════════════════════════
  // [monthBranch][dayStem] = { primary, secondary, note }
  const TIAO_HOU = {
    Yin: {  // 正月 (January) — Early Spring, still cold
      Jia: { primary: "Fire", secondary: "Water", note: "Early spring Wood needs Fire to warm; if Fire is excessive, Water to regulate" },
      Yi: { primary: "Fire", secondary: "Water", note: "Tender Wood cannot bear cold; Fire first, Water only if Fire is excessive" },
      Bing: { primary: "Wood", secondary: "Fire", note: "Fire in spring needs Wood fuel; Metal must not harm Wood" },
      Ding: { primary: "Wood", secondary: null, note: "Spring Ding Fire is gentle; Wood nourishment needed, avoid excessive Water" },
      Wu: { primary: "Fire", secondary: "Wood", note: "Spring Earth is still cold; Fire to warm, Wood to till" },
      Ji: { primary: "Fire", secondary: "Wood", note: "Spring Ji Earth needs warmth; Fire first, then Wood to loosen" },
      Geng: { primary: "Fire", secondary: "Wood", note: "Spring Metal is weak and cold; Fire to forge, Wood as secondary" },
      Xin: { primary: "Fire", secondary: "Water", note: "Spring Xin is delicate; Fire warms, Water tempers, but both in measure" },
      Ren: { primary: "Fire", secondary: "Wood", note: "Spring Water is still cold; Fire to warm, Wood to drain excess" },
      Gui: { primary: "Fire", secondary: "Wood", note: "Spring Gui Water is weak; Fire warms, Wood gives direction" }
    },
    Mao: {  // 二月 (February) — Mid Spring, Wood flourishes
      Jia: { primary: "Metal", secondary: "Fire", note: "Wood at peak needs Metal to prune; Fire for expression" },
      Yi: { primary: "Metal", secondary: "Fire", note: "Flourishing Yi Wood needs Metal pruning; Fire for blossoming" },
      Bing: { primary: "Wood", secondary: "Metal", note: "Fire needs Wood fuel in spring; Metal to regulate if too fierce" },
      Ding: { primary: "Wood", secondary: "Metal", note: "Ding Fire gentle in Mao month; Wood supports, Metal regulates" },
      Wu: { primary: "Wood", secondary: "Fire", note: "Earth thrives with Wood tilling and Fire warming" },
      Ji: { primary: "Wood", secondary: "Metal", note: "Ji Earth in Mao month needs Wood to loosen and Metal to structure" },
      Geng: { primary: "Fire", secondary: "Wood", note: "Geng Metal in spring needs Fire to forge; Wood provides fuel" },
      Xin: { primary: "Water", secondary: "Fire", note: "Xin Metal in spring is delicate; Water nourishes, Fire tempers" },
      Ren: { primary: "Wood", secondary: "Fire", note: "Ren Water in Mao month needs Wood to drain and Fire to warm" },
      Gui: { primary: "Wood", secondary: "Fire", note: "Gui Water weak in spring needs Wood direction and Fire warmth" }
    },
    Chen: {  // 三月 (March) — Late Spring, Earth dominates, transition to summer
      Jia: { primary: "Fire", secondary: "Metal", note: "Late spring Wood abundant; Fire to flourish, Metal to prune" },
      Yi: { primary: "Fire", secondary: "Metal", note: "Yi Wood in Chen needs Fire for flowering; Metal control" },
      Bing: { primary: "Wood", secondary: "Fire", note: "Cheng month Fire rising; Wood fuel supports the ascent" },
      Ding: { primary: "Wood", secondary: "Fire", note: "Ding Fire in late spring; Wood nourishes, avoid drowning in Water" },
      Wu: { primary: "Fire", secondary: "Water", note: "Earth in Chen month; Fire to warm, Water needed if too dry" },
      Ji: { primary: "Fire", secondary: "Metal", note: "Ji Earth in Chen needs Fire warmth and Metal structuring" },
      Geng: { primary: "Fire", secondary: "Earth", note: "Geng Metal in late spring; Fire to forge, Earth for support" },
      Xin: { primary: "Water", secondary: "Earth", note: "Xin Metal delicate; Water nourishment, Earth to stabilize" },
      Ren: { primary: "Fire", secondary: "Earth", note: "Ren Water in Chen; Fire warms, Earth contains" },
      Gui: { primary: "Fire", secondary: "Earth", note: "Gui Water; Fire warmth, Earth boundaries" }
    },
    Si: {  // 四月 (April) — Early Summer, Fire rising
      Jia: { primary: "Water", secondary: "Metal", note: "Summer Wood dries; Water to nourish, Metal to prune" },
      Yi: { primary: "Water", secondary: null, note: "Summer Yi Wood wilts without Water; avoid excessive Fire" },
      Bing: { primary: "Water", secondary: "Metal", note: "Bing Fire at peak in Si; Water to regulate, Metal to contain" },
      Ding: { primary: "Wood", secondary: "Water", note: "Ding Fire in Si; Wood fuel sustains, Water tempers" },
      Wu: { primary: "Water", secondary: "Metal", note: "Summer Earth dries; Water first for moisture, Metal to structure" },
      Ji: { primary: "Water", secondary: "Metal", note: "Ji Earth in Si needs Water urgently; Metal helps retain moisture" },
      Geng: { primary: "Water", secondary: "Earth", note: "Summer Metal softens; Water to cool, Earth to support" },
      Xin: { primary: "Water", secondary: null, note: "Xin Metal in summer heat; Water is essential to prevent melting" },
      Ren: { primary: "Metal", secondary: "Water", note: "Summer Water evaporates; Metal to generate more Water" },
      Gui: { primary: "Metal", secondary: null, note: "Gui Water in Si; Metal generates Water, prevents drying" }
    },
    Wu: {  // 五月 (May) — Mid Summer, Fire at peak
      Jia: { primary: "Water", secondary: "Metal", note: "Peak summer Wood burns without Water; Metal generates Water" },
      Yi: { primary: "Water", secondary: null, note: "Yi Wood scorched in Wu; only Water saves" },
      Bing: { primary: "Water", secondary: "Metal", note: "Bing Fire at zenith; Water regulates, Metal produces Water" },
      Ding: { primary: "Water", secondary: "Metal", note: "Ding Fire intense; Water moderation, Metal for sustained cooling" },
      Wu: { primary: "Water", secondary: "Metal", note: "Wu Earth baked dry; Water is life-saving, Metal structures" },
      Ji: { primary: "Water", secondary: "Metal", note: "Ji Earth in Wu; Water first, Metal second" },
      Geng: { primary: "Water", secondary: "Earth", note: "Geng Metal melting; Water to cool, Earth to stabilize" },
      Xin: { primary: "Water", secondary: "Earth", note: "Xin Metal near melting; Water essential" },
      Ren: { primary: "Metal", secondary: "Water", note: "Ren Water drying; Metal to regenerate Water" },
      Gui: { primary: "Metal", secondary: null, note: "Gui Water; Metal is critical to prevent complete evaporation" }
    },
    Wei: {  // 六月 (June) — Late Summer, Earth dominates, transition to autumn
      Jia: { primary: "Water", secondary: "Metal", note: "Late summer Wood depleted; Water to revive, Metal to prune" },
      Yi: { primary: "Water", secondary: null, note: "Yi Wood exhausted; Water nourishment first" },
      Bing: { primary: "Water", secondary: "Metal", note: "Fire waning but still hot; Water to cool, Metal to contain" },
      Ding: { primary: "Wood", secondary: "Water", note: "Ding Fire in Wei; Wood fuel, Water if too dry" },
      Wu: { primary: "Water", secondary: "Fire", note: "Wu Earth in Wei needs Water balance and gentle Fire" },
      Ji: { primary: "Water", secondary: "Metal", note: "Ji Earth needs moisture and structure" },
      Geng: { primary: "Earth", secondary: "Water", note: "Geng Metal in Wei; Earth support, Water to temper" },
      Xin: { primary: "Earth", secondary: "Water", note: "Xin Metal; Earth nourishes, Water polishes" },
      Ren: { primary: "Metal", secondary: "Fire", note: "Ren Water; Metal generates, Fire warms slightly" },
      Gui: { primary: "Metal", secondary: "Fire", note: "Gui Water; Metal to produce, gentle Fire warmth" }
    },
    Shen: {  // 七月 (July) — Early Autumn, Metal rising
      Jia: { primary: "Metal", secondary: "Fire", note: "Autumn Wood; Metal to prune and shape, Fire for expression" },
      Yi: { primary: "Metal", secondary: "Fire", note: "Yi Wood in autumn; Metal pruning, Fire warmth" },
      Bing: { primary: "Wood", secondary: "Fire", note: "Autumn Fire fades; Wood fuel to sustain, avoid Water drowning" },
      Ding: { primary: "Wood", secondary: null, note: "Ding Fire declining; Wood supports the flame" },
      Wu: { primary: "Fire", secondary: "Water", note: "Autumn Earth cold; Fire warms, Water needed if too dry" },
      Ji: { primary: "Fire", secondary: "Wood", note: "Ji Earth in Shen; Fire warmth, Wood to loosen" },
      Geng: { primary: "Fire", secondary: "Water", note: "Geng Metal at peak in Shen; Fire to forge, Water to temper" },
      Xin: { primary: "Water", secondary: null, note: "Xin Metal in Shen; Water polishes to reveal brilliance" },
      Ren: { primary: "Wood", secondary: "Fire", note: "Autumn Water; Wood to drain, Fire to warm" },
      Gui: { primary: "Wood", secondary: "Fire", note: "Gui Water; Wood for direction, Fire for warmth" }
    },
    You: {  // 八月 (August) — Mid Autumn, Metal at peak
      Jia: { primary: "Metal", secondary: "Fire", note: "Wood in peak Metal month; Metal pruning essential, Fire secondary" },
      Yi: { primary: "Metal", secondary: "Fire", note: "Yi Wood in You; Metal shapes, Fire provides warmth" },
      Bing: { primary: "Wood", secondary: null, note: "Fire dying in You month; Wood fuel critical" },
      Ding: { primary: "Wood", secondary: null, note: "Ding Fire barely flickering; Wood is essential" },
      Wu: { primary: "Fire", secondary: "Wood", note: "Earth in You; Fire to warm, Wood to till" },
      Ji: { primary: "Fire", secondary: "Wood", note: "Ji Earth in You; Fire warmth, Wood loosening" },
      Geng: { primary: "Fire", secondary: "Water", note: "Geng Metal at zenith; Fire forges, Water tempers" },
      Xin: { primary: "Water", secondary: "Fire", note: "Xin Metal at peak; Water first for brilliance, Fire for tempering" },
      Ren: { primary: "Wood", secondary: "Fire", note: "Ren Water; Wood drains, Fire warms" },
      Gui: { primary: "Wood", secondary: "Fire", note: "Gui Water in You; Wood direction, Fire warmth" }
    },
    Xu: {  // 九月 (September) — Late Autumn, Earth dominates
      Jia: { primary: "Metal", secondary: "Fire", note: "Late autumn Wood; Metal prunes, Fire warms" },
      Yi: { primary: "Metal", secondary: "Fire", note: "Yi Wood in Xu; Metal shapes, Fire keeps from freezing" },
      Bing: { primary: "Wood", secondary: "Fire", note: "Fire in Xu fading; Wood fuel, gentle Fire" },
      Ding: { primary: "Wood", secondary: "Fire", note: "Ding Fire in Xu; Wood essential, gentle Fire warmth" },
      Wu: { primary: "Fire", secondary: "Water", note: "Wu Earth in Xu; Fire warms, Water balances" },
      Ji: { primary: "Fire", secondary: "Metal", note: "Ji Earth needs warmth and structure" },
      Geng: { primary: "Fire", secondary: "Earth", note: "Geng Metal in Xu; Fire to forge, Earth to support" },
      Xin: { primary: "Water", secondary: "Earth", note: "Xin Metal in late autumn; Water polishes, Earth stabilizes" },
      Ren: { primary: "Fire", secondary: "Wood", note: "Ren Water cooling; Fire warms, Wood drains" },
      Gui: { primary: "Fire", secondary: "Wood", note: "Gui Water in Xu; Fire warmth, Wood direction" }
    },
    Hai: {  // 十月 (October) — Early Winter, Water rising
      Jia: { primary: "Fire", secondary: "Metal", note: "Winter Wood frozen; Fire to thaw, Metal to prune" },
      Yi: { primary: "Fire", secondary: null, note: "Yi Wood in winter; Fire is essential for survival" },
      Bing: { primary: "Wood", secondary: "Fire", note: "Winter Fire dim; Wood fuel essential, Fire to sustain" },
      Ding: { primary: "Wood", secondary: "Fire", note: "Ding Fire in winter; Wood essential, Fire secondary" },
      Wu: { primary: "Fire", secondary: "Wood", note: "Winter Earth frozen; Fire to thaw, Wood to till" },
      Ji: { primary: "Fire", secondary: "Wood", note: "Ji Earth in Hai; Fire warmth, Wood to loosen" },
      Geng: { primary: "Fire", secondary: "Wood", note: "Winter Metal frozen; Fire to warm, Wood as fuel" },
      Xin: { primary: "Fire", secondary: "Water", note: "Winter Xin Metal; Fire warms, Water polishes" },
      Ren: { primary: "Wood", secondary: "Fire", note: "Ren Water at peak in Hai; Wood drains, Fire warms" },
      Gui: { primary: "Wood", secondary: "Fire", note: "Gui Water in Hai; Wood direction, Fire warmth" }
    },
    Zi: {  // 十一月 (November) — Mid Winter, Water at peak
      Jia: { primary: "Fire", secondary: "Metal", note: "Deep winter Wood; Fire to thaw frozen roots, Metal pruning" },
      Yi: { primary: "Fire", secondary: null, note: "Yi Wood in peak cold; Fire alone can save" },
      Bing: { primary: "Wood", secondary: "Fire", note: "Winter Fire nearly extinguished; Wood fuel, Fire sustain" },
      Ding: { primary: "Wood", secondary: "Fire", note: "Ding Fire fighting cold; Wood essential, Fire sustain" },
      Wu: { primary: "Fire", secondary: "Wood", note: "Frozen Earth; Fire warmth essential, Wood to till" },
      Ji: { primary: "Fire", secondary: "Wood", note: "Ji Earth frozen solid; Fire first, Wood second" },
      Geng: { primary: "Fire", secondary: "Wood", note: "Frozen Metal; Fire to thaw, Wood as fuel" },
      Xin: { primary: "Fire", secondary: null, note: "Xin Metal in Zi month; Fire warmth to survive" },
      Ren: { primary: "Wood", secondary: "Fire", note: "Ren Water at zenith; Wood drains, Fire warms" },
      Gui: { primary: "Wood", secondary: "Fire", note: "Gui Water in Zi; Wood direction, Fire warmth" }
    },
    Chou: {  // 十二月 (December) — Late Winter, Earth dominates, transition to spring
      Jia: { primary: "Fire", secondary: "Metal", note: "Late winter Wood preparing; Fire to warm, Metal to prune" },
      Yi: { primary: "Fire", secondary: null, note: "Yi Wood in Chou; Fire warmth is essential" },
      Bing: { primary: "Wood", secondary: "Fire", note: "Fire waiting for spring; Wood fuel, Fire sustain" },
      Ding: { primary: "Wood", secondary: "Fire", note: "Ding Fire needs Wood fuel and gentle Fire support" },
      Wu: { primary: "Fire", secondary: "Wood", note: "Late winter Earth; Fire to thaw, Wood to till" },
      Ji: { primary: "Fire", secondary: "Metal", note: "Ji Earth in Chou; Fire warmth, Metal to structure" },
      Geng: { primary: "Fire", secondary: "Earth", note: "Late winter Metal; Fire to warm, Earth to support" },
      Xin: { primary: "Fire", secondary: "Earth", note: "Xin Metal in Chou; Fire warmth, Earth stability" },
      Ren: { primary: "Fire", secondary: "Wood", note: "Ren Water in Chou; Fire warms, Wood drains" },
      Gui: { primary: "Fire", secondary: "Wood", note: "Gui Water in Chou; Fire warmth, Wood direction" }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SHEN SHA LOOKUP DATA (神煞)
  // ═══════════════════════════════════════════════════════════════

  // Tian Yi Gui Ren (天乙贵人) — per day stem: 甲戊庚牛羊, 乙己鼠猴乡, 丙丁猪鸡位, 壬癸兔蛇藏, 六辛逢马虎
  const TIAN_YI_GUI_REN = {
    Jia: ["Chou", "Wei"], Yi: ["Zi", "Shen"], Bing: ["Hai", "You"], Ding: ["Hai", "You"],
    Wu: ["Chou", "Wei"], Ji: ["Zi", "Shen"], Geng: ["Chou", "Wei"],
    Xin: ["Wu", "Yin"], Ren: ["Mao", "Si"], Gui: ["Mao", "Si"]
  };

  // Wen Chang (文昌贵人) — per day stem
  const WEN_CHANG = {
    Jia: "Si", Yi: "Wu", Bing: "Shen", Ding: "You", Wu: "Shen",
    Ji: "You", Geng: "Hai", Xin: "Zi", Ren: "Yin", Gui: "Mao"
  };

  // Tao Hua / Xian Chi (桃花/咸池) — per year or day branch: 申子辰在酉, 亥卯未在子, 寅午戌在卯, 巳酉丑在午
  const TAO_HUA_GROUPS = {
    Shen: "You", Zi: "You", Chen: "You",
    Hai: "Zi", Mao: "Zi", Wei: "Zi",
    Yin: "Mao", Wu: "Mao", Xu: "Mao",
    Si: "Wu", You: "Wu", Chou: "Wu"
  };

  // Yi Ma (驿马) — per year or day branch
  const YI_MA_GROUPS = {
    Shen: "Yin", Zi: "Yin", Chen: "Yin",
    Hai: "Si", Mao: "Si", Wei: "Si",
    Yin: "Shen", Wu: "Shen", Xu: "Shen",
    Si: "Hai", You: "Hai", Chou: "Hai"
  };

  // Hua Gai (华盖) — per year or day branch
  const HUA_GAI_GROUPS = {
    Shen: "Chen", Zi: "Chen", Chen: "Chen",
    Hai: "Wei", Mao: "Wei", Wei: "Wei",
    Yin: "Xu", Wu: "Xu", Xu: "Xu",
    Si: "Chou", You: "Chou", Chou: "Chou"
  };

  // Yang Ren (羊刃) — per day stem (帝旺 position)
  const YANG_REN = {
    Jia: "Mao", Yi: "Yin", Bing: "Wu", Ding: "Si", Wu: "Wu",
    Ji: "Si", Geng: "You", Xin: "Shen", Ren: "Zi", Gui: "Hai"
  };

  // Tian De Gui Ren (天德贵人) — per month branch
  const TIAN_DE = {
    Yin: "Ding", Mao: "Shen", Chen: "Ren", Si: "Xin", Wu: "Hai", Wei: "Jia",
    Shen: "Gui", You: "Yin", Xu: "Bing", Hai: "Yi", Zi: "Si", Chou: "Geng"
  };

  // Yue De Gui Ren (月德贵人) — per month branch
  const YUE_DE = {
    Yin: "Bing", Mao: "Jia", Chen: "Ren", Si: "Geng", Wu: "Bing", Wei: "Jia",
    Shen: "Ren", You: "Geng", Xu: "Bing", Hai: "Jia", Zi: "Ren", Chou: "Geng"
  };

  // Kui Gang (魁罡) — specific day pillars
  const KUI_GANG_DAYS = ["Wu Xu", "Geng Chen", "Geng Xu", "Ren Chen"];

  // ═══════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  function mod(n, m) { return ((n % m) + m) % m; }

  function stemIndex(stem) { return STEMS.indexOf(stem); }

  function branchIndex(branch) { return BRANCHES.indexOf(branch); }

  function elementProduces(el) {
    const i = ELEMENT_ORDER.indexOf(el);
    return ELEMENT_ORDER[(i + 1) % 5];
  }

  function elementProducedBy(el) {
    const i = ELEMENT_ORDER.indexOf(el);
    return ELEMENT_ORDER[(i + 4) % 5];
  }

  function elementControls(el) {
    const i = ELEMENT_ORDER.indexOf(el);
    return ELEMENT_ORDER[(i + 2) % 5];
  }

  function elementControlledBy(el) {
    const i = ELEMENT_ORDER.indexOf(el);
    return ELEMENT_ORDER[(i + 3) % 5];
  }

  function getTenGod(dayStemIdx, otherStemIdx) {
    const dayEl = STEM_ELEMENTS[dayStemIdx];
    const otherEl = STEM_ELEMENTS[otherStemIdx];
    const samePol = POLARITY[dayStemIdx] === POLARITY[otherStemIdx];
    if (dayEl === otherEl) return samePol ? "Friend" : "Rob Wealth";
    if (elementProduces(dayEl) === otherEl) return samePol ? "Eating God" : "Hurting Officer";
    if (elementControls(dayEl) === otherEl) return samePol ? "Indirect Wealth" : "Direct Wealth";
    if (elementControlledBy(dayEl) === otherEl) return samePol ? "Seven Killings" : "Direct Officer";
    return samePol ? "Indirect Resource" : "Direct Resource";
  }

  function getSexagenaryIndex(stemIdx, branchIdx) {
    // The 60-cycle index where 甲子=0
    const stemMod = mod(stemIdx, 10);
    const branchMod = mod(branchIdx, 12);
    for (let i = 0; i < 60; i++) {
      if (i % 10 === stemMod && i % 12 === branchMod) return i;
    }
    return 0;
  }

  function getNaYin(stemIdx, branchIdx) {
    return NA_YIN[getSexagenaryIndex(stemIdx, branchIdx)];
  }

  function getKongWang(branchIdx) {
    // Kong Wang: the two branches missing from the 旬 (10-day block)
    // To find the 旬: the stem of the pillar determines which 旬
    // The 旬 starts at the branch paired with stem 甲 in that 旬
    const xunStartBranch = mod(branchIdx - (branchIdx % 10) + 10 - (branchIdx % 10 % 12), 12);
    // Actually, simpler: find the 旬 start branch from the stem-branch pair
    // 甲子旬(0-9): missing 戌(10)亥(11)
    // 甲戌旬(10-19): missing 申(8)酉(9)
    // 甲申旬(20-29): missing 午(6)未(7)
    // 甲午旬(30-39): missing 辰(4)巳(5)
    // 甲辰旬(40-49): missing 寅(2)卯(3)
    // 甲寅旬(50-59): missing 子(0)丑(1)
    const si = getSexagenaryIndex(0, branchIdx); // approximate
    // Better: The branch determines which 旬 we're in
    // Each 旬 starts at Jia + branch and spans 10 days (10 stems)
    // The two branches not covered are the Kong Wang
    const cycleStart = [0, 10, 20, 30, 40, 50]; // Jia Zi, Jia Xu, Jia Shen, Jia Wu, Jia Chen, Jia Yin
    const kongWangMap = [
      [10, 11], // Jia Zi Xun: Kong Xu(10) Hai(11)
      [8, 9],   // Jia Xu Xun: Kong Shen(8) You(9)
      [6, 7],   // Jia Shen Xun: Kong Wu(6) Wei(7)
      [4, 5],   // Jia Wu Xun: Kong Chen(4) Si(5)
      [2, 3],   // Jia Chen Xun: Kong Yin(2) Mao(3)
      [0, 1]    // Jia Yin Xun: Kong Zi(0) Chou(1)
    ];

    const si60 = getSexagenaryIndex(stemIndex(STEMS[0]), branchIdx);
    // Find which 旬 this belongs to
    for (let i = 0; i < cycleStart.length; i++) {
      const nextStart = (i < cycleStart.length - 1) ? cycleStart[i + 1] : 60;
      if (si60 >= cycleStart[i] && si60 < nextStart) {
        return kongWangMap[i];
      }
    }
    return [0, 1]; // fallback
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 1: SOLAR TERMS ASTRONOMY (preserved from original engine)
  // ═══════════════════════════════════════════════════════════════

  const SOLAR_TERM_NAMES = [
    "Li Chun", "Yu Shui", "Jing Zhe", "Chun Fen",
    "Qing Ming", "Gu Yu", "Li Xia", "Xiao Man",
    "Mang Zhong", "Xia Zhi", "Xiao Shu", "Da Shu",
    "Li Qiu", "Chu Shu", "Bai Lu", "Qiu Fen",
    "Han Lu", "Shuang Jiang", "Li Dong", "Xiao Xue",
    "Da Xue", "Dong Zhi", "Xiao Han", "Da Han"
  ];
  const JIE_INDICES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  const JIE_MONTH_MAP = { 0:0, 2:1, 4:2, 6:3, 8:4, 10:5, 12:6, 14:7, 16:8, 18:9, 20:10, 22:11 };

  function gregorianToJD(year, month, day) {
    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y
      + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  function jdToCalendar(jd) {
    let Z = Math.floor(jd + 0.5);
    let F = jd + 0.5 - Z;
    let A = Z;
    if (Z >= 2299161) {
      let alpha = Math.floor((Z - 1867216.25) / 36524.25);
      A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    let B = A + 1524;
    let C = Math.floor((B - 122.1) / 365.25);
    let D = Math.floor(365.25 * C);
    let E = Math.floor((B - D) / 30.6001);
    let day = B - D - Math.floor(30.6001 * E) + F;
    let month = E < 14 ? E - 1 : E - 13;
    let year = month > 2 ? C - 4716 : C - 4715;
    return { year, month, day: Math.floor(day) };
  }

  function sunLongitude(jd) {
    let T = (jd - 2451545.0) / 36525;
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    let Mrad = M * Math.PI / 180;
    let C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);
    let lon = (L0 + C) % 360;
    if (lon < 0) lon += 360;
    return lon;
  }

  function angleDiff(a, b) {
    let d = a - b;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  function computeSolarTerm(year, termIndex) {
    let targetLon = (315 + termIndex * 15) % 360;
    let jan1JD = gregorianToJD(year, 1, 1);
    let jd = jan1JD + 35 + termIndex * 15.2184;
    for (let iter = 0; iter < 12; iter++) {
      let lon = sunLongitude(jd);
      let diff = angleDiff(lon, targetLon);
      if (Math.abs(diff) < 0.0001) break;
      jd -= diff / 0.9856;
    }
    return jdToCalendar(jd);
  }

  let _solarTermCache = {};
  function getSolarTermDate(year, termIndex) {
    let key = year + "_" + termIndex;
    if (!_solarTermCache[key]) {
      let d = computeSolarTerm(year, termIndex);
      _solarTermCache[key] = [d.month, d.day];
    }
    return _solarTermCache[key];
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 1: TRUE SOLAR TIME & CITY COORDINATES (preserved)
  // ═══════════════════════════════════════════════════════════════
  // [City database preserved from original bazi_engine.js — 90+ cities]
  const CITY_COORDS = {
    "beijing": [39.9, 116.4, 8], "shanghai": [31.2, 121.5, 8], "guangzhou": [23.1, 113.3, 8],
    "shenzhen": [22.5, 114.1, 8], "chengdu": [30.6, 104.1, 8], "chongqing": [29.6, 106.6, 8],
    "tianjin": [39.1, 117.2, 8], "wuhan": [30.6, 114.3, 8], "nanjing": [32.1, 118.8, 8],
    "xian": [34.3, 108.9, 8], "hangzhou": [30.3, 120.2, 8], "suzhou": [31.3, 120.6, 8],
    "kunming": [25.0, 102.7, 8], "xiamen": [24.5, 118.1, 8], "changsha": [28.2, 113.0, 8],
    "zhengzhou": [34.8, 113.6, 8], "jinan": [36.7, 117.0, 8], "taiyuan": [37.9, 112.6, 8],
    "fuzhou": [26.1, 119.3, 8], "guiyang": [26.6, 106.7, 8], "haerbin": [45.8, 126.5, 8],
    "changchun": [43.9, 125.3, 8], "shenyang": [41.8, 123.4, 8], "dalian": [38.9, 121.6, 8],
    "qingdao": [36.1, 120.4, 8], "wulumuqi": [43.8, 87.6, 8], "urumqi": [43.8, 87.6, 8],
    "lanzhou": [36.1, 103.8, 8], "lasa": [29.6, 91.1, 8], "lhasa": [29.6, 91.1, 8],
    "hong kong": [22.3, 114.2, 8], "taipei": [25.0, 121.5, 8], "macau": [22.2, 113.5, 8],
    "singapore": [1.3, 103.8, 8], "kuala lumpur": [3.1, 101.7, 8], "tokyo": [35.7, 139.7, 9],
    "osaka": [34.7, 135.5, 9], "seoul": [37.6, 127.0, 9], "busan": [35.2, 129.1, 9],
    "sydney": [-33.9, 151.2, 10], "melbourne": [-37.8, 145.0, 10], "brisbane": [-27.5, 153.0, 10],
    "perth": [-32.0, 115.9, 8], "auckland": [-36.8, 174.8, 12], "wellington": [-41.3, 174.8, 12],
    "london": [51.5, -0.1, 0], "paris": [48.9, 2.3, 1], "berlin": [52.5, 13.4, 1],
    "new york": [40.7, -74.0, -5], "new york city": [40.7, -74.0, -5], "nyc": [40.7, -74.0, -5],
    "los angeles": [34.1, -118.2, -8], "la": [34.1, -118.2, -8],
    "san francisco": [37.8, -122.4, -8], "sf": [37.8, -122.4, -8],
    "chicago": [41.9, -87.6, -6], "houston": [29.8, -95.4, -6],
    "seattle": [47.6, -122.3, -8], "boston": [42.4, -71.1, -5],
    "toronto": [43.7, -79.4, -5], "vancouver": [49.3, -123.1, -8],
    "sao paulo": [-23.5, -46.6, -3], "buenos aires": [-34.6, -58.4, -3],
    "dubai": [25.2, 55.3, 4], "mumbai": [19.1, 72.9, 5.5], "bangkok": [13.8, 100.5, 7],
    "jakarta": [-6.2, 106.8, 7], "manila": [14.6, 121.0, 8], "moscow": [55.8, 37.6, 3]
  };

  function resolveCityCoords(cityName) {
    if (!cityName) return null;
    let key = cityName.trim().toLowerCase();
    if (CITY_COORDS[key]) return CITY_COORDS[key];
    for (let k in CITY_COORDS) {
      if (key.indexOf(k) !== -1 || k.indexOf(key) !== -1) return CITY_COORDS[k];
    }
    return null;
  }

  function getBrowserTimezoneOffset() {
    return -(new Date().getTimezoneOffset()) / 60;
  }

  function getShiChenIndex(hourFloat) {
    if (hourFloat >= 23 || hourFloat < 1) return 0;
    return Math.floor((hourFloat + 1) / 2);
  }

  const SHI_CHEN_NAMES = ["Zi (子)", "Chou (丑)", "Yin (寅)", "Mao (卯)", "Chen (辰)", "Si (巳)",
    "Wu (午)", "Wei (未)", "Shen (申)", "You (酉)", "Xu (戌)", "Hai (亥)"];

  const SHI_CHEN_ORGANS = {
    0: "Gallbladder (胆)", 1: "Liver (肝)", 2: "Lung (肺)", 3: "Large Intestine (大肠)",
    4: "Stomach (胃)", 5: "Spleen (脾)", 6: "Heart (心)", 7: "Small Intestine (小肠)",
    8: "Bladder (膀胱)", 9: "Kidney (肾)", 10: "Pericardium (心包)", 11: "Triple Burner (三焦)"
  };

  function computeSolarAdjustment(birthTime, cityName) {
    if (!birthTime) return { used: false, note: "No birth time provided; solar adjustment skipped." };
    let parts = birthTime.split(":").map(Number);
    let clockMinutes = parts[0] * 60 + (parts[1] || 0);
    let clockHourFloat = clockMinutes / 60;
    let coords = resolveCityCoords(cityName);
    let usedCityDb = true;
    if (!coords) {
      let tzOffset = getBrowserTimezoneOffset();
      coords = [0, tzOffset * 15, tzOffset];
      usedCityDb = false;
    }
    let lon = coords[1], tzOffset = coords[2];
    let tzMeridian = tzOffset * 15;
    let adjustmentMinutes = (lon - tzMeridian) * 4;
    let solarMinutes = clockMinutes + adjustmentMinutes;
    let solarHourFloat = (solarMinutes / 60) % 24;
    if (solarHourFloat < 0) solarHourFloat += 24;
    let clockShiChen = getShiChenIndex(clockHourFloat);
    let solarShiChen = getShiChenIndex(solarHourFloat);
    let crossing = clockShiChen !== solarShiChen;
    let solarHour = Math.floor(solarHourFloat);
    let solarMin = Math.round((solarHourFloat - solarHour) * 60);
    if (solarMin === 60) { solarHour = (solarHour + 1) % 24; solarMin = 0; }
    let solarTimeStr = String(solarHour).padStart(2, "0") + ":" + String(solarMin).padStart(2, "0");
    let amountStr = (adjustmentMinutes >= 0 ? "+" : "") + Math.round(adjustmentMinutes);
    let note;
    if (usedCityDb) {
      note = "True solar time adjusted by " + amountStr + " min for " + (cityName || "unknown") + " (lon " + lon.toFixed(1) + "°). ";
      note += crossing ? "Crosses a Shi Chen boundary — hour pillar corrected." : "No Shi Chen boundary crossing.";
    } else {
      note = "Solar time estimated from browser timezone (city not in database). Adjustment: " + amountStr + " min.";
    }
    return {
      city: cityName || "unknown", longitude: lon, timezoneMeridian: tzMeridian,
      adjustmentMinutes: Math.round(adjustmentMinutes), clockTime: birthTime,
      solarTime: solarTimeStr, shiChenCrossing: crossing,
      clockShiChen, solarShiChen, used: true, usedCityDb, note
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 1: PILLAR CALCULATION
  // ═══════════════════════════════════════════════════════════════

  function parseBirthDate(dateValue) {
    if (typeof dateValue !== "string") return null;
    const [year, month, day] = dateValue.split("-").map(Number);
    const target = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)
      || target.getUTCFullYear() !== year || target.getUTCMonth() !== month - 1 || target.getUTCDate() !== day)
      return null;
    return { year, month, day };
  }

  function isOnOrAfter(month, day, boundaryMonth, boundaryDay) {
    return month > boundaryMonth || (month === boundaryMonth && day >= boundaryDay);
  }

  function getSolarYear(year, month, day) {
    const liChun = getSolarTermDate(year, 0);
    return isOnOrAfter(month, day, liChun[0], liChun[1]) ? year : year - 1;
  }

  function getYearPillar(year, month, day) {
    const solarYear = getSolarYear(year, month, day);
    return { stemIndex: mod(solarYear - 4, 10), branchIndex: mod(solarYear - 4, 12) };
  }

  function getSolarMonthIndex(month, day, year) {
    for (let i = 0; i < 12; i++) {
      const jieIdx = JIE_INDICES[i];
      const jie = getSolarTermDate(year, jieIdx);
      let nextJieIdx = JIE_INDICES[(i + 1) % 12];
      let nextJie;
      if (nextJieIdx === 0) nextJie = getSolarTermDate(year + 1, 0);
      else nextJie = getSolarTermDate(year, nextJieIdx);
      if (isOnOrAfter(month, day, jie[0], jie[1]) && !isOnOrAfter(month, day, nextJie[0], nextJie[1]))
        return JIE_MONTH_MAP[jieIdx];
    }
    return 11;
  }

  function getMonthPillar(yearStemIndex, month, day, year) {
    const solarMonthIndex = getSolarMonthIndex(month, day, year);
    const tigerStemIndex = mod((yearStemIndex % 5) * 2 + 2, 10);
    return { stemIndex: mod(tigerStemIndex + solarMonthIndex, 10), branchIndex: mod(2 + solarMonthIndex, 12) };
  }

  function getDayPillar(year, month, day) {
    const reference = Date.UTC(1984, 1, 2);
    const target = Date.UTC(year, month - 1, day);
    const diffDays = Math.round((target - reference) / 86400000);
    const cycleIndex = mod(diffDays, 60);
    return { stemIndex: mod(cycleIndex, 10), branchIndex: mod(cycleIndex, 12) };
  }

  function getHourBranchIndex(timeValue) {
    if (!timeValue) return null;
    const [hour] = timeValue.split(":").map(Number);
    return Math.floor(mod(hour + 1, 24) / 2);
  }

  function getHourPillar(dayStemIndex, timeValue) {
    const hbi = getHourBranchIndex(timeValue);
    if (hbi === null) return null;
    const startStemIndex = mod((dayStemIndex % 5) * 2, 10);
    return { stemIndex: mod(startStemIndex + hbi, 10), branchIndex: hbi };
  }

  function describePillar(pillar) {
    return STEMS[pillar.stemIndex] + " " + BRANCHES[pillar.branchIndex];
  }

  function getHiddenStemDetails(branchIdx, dayStemIdx) {
    const branch = BRANCHES[branchIdx];
    return HIDDEN_STEMS[branch].map((stem, i) => ({
      stem,
      element: STEM_ELEMENTS[stemIndex(stem)],
      tenGod: getTenGod(dayStemIdx, stemIndex(stem)),
      rank: HIDDEN_STEM_RANKS[i] || "Residual Qi"
    }));
  }

  function getTwelveStage(dayStem, branch) {
    const startIdx = branchIndex(TWELVE_STAGE_START[dayStem]);
    const brIdx = branchIndex(branch);
    const dir = TWELVE_STAGE_DIRECTION[dayStem];
    const stageIdx = mod((brIdx - startIdx) * dir, 12);
    return { stage: TWELVE_STAGE_NAMES[stageIdx], stageIdx, meaning: TWELVE_STAGE_MEANINGS[TWELVE_STAGE_NAMES[stageIdx]] };
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 2: STRENGTH ASSESSMENT (旺衰) — per 《子平真诠》
  // ═══════════════════════════════════════════════════════════════

  function assessMonthlyCommand(dayStemIdx, monthBranchIdx) {
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    const monthElement = BRANCH_ELEMENTS[monthBranchIdx];
    const monthBranch = BRANCHES[monthBranchIdx];

    // Five Elements in each season: 旺相休囚死
    // Month element is 旺 (prosperous), its child is 相 (strong),
    // its parent is 休 (resting), its controller is 囚 (imprisoned),
    // what it controls is 死 (dead)
    const wang = monthElement;
    const xiang = elementProduces(monthElement);    // child of month
    const xiu = elementProducedBy(monthElement);    // parent of month
    const qiu = elementControls(monthElement);       // controller of month
    const si = elementControlledBy(monthElement);    // controlled by month

    let rank;
    if (dmElement === wang) rank = "Wang (Prosperous — 旺)";
    else if (dmElement === xiang) rank = "Xiang (Strong — 相)";
    else if (dmElement === xiu) rank = "Xiu (Resting — 休)";
    else if (dmElement === qiu) rank = "Qiu (Imprisoned — 囚)";
    else rank = "Si (Dead — 死)";

    const scoreMap = { "Wang (Prosperous — 旺)": 4, "Xiang (Strong — 相)": 3, "Xiu (Resting — 休)": 1.5, "Qiu (Imprisoned — 囚)": 0.8, "Si (Dead — 死)": 0.3 };
    let score = scoreMap[rank] || 1.5;

    // Bonus: Day Master sitting on the month branch main qi (通根于月令)
    const monthMainQi = HIDDEN_STEMS[monthBranch][0];
    if (STEM_ELEMENTS[stemIndex(monthMainQi)] === dmElement) score += 1.5;

    return {
      monthBranch, monthElement, dmElement,
      rank, score,
      summary: dayStemIdx + " " + dmElement + " Day Master in " + monthBranch + " month rates as " + rank + " (score: " + score.toFixed(1) + ")"
    };
  }

  function assessEarthlyRoots(dayStemIdx, pillars) {
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    let rootCount = 0;
    let rootStrength = 0;
    const rootDetails = [];

    ["year", "month", "day", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) return;
      const branch = BRANCHES[pillar.branchIndex];
      const hidden = HIDDEN_STEMS[branch];

      hidden.forEach((stem, i) => {
        if (STEM_ELEMENTS[stemIndex(stem)] === dmElement) {
          const weight = i === 0 ? 0.8 : (i === 1 ? 0.3 : 0.15);
          rootCount++;
          rootStrength += weight;
          rootDetails.push({
            pillar: key,
            branch,
            stem,
            rank: HIDDEN_STEM_RANKS[i] || "Residual Qi",
            weight
          });
        }
      });
    });

    const hasRoot = rootCount > 0;
    const strongRoot = rootStrength >= 1.5;
    const note = hasRoot
      ? (strongRoot ? "Day Master has strong earthly roots (通根有力)" : "Day Master has weak earthly roots (根气不足)")
      : "Day Master has NO earthly roots (无根) — highly dependent on heavenly support";

    return { rootCount, rootStrength, rootDetails, hasRoot, strongRoot, note, score: Math.min(3, rootStrength * 1.5) };
  }

  function assessHeavenlySupport(dayStemIdx, pillars) {
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    const resourceElement = elementProducedBy(dmElement);
    let companionCount = 0;
    let resourceCount = 0;

    ["year", "month", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) return;
      const stemEl = STEM_ELEMENTS[pillar.stemIndex];
      if (stemEl === dmElement) companionCount++;
      if (stemEl === resourceElement) resourceCount++;
    });

    const score = companionCount * 1.2 + resourceCount * 0.8;
    return {
      companionCount, resourceCount, score,
      note: companionCount > 0 || resourceCount > 0
        ? "Heavenly stems provide support (" + companionCount + " companions, " + resourceCount + " resources)"
        : "No heavenly stem support — Day Master stands alone in heaven"
    };
  }

  function assessStrength(dayStemIdx, pillars) {
    const monthly = assessMonthlyCommand(dayStemIdx, pillars.month.branchIndex);
    const roots = assessEarthlyRoots(dayStemIdx, pillars);
    const heavenly = assessHeavenlySupport(dayStemIdx, pillars);

    const totalScore = monthly.score + roots.score + heavenly.score;

    let band, bandLabel;
    if (totalScore >= 7) { band = "Very Strong"; bandLabel = "极旺"; }
    else if (totalScore >= 5) { band = "Strong"; bandLabel = "偏旺"; }
    else if (totalScore >= 3) { band = "Balanced"; bandLabel = "中和"; }
    else if (totalScore >= 1.5) { band = "Weak"; bandLabel = "偏弱"; }
    else { band = "Very Weak"; bandLabel = "极弱"; }

    const canFollow = (band === "Very Strong" || band === "Very Weak");

    return {
      monthly, roots, heavenly,
      totalScore, band, bandLabel, canFollow,
      summary: dayStemIdx + " Day Master strength: " + bandLabel + " (" + band + "), total score " + totalScore.toFixed(1)
        + ". Monthly command: " + monthly.rank + ". " + roots.note + ". " + heavenly.note + "."
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 3: PATTERN IDENTIFICATION (格局) — per 《子平真诠》
  // ═══════════════════════════════════════════════════════════════

  const GE_JU_ORDER = ["Direct Officer", "Seven Killings", "Direct Wealth", "Indirect Wealth",
    "Direct Resource", "Indirect Resource", "Eating God", "Hurting Officer"];

  const GE_JU_NAMES = {
    "Direct Officer": "正官格 (Direct Officer Pattern)",
    "Seven Killings": "七杀格 (Seven Killings Pattern)",
    "Direct Wealth": "正财格 (Direct Wealth Pattern)",
    "Indirect Wealth": "偏财格 (Indirect Wealth Pattern)",
    "Direct Resource": "正印格 (Direct Resource Pattern)",
    "Indirect Resource": "偏印格 (Indirect Resource Pattern)",
    "Eating God": "食神格 (Eating God Pattern)",
    "Hurting Officer": "伤官格 (Hurting Officer Pattern)",
    "Friend": "建禄格 (Jian Lu / Build Prosperity Pattern)",
    "Rob Wealth": "月刃格 (Yue Ren / Moon Blade Pattern)"
  };

  function identifyGeJu(dayStemIdx, pillars, strength) {
    const monthBranch = BRANCHES[pillars.month.branchIndex];
    const monthHidden = HIDDEN_STEMS[monthBranch];
    const dayStemEl = STEM_ELEMENTS[dayStemIdx];

    // Step 1: Check what ten gods emerge from the month branch in heavenly stems
    const heavenlyStems = {};
    ["year", "month", "day", "hour"].forEach(key => {
      if (pillars[key]) heavenlyStems[key] = STEMS[pillars[key].stemIndex];
    });

    // Step 2: For each hidden stem in the month branch, check if it appears in heavenly stems
    // The first one that appears AND is one of the 8 standard 格 determines the pattern
    let geJuGod = null;
    let geJuSource = null; // which hidden stem rank
    let geJuTransparent = false; // whether it's 透出 (appears in heavenly stems)

    for (let i = 0; i < monthHidden.length; i++) {
      const hiddenStem = monthHidden[i];
      const tenGod = getTenGod(dayStemIdx, stemIndex(hiddenStem));

      // Only the 8 standard patterns
      if (GE_JU_ORDER.includes(tenGod)) {
        // Check if this stem appears in any heavenly stem position
        let appears = false;
        for (let key in heavenlyStems) {
          if (heavenlyStems[key] === hiddenStem) { appears = true; break; }
        }

        if (appears) {
          geJuGod = tenGod;
          geJuSource = HIDDEN_STEM_RANKS[i];
          geJuTransparent = true;
          break;
        }
      }
    }

    // If no transparent pattern, take the main qi of month branch as pattern
    if (!geJuGod) {
      const mainQiTenGod = getTenGod(dayStemIdx, stemIndex(monthHidden[0]));
      if (GE_JU_ORDER.includes(mainQiTenGod)) {
        geJuGod = mainQiTenGod;
        geJuSource = "Main Qi (不透/not transparent)";
        geJuTransparent = false;
      } else if (mainQiTenGod === "Friend") {
        geJuGod = "Friend"; // 建禄格
        geJuSource = "Month branch is same as Day Master";
        geJuTransparent = false;
      } else if (mainQiTenGod === "Rob Wealth") {
        geJuGod = "Rob Wealth"; // 月刃格
        geJuSource = "Month branch is Rob Wealth to Day Master";
        geJuTransparent = false;
      } else {
        // Last resort: check middle qi
        if (monthHidden.length > 1) {
          const midQiTenGod = getTenGod(dayStemIdx, stemIndex(monthHidden[1]));
          if (GE_JU_ORDER.includes(midQiTenGod)) {
            geJuGod = midQiTenGod;
            geJuSource = "Middle Qi (不透/not transparent)";
            geJuTransparent = false;
          }
        }
      }
    }

    // Still nothing? Default to month branch main qi
    if (!geJuGod) {
      const mqTenGod = getTenGod(dayStemIdx, stemIndex(monthHidden[0]));
      geJuGod = mqTenGod;
      geJuSource = "Fallback: month branch main qi";
      geJuTransparent = false;
    }

    // Step 3: Check for special patterns (从格)
    let isSpecialPattern = false;
    let specialPatternName = null;

    if (strength.canFollow) {
      if (strength.band === "Very Strong") {
        // Check if any officer/wealth exists to oppose
        const hasOpposition = checkHasOpposition(dayStemIdx, pillars);
        if (!hasOpposition) {
          isSpecialPattern = true;
          specialPatternName = "从强格 (Following Strength / Cong Qiang)";
        }
      } else if (strength.band === "Very Weak") {
        const domination = checkDomination(dayStemIdx, pillars);
        if (domination.dominated) {
          isSpecialPattern = true;
          specialPatternName = domination.patternName;
        }
      }
    }

    // Step 4: Assess pattern purity (清浊)
    let purity = "Pure (清)";
    const patternTenGod = geJuGod;
    let conflictingCount = 0;
    const conflictingGods = [];

    ["year", "month", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) return;
      const stemGod = getTenGod(dayStemIdx, pillar.stemIndex);
      // Check if this stem's ten god conflicts with the pattern
      if (stemGod === "Hurting Officer" && patternTenGod === "Direct Officer") {
        conflictingCount++; conflictingGods.push(key + " pillar " + STEMS[pillar.stemIndex] + " as " + stemGod);
      }
      if (stemGod === "Seven Killings" && patternTenGod === "Direct Officer") {
        conflictingCount++; conflictingGods.push(key + " pillar " + STEMS[pillar.stemIndex] + " as " + stemGod);
      }
      if ((stemGod === "Rob Wealth" || stemGod === "Friend") && (patternTenGod === "Direct Wealth" || patternTenGod === "Indirect Wealth")) {
        conflictingCount++; conflictingGods.push(key + " pillar " + STEMS[pillar.stemIndex] + " as " + stemGod);
      }
      if (stemGod === "Direct Wealth" && (patternTenGod === "Direct Resource" || patternTenGod === "Indirect Resource")) {
        conflictingCount++; conflictingGods.push(key + " pillar " + STEMS[pillar.stemIndex] + " as " + stemGod);
      }
    });

    if (conflictingCount >= 2) purity = "Mixed (浊)";
    else if (conflictingCount === 1) purity = "Slightly Mixed (微浊)";

    const geJuName = GE_JU_NAMES[geJuGod] || (geJuGod + " Pattern");

    return {
      patternGod: geJuGod,
      patternName: geJuName,
      source: geJuSource,
      transparent: geJuTransparent,
      isSpecialPattern,
      specialPatternName,
      purity,
      conflictingGods,
      summary: geJuTransparent
        ? geJuName + " (transparent from month " + monthBranch + " " + geJuSource + "). Purity: " + purity + "."
        : geJuName + " (not transparent, taken from " + monthBranch + " " + geJuSource + "). Purity: " + purity + "."
    };
  }

  function checkHasOpposition(dayStemIdx, pillars) {
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    const wealthEl = elementControls(dmElement);
    const officerEl = elementControlledBy(dmElement);
    ["year", "month", "day", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) return;
      if (STEM_ELEMENTS[pillar.stemIndex] === officerEl) return true;
      if (STEM_ELEMENTS[pillar.stemIndex] === wealthEl) return true;
    });
    return false;
  }

  function checkDomination(dayStemIdx, pillars) {
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    const wealthEl = elementControls(dmElement);
    const officerEl = elementControlledBy(dmElement);
    const outputEl = elementProduces(dmElement);

    // Count element presence
    let officerCount = 0, wealthCount = 0, outputCount = 0;
    ["year", "month", "day", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) return;
      const stemEl = STEM_ELEMENTS[pillar.stemIndex];
      if (stemEl === officerEl) officerCount++;
      if (stemEl === wealthEl) wealthCount++;
      if (stemEl === outputEl) outputCount++;
      // Also check branches
      const branchEl = BRANCH_ELEMENTS[pillar.branchIndex];
      if (branchEl === officerEl) officerCount += 0.5;
      if (branchEl === wealthEl) wealthCount += 0.5;
      if (branchEl === outputEl) outputCount += 0.5;
    });

    if (officerCount >= 3) return { dominated: true, patternName: "从杀格 (Following Seven Killings / Cong Sha)" };
    if (wealthCount >= 3) return { dominated: true, patternName: "从财格 (Following Wealth / Cong Cai)" };
    if (outputCount >= 3) return { dominated: true, patternName: "从儿格 (Following Output / Cong Er)" };
    return { dominated: false, patternName: null };
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 4: YONG SHEN & XI JI (用神喜忌) — per 《子平真诠》
  // ═══════════════════════════════════════════════════════════════

  function determineYongShen(geJu, strength, dayStemIdx, pillars, tiaoHouResult) {
    const patternGod = geJu.patternGod;
    const patternName = geJu.patternName;
    const dmElement = STEM_ELEMENTS[dayStemIdx];

    // Principle from 《子平真诠》:
    // 顺用 (Shun Yong — Support the pattern):
    //   正官格 → 用财(生官) 或 印(护官); 忌伤官(克官)
    //   正财格 → 用官(护财) 或 食神(生财); 忌比劫(夺财)
    //   偏财格 → 同正财
    //   正印格 → 用官杀(生印) 或 比劫(护印); 忌财(破印)
    //   偏印格 → 用财(制偏印过旺) 或 比劫; 忌食神(倒食)
    //   食神格 → 用比劫(生食) 或 财(食生财); 忌偏印(枭神夺食)
    // 逆用 (Ni Yong — Control/transform the pattern):
    //   七杀格 → 用食神(制杀) 或 印(化杀); 忌财(生杀)
    //   伤官格 → 用印(制伤) 或 财(化伤); 忌官(伤官见官)
    //   建禄格 → 用官杀(制比肩) 或 食伤(泄秀); 忌印(生比肩)
    //   月刃格 → 用官杀(制劫财); 忌印/比劫

    let yongShen = null;
    let xiShen = [];    // Likes (helps Yong Shen)
    let jiShen = [];    // Dislikes (harms Yong Shen or pattern)
    let chouShen = [];  // Enemy god (generates Ji Shen)
    let xianShen = [];  // Idle gods (neutral)
    let principle = "";  // Which principle applied
    let yongShenMethod = ""; // Shun Yong or Ni Yong

    // Determine Shun Yong vs Ni Yong
    const shunYongPatterns = ["Direct Officer", "Direct Wealth", "Indirect Wealth", "Direct Resource", "Indirect Resource", "Eating God"];
    const niYongPatterns = ["Seven Killings", "Hurting Officer", "Friend", "Rob Wealth"];

    const isShunYong = shunYongPatterns.includes(patternGod);
    const isNiYong = niYongPatterns.includes(patternGod);

    // Build element lists
    const resourceEl = elementProducedBy(dmElement);
    const companionEl = dmElement;
    const outputEl = elementProduces(dmElement);
    const wealthEl = elementControls(dmElement);
    const officerEl = elementControlledBy(dmElement);

    // Shun Yong Patterns
    if (patternGod === "Direct Officer") {
      yongShen = { element: wealthEl, reason: "Shun Yong: Wealth (财) generates Officer (官), strengthening the pattern. Follow 《子平真诠》: 正官格以财生官为用。" };
      xiShen = [resourceEl]; // 印护官
      jiShen = ["Hurting Officer element: " + outputEl + " — 伤官克官, the primary taboo for Direct Officer pattern"];
      yongShenMethod = "Shun Yong (顺用)";
      principle = "顺用：财生官、印护官 → 格局得护则贵";
    } else if (patternGod === "Seven Killings") {
      const eatingGodEl = outputEl; // 食神制杀
      yongShen = { element: eatingGodEl, reason: "Ni Yong: Eating God (食神) controls Seven Killings (制杀). When 食神制杀得力, violence is converted to authority. Follow 《子平真诠》: 七杀格以食神制杀为用。" };
      xiShen = [companionEl]; // 比劫生食神
      jiShen = ["Wealth element: " + wealthEl + " — 财生杀, strengthens the enemy"];
      yongShenMethod = "Ni Yong (逆用)";
      principle = "逆用：食神制杀 → 杀得制则化为权";
    } else if (patternGod === "Direct Wealth" || patternGod === "Indirect Wealth") {
      yongShen = { element: officerEl, reason: "Shun Yong: Officer (官) protects Wealth (护财) from Rob Wealth. When officer protects wealth, resources are secured. Follow 《子平真诠》: 财格以官护财为用。" };
      xiShen = [outputEl]; // 食神生财
      jiShen = ["Companion/Rob Wealth: " + companionEl + " — 比劫夺财, scatters wealth"];
      yongShenMethod = "Shun Yong (顺用)";
      principle = "顺用：官护财、食生财 → 财有护有源则富";
    } else if (patternGod === "Direct Resource" || patternGod === "Indirect Resource") {
      yongShen = { element: officerEl, reason: "Shun Yong: Officer (官杀) generates Resource (生印), strengthening the pattern. Follow 《子平真诠》: 印格以官杀生印为用。" };
      xiShen = [companionEl]; // 比劫护印（泄官杀之克身）
      jiShen = ["Wealth element: " + wealthEl + " — 财破印, destroys resource support"];
      yongShenMethod = "Shun Yong (顺用)";
      principle = "顺用：官生印、比劫护印 → 印得护则学而有成";
    } else if (patternGod === "Eating God") {
      yongShen = { element: companionEl, reason: "Shun Yong: Companion (比劫) generates Eating God (生食神), strengthening expression. Follow 《子平真诠》: 食神格以比劫生食为用。" };
      xiShen = [wealthEl]; // 食神生财 → 秀气流通
      jiShen = ["Indirect Resource (偏印): " + resourceEl + " — 枭神夺食, the most feared clash"];
      yongShenMethod = "Shun Yong (顺用)";
      principle = "顺用：比劫生食、食生财 → 秀气流通则才艺得展";
    } else if (patternGod === "Hurting Officer") {
      yongShen = { element: resourceEl, reason: "Ni Yong: Resource (印) controls Hurting Officer (印制伤官). Hurting Officer without control damages reputation. Follow 《子平真诠》: 伤官格以印制伤为用。" };
      xiShen = [wealthEl]; // 财化伤官（伤官生财）
      jiShen = ["Direct Officer: " + officerEl + " — 伤官见官, classic taboo: '伤官见官，为祸百端'"];
      yongShenMethod = "Ni Yong (逆用)";
      principle = "逆用：印制伤官 → 伤官配印则贵；或伤官生财 → 秀气转财则富";
    } else if (patternGod === "Friend") {
      // 建禄格
      yongShen = { element: officerEl, reason: "Ni Yong: Officer (官杀) controls excess Companion (制比肩). Jian Lu pattern without officer lacks discipline. Follow 《子平真诠》: 建禄格以官杀为用。" };
      xiShen = [outputEl]; // 食伤泄秀
      jiShen = ["Resource: " + resourceEl + " — 印生比肩, strengthens the root that already dominates"];
      yongShenMethod = "Ni Yong (逆用)";
      principle = "逆用：官杀制比肩 → 禄得制则成器";
    } else if (patternGod === "Rob Wealth") {
      // 月刃格
      yongShen = { element: officerEl, reason: "Ni Yong: Officer (官杀) controls Rob Wealth (制劫财). Yue Ren pattern is fierce; officer must control it. Follow 《子平真诠》: 月刃格以官杀制劫为用。" };
      xiShen = [outputEl]; // 食伤泄秀
      jiShen = ["Resource/Companion: " + resourceEl + "/" + companionEl + " — 印比生劫, fuels the fire"];
      yongShenMethod = "Ni Yong (逆用)";
      principle = "逆用：官杀制劫 → 刃得制则不为害";
    } else {
      // Fallback for any unhandled pattern
      yongShen = { element: strength.band.includes("Strong") ? wealthEl : resourceEl, reason: "Fallback determination based on strength: " + (strength.band.includes("Strong") ? "reduce excess with wealth/officer" : "support weakness with resource/companion") };
      xiShen = [];
      yongShenMethod = "Strength-based fallback";
      principle = "Strength-based fallback (no classical pattern matched)";
    }

    // Special patterns override
    if (geJu.isSpecialPattern && geJu.specialPatternName) {
      if (geJu.specialPatternName.includes("从强")) {
        yongShen = { element: companionEl, reason: "Special pattern (从强格): Follow the strength — use Companion and Resource to reinforce the dominant force." };
        xiShen = [resourceEl];
        jiShen = ["Officer/Wealth: " + officerEl + "/" + wealthEl + " — opposing elements break the Following pattern"];
        yongShenMethod = "Special: Follow Strength (从强)";
      } else if (geJu.specialPatternName.includes("从杀")) {
        yongShen = { element: officerEl, reason: "Special pattern (从杀格): Follow the Seven Killings — use Officer and Wealth that dominate the chart." };
        xiShen = [wealthEl];
        jiShen = ["Resource/Companion: " + resourceEl + "/" + companionEl + " — supporting elements break the Following pattern"];
        yongShenMethod = "Special: Follow Killings (从杀)";
      } else if (geJu.specialPatternName.includes("从财")) {
        yongShen = { element: wealthEl, reason: "Special pattern (从财格): Follow the Wealth — use Wealth and Output that dominate." };
        xiShen = [outputEl];
        jiShen = ["Resource/Companion: " + resourceEl + "/" + companionEl + " — supporting elements break the Following pattern"];
        yongShenMethod = "Special: Follow Wealth (从财)";
      } else if (geJu.specialPatternName.includes("从儿")) {
        yongShen = { element: outputEl, reason: "Special pattern (从儿格): Follow the Output — use Output and Wealth." };
        xiShen = [wealthEl];
        jiShen = ["Resource: " + resourceEl + " — Resource controls Output, breaking the Following pattern"];
        yongShenMethod = "Special: Follow Output (从儿)";
      }
    }

    // Apply Tiao Hou (调候) correction from 《穷通宝鉴》
    if (tiaoHouResult && tiaoHouResult.primary) {
      const thPrimary = tiaoHouResult.primary;
      // If Tiao Hou element differs from Yong Shen, add it as a co-Yong Shen or elevate it
      if (thPrimary !== yongShen.element) {
        // Check if Tiao Hou is critical (winter Fire / summer Water for weak charts)
        const isCritical = (strength.band.includes("Weak") && thPrimary === "Fire" && BRANCH_SEASON[BRANCHES[pillars.month.branchIndex]] === "Winter")
          || (strength.band.includes("Weak") && thPrimary === "Water" && BRANCH_SEASON[BRANCHES[pillars.month.branchIndex]] === "Summer");

        if (isCritical) {
          // Tiao Hou overrides as primary Yong Shen
          yongShen = {
            element: thPrimary,
            reason: "Tiao Hou (调候) overrides: " + thPrimary + " is critically needed for climate survival per 《穷通宝鉴》. " + (tiaoHouResult.note || ""),
            originalYongShen: yongShen.element + " (" + yongShen.reason + ")"
          };
          yongShenMethod += " + Tiao Hou Override";
        } else {
          // Add Tiao Hou as a prominent Xi Shen
          if (!xiShen.includes(thPrimary)) xiShen.unshift(thPrimary);
        }
      }
    }

    // Determine idle gods (elements not in yong/xi/ji)
    const allElements = ["Wood", "Fire", "Earth", "Metal", "Water"];
    const activeElements = new Set([yongShen.element, ...xiShen.map(e => e.includes(":") ? e.split(":")[1].trim().split(" ")[0] : "").filter(Boolean)]);
    activeElements.add(yongShen.element);

    // Determine Chou Shen (generates Ji Shen)
    const jiElements = jiShen.map(j => {
      const match = j.match(/element: (\w+)/);
      return match ? match[1] : null;
    }).filter(Boolean);
    jiElements.forEach(jiEl => {
      chouShen.push(elementProducedBy(jiEl));
    });

    const yongShenEl = yongShen.element;

    // Convert to element-based Xi/Ji lists
    const xiElements = [...new Set([yongShenEl, ...xiShen.filter(x => ELEMENT_ORDER.includes(x))])];
    const jiElementsList = [...new Set(jiElements)];

    return {
      yongShen: yongShenEl,
      yongShenReason: yongShen.reason,
      originalYongShen: yongShen.originalYongShen || null,
      xiShen: xiElements.slice(0, 3),
      jiShen: jiElementsList.slice(0, 3),
      chouShen,
      method: yongShenMethod,
      principle,
      tiaoHouCorrected: tiaoHouResult ? (tiaoHouResult.primary !== yongShen.originalYongShen?.split(" ")[0]) : false,
      summary: "Yong Shen (用神): " + yongShenEl + " — " + yongShen.reason
        + " | Xi Shen (喜神): " + (xiElements.slice(0, 3).join(", ") || "none")
        + " | Ji Shen (忌神): " + (jiElementsList.slice(0, 3).join(", ") || "none")
        + " | Method: " + yongShenMethod
    };
  }

  function getTiaoHou(dayStem, monthBranch) {
    if (!TIAO_HOU[monthBranch]) return null;
    const th = TIAO_HOU[monthBranch][dayStem];
    if (!th) return null;
    return {
      monthBranch,
      dayStem,
      primary: th.primary,
      secondary: th.secondary,
      note: th.note,
      summary: dayStem + " Day Master in " + monthBranch + " month: Primary Tiao Hou = " + th.primary
        + (th.secondary ? ", Secondary = " + th.secondary : "") + ". " + th.note
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 5: SHEN SHA (神煞) — Symbolic Stars
  // ═══════════════════════════════════════════════════════════════

  function findShenSha(dayStemIdx, pillars) {
    const dayStem = STEMS[dayStemIdx];
    const dayBranch = BRANCHES[pillars.day.branchIndex];
    const yearBranch = BRANCHES[ pillars.year.branchIndex];
    const monthBranch = BRANCHES[ pillars.month.branchIndex];
    const monthStem = STEMS[ pillars.month.stemIndex];
    const allBranches = {};
    ["year", "month", "day", "hour"].forEach(key => {
      if (pillars[key]) allBranches[key] = BRANCHES[pillars[key].branchIndex];
    });

    const results = [];

    // Tian Yi Gui Ren (天乙贵人) — most important noble star
    const tianYiBranches = TIAN_YI_GUI_REN[dayStem] || [];
    for (let key in allBranches) {
      if (tianYiBranches.includes(allBranches[key])) {
        results.push({
          name: "Tian Yi Gui Ren (天乙贵人)",
          category: "Noble",
          location: key + " pillar (" + allBranches[key] + ")",
          meaning: "Heavenly Noble Star — the strongest benefactor star. Brings noble assistance, crisis resolution, and status elevation. When this star is present, help arrives at critical moments.",
          favorable: true
        });
      }
    }

    // Tian De Gui Ren (天德贵人)
    const tianDeStem = TIAN_DE[monthBranch];
    for (let key in allBranches) {
      if (pillars[key] && STEMS[pillars[key].stemIndex] === tianDeStem) {
        results.push({
          name: "Tian De Gui Ren (天德贵人)",
          category: "Noble",
          location: key + " pillar stem (" + tianDeStem + ")",
          meaning: "Heavenly Virtue Star — bestowed by heaven. Reduces misfortune, turns danger into safety. More powerful than Yue De for resolving calamities.",
          favorable: true
        });
      }
    }

    // Yue De Gui Ren (月德贵人)
    const yueDeStem = YUE_DE[monthBranch];
    for (let key in allBranches) {
      if (pillars[key] && STEMS[pillars[key].stemIndex] === yueDeStem) {
        results.push({
          name: "Yue De Gui Ren (月德贵人)",
          category: "Noble",
          location: key + " pillar stem (" + yueDeStem + ")",
          meaning: "Monthly Virtue Star — brings social grace, reduces interpersonal friction, and attracts supportive people.",
          favorable: true
        });
      }
    }

    // Wen Chang (文昌贵人) — literary/academic star
    const wenChangBranch = WEN_CHANG[dayStem];
    for (let key in allBranches) {
      if (allBranches[key] === wenChangBranch) {
        results.push({
          name: "Wen Chang (文昌贵人)",
          category: "Talent",
          location: key + " pillar (" + allBranches[key] + ")",
          meaning: "Literary Star — bestows intelligence, academic talent, writing ability, and examination success. Strong indicator of scholarly achievement and intellectual pursuits.",
          favorable: true
        });
      }
    }

    // Tao Hua / Xian Chi (桃花/咸池) — romance/charisma star
    const taoHuaByDay = TAO_HUA_GROUPS[dayBranch];
    const taoHuaByYear = TAO_HUA_GROUPS[yearBranch];
    for (let key in allBranches) {
      if (allBranches[key] === taoHuaByDay) {
        results.push({
          name: "Tao Hua (桃花 / Peach Blossom)",
          category: "Romance",
          location: key + " pillar (" + allBranches[key] + ")",
          meaning: "Peach Blossom Star — bestows charm, attractiveness, and social magnetism. In favorable position: artistic talent and romantic fulfillment. In unfavorable position: romantic complications and reputation risks.",
          favorable: true // context-dependent
        });
      }
    }

    // Yi Ma (驿马) — travel/movement star
    const yiMaByDay = YI_MA_GROUPS[dayBranch];
    const yiMaByYear = YI_MA_GROUPS[yearBranch];
    for (let key in allBranches) {
      if (allBranches[key] === yiMaByDay) {
        results.push({
          name: "Yi Ma (驿马 / Traveling Horse)",
          category: "Movement",
          location: key + " pillar (" + allBranches[key] + ")",
          meaning: "Traveling Horse Star — indicates movement, relocation, travel, career mobility, and dynamic change. Active Yi Ma brings frequent moves or career changes as the path to success.",
          favorable: true
        });
      }
    }

    // Hua Gai (华盖) — solitary/spiritual star
    const huaGaiByDay = HUA_GAI_GROUPS[dayBranch];
    for (let key in allBranches) {
      if (allBranches[key] === huaGaiByDay) {
        results.push({
          name: "Hua Gai (华盖 / Canopy Star)",
          category: "Spiritual",
          location: key + " pillar (" + allBranches[key] + ")",
          meaning: "Canopy Star — bestows talent in arts, philosophy, metaphysics, and spiritual pursuits. Indicates a solitary, introspective nature. Those with Hua Gai are naturally drawn to esoteric knowledge and creative solitude. Often found in charts of artists, monks, and scholars.",
          favorable: true
        });
      }
    }

    // Yang Ren (羊刃) — blade star (cautionary)
    const yangRenBranch = YANG_REN[dayStem];
    for (let key in allBranches) {
      if (allBranches[key] === yangRenBranch) {
        results.push({
          name: "Yang Ren (羊刃 / Sheep Blade)",
          category: "Caution",
          location: key + " pillar (" + allBranches[key] + ")",
          meaning: "Sheep Blade Star — the sharp edge of strength. Can bring sudden authority, decisiveness, and courage, but also impulsiveness, injury risk, and interpersonal conflict. Must be controlled (by Officer or Output) to yield benefit rather than harm.",
          favorable: false
        });
      }
    }

    // Kui Gang (魁罡) — iron-will star
    const dayPillarStr = describePillar(pillars.day);
    if (KUI_GANG_DAYS.includes(dayPillarStr)) {
      results.push({
        name: "Kui Gang (魁罡)",
        category: "Character",
        location: "Day pillar (" + dayPillarStr + ")",
        meaning: "Kui Gang Star — four special day pillars (Wu Xu, Geng Chen, Geng Xu, Ren Chen). Bestows iron will, decisive action, and natural leadership. These people are intelligent, strong-willed, and cannot tolerate injustice. However, stubbornness and social friction may arise without flexibility.",
        favorable: true
      });
    }

    // Kong Wang (空亡) — emptiness (already computed per pillar, summarize)
    for (let key in allBranches) {
      const kw = getKongWang(pillars[key].branchIndex);
      if (kw.includes(pillars[key].branchIndex)) {
        results.push({
          name: "Kong Wang (空亡 / Emptiness)",
          category: "Structure",
          location: key + " pillar (" + allBranches[key] + ")",
          meaning: key + " pillar falls into Kong Wang (Emptiness). This pillar's influence is reduced, delayed, or manifests in unconventional ways. Things governed by this pillar may feel 'not quite there' — neither fully present nor fully absent. In spiritual pursuits, Kong Wang can grant unusual insight.",
          favorable: false
        });
      }
    }

    // Categorize results
    const byCategory = {};
    results.forEach(r => {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r);
    });

    const nobles = results.filter(r => r.category === "Noble");
    const talents = results.filter(r => r.category === "Talent" || r.category === "Spiritual");
    const cautions = results.filter(r => !r.favorable);

    return {
      all: results,
      byCategory,
      nobles,
      talents,
      cautions,
      summary: (nobles.length > 0
        ? nobles.length + " noble star(s): " + nobles.map(n => n.name.split(" ")[0]).join(", ") + ". "
        : "No major noble stars found. ")
        + (talents.length > 0
          ? talents.length + " talent star(s): " + talents.map(t => t.name.split(" ")[0]).join(", ") + ". "
          : "")
        + (cautions.length > 0
          ? cautions.length + " cautionary star(s): " + cautions.map(c => c.name.split(" ")[0]).join(", ") + ". "
          : "")
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 6: DA YUN & LIU NIAN (大运流年)
  // ═══════════════════════════════════════════════════════════════

  function getAnnualPillar(year) {
    return { stemIndex: mod(year - 4, 10), branchIndex: mod(year - 4, 12) };
  }

  function getDaYunDirection(gender, yearStemIdx) {
    const isYang = POLARITY[yearStemIdx] === "Yang";
    if (gender === "male") return isYang ? "forward" : "backward";
    if (gender === "female") return isYang ? "backward" : "forward";
    return null;
  }

  function findNearestSolarTerm(birthYear, birthMonth, birthDay, direction) {
    const birthJD = gregorianToJD(birthYear, birthMonth, birthDay);
    let bestTerm = null, bestDays = Infinity;

    const searchYears = direction === "forward" ? [birthYear, birthYear + 1] : [birthYear - 1, birthYear];
    for (let yi = 0; yi < searchYears.length; yi++) {
      const sy = searchYears[yi];
      for (let ti = 0; ti < 24; ti++) {
        const d = getSolarTermDate(sy, ti);
        const termJD = gregorianToJD(sy, d[0], d[1]);
        const diff = termJD - birthJD;
        if (direction === "forward" && diff > 0 && diff < bestDays) {
          bestDays = diff; bestTerm = { index: ti, name: SOLAR_TERM_NAMES[ti], date: d, year: sy };
        } else if (direction === "backward" && diff < 0 && Math.abs(diff) < bestDays) {
          bestDays = Math.abs(diff); bestTerm = { index: ti, name: SOLAR_TERM_NAMES[ti], date: d, year: sy };
        }
      }
    }
    return {
      termName: bestTerm ? bestTerm.name : "Unknown", termIndex: bestTerm ? bestTerm.index : 0,
      termDate: bestTerm ? bestTerm.date : [2, 4], termYear: bestTerm ? bestTerm.year : birthYear,
      daysDifference: Math.round(bestDays), direction
    };
  }

  function calculateQiYunAge(daysToBoundary) {
    return Math.ceil(Math.max(1, daysToBoundary) / 3);
  }

  function buildDaYunPillars(startStemIdx, startBranchIdx, direction, count, dayMasterStemIdx) {
    count = count || 8;
    const pillars = [];
    const step = direction === "forward" ? 1 : -1;
    for (let i = 0; i < count; i++) {
      const stemIdx = mod(startStemIdx + step * (i + 1), 10);
      const branchIdx = mod(startBranchIdx + step * (i + 1), 12);
      const stem = STEMS[stemIdx], branch = BRANCHES[branchIdx];
      const elem = STEM_ELEMENTS[stemIdx];
      const animal = ANIMALS[branchIdx];
      const stemGod = getTenGod(dayMasterStemIdx, stemIdx);
      const mainHidden = HIDDEN_STEMS[branch][0];
      const branchGod = getTenGod(dayMasterStemIdx, stemIndex(mainHidden));
      pillars.push({
        index: i, stemIndex: stemIdx, branchIndex: branchIdx,
        stem, branch, element: elem, animal,
        naYin: getNaYin(stemIdx, branchIdx),
        tenGods: { stem: stemGod, branchMainQi: branchGod }
      });
    }
    return pillars;
  }

  function buildDaYun(dayMasterStemIdx, monthPillar, gender, birthYear, birthMonth, birthDay) {
    if (!gender || (gender !== "male" && gender !== "female")) {
      return { note: "Gender required for Da Yun calculation.", pillars: [], current: null };
    }

    const yearStemIdx = getYearPillar(birthYear, birthMonth, birthDay).stemIndex;
    const direction = getDaYunDirection(gender, yearStemIdx);
    if (!direction) return { note: "Could not determine Da Yun direction.", pillars: [], current: null };

    const boundary = findNearestSolarTerm(birthYear, birthMonth, birthDay, direction);
    const qiYunAge = calculateQiYunAge(boundary.daysDifference);
    const daYunPillars = buildDaYunPillars(
      monthPillar.stemIndex, monthPillar.branchIndex, direction, 8, dayMasterStemIdx
    );

    daYunPillars.forEach((p, i) => {
      p.startAge = qiYunAge + i * 10;
      p.endAge = qiYunAge + (i + 1) * 10 - 1;
      p.ageRange = p.startAge + "-" + p.endAge;
    });

    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear;
    let current = null;
    if (currentAge >= qiYunAge) {
      const yearsSinceQiYun = currentAge - qiYunAge;
      const pillarIndex = Math.min(Math.floor(yearsSinceQiYun / 10), daYunPillars.length - 1);
      const yearInPillar = yearsSinceQiYun % 10;
      current = {
        pillar: daYunPillars[pillarIndex],
        pillarIndex,
        yearInPillar,
        startAge: daYunPillars[pillarIndex].startAge,
        endAge: daYunPillars[pillarIndex].endAge,
        summary: "Currently in Da Yun " + (pillarIndex + 1) + ": " + daYunPillars[pillarIndex].stem + " " + daYunPillars[pillarIndex].branch
          + " (" + daYunPillars[pillarIndex].element + " " + daYunPillars[pillarIndex].animal + "), year " + (yearInPillar + 1) + " of 10."
      };
    }

    return {
      direction, qiYunAge,
      boundaryTerm: boundary.termName, boundaryDate: boundary.termDate,
      daysToBoundary: boundary.daysDifference,
      pillars: daYunPillars, current,
      summary: "Da Yun goes " + direction + ". " + boundary.daysDifference + " days from birth to " + boundary.termName
        + ", Qi Yun starts at age " + qiYunAge + ". " + (current ? current.summary : "Da Yun not yet started.")
    };
  }

  function analyzeDaYunImpact(daYunPillar, dayStemIdx, yongShenEl, jiShenEls) {
    const stemGod = daYunPillar.tenGods.stem;
    const branchGod = daYunPillar.tenGods.branchMainQi;
    const dyElement = daYunPillar.element;

    let quality = "Neutral";
    let score = 0;

    // Favorable if Da Yun element is Yong Shen
    if (dyElement === yongShenEl) { quality = "Very Favorable"; score = 3; }
    // Favorable if stem/branch god is a favorable type
    else if (stemGod === "Direct Officer" || stemGod === "Direct Resource" || stemGod === "Eating God") {
      if (!jiShenEls.includes(dyElement)) { quality = "Favorable"; score = 1.5; }
    }
    // Unfavorable if element is Ji Shen
    if (jiShenEls.includes(dyElement)) { quality = "Challenging"; score = -2; }
    // Unfavorable if Seven Killings without control
    if (stemGod === "Seven Killings" && dyElement !== yongShenEl) { quality = "Challenging"; score = -1.5; }

    // Adjust by God type
    const careerRelevant = ["Direct Officer", "Seven Killings", "Direct Resource", "Indirect Resource", "Eating God"].includes(stemGod);
    const wealthRelevant = ["Direct Wealth", "Indirect Wealth", "Eating God", "Hurting Officer"].includes(stemGod);
    const relationshipRelevant = ["Direct Officer", "Direct Wealth", "Eating God", "Indirect Resource"].includes(stemGod);

    let careerOutlook, wealthOutlook, relationshipOutlook;
    if (score >= 2) {
      careerOutlook = careerRelevant ? "Strong career progress expected" : "Moderate career stability";
      wealthOutlook = wealthRelevant ? "Good wealth accumulation period" : "Steady financial management";
      relationshipOutlook = relationshipRelevant ? "Harmonious relationship period" : "Stable personal life";
    } else if (score >= 0) {
      careerOutlook = "Steady career with moderate gains";
      wealthOutlook = "Balanced finances, neither gain nor loss";
      relationshipOutlook = "Stable relationships without major events";
    } else {
      careerOutlook = careerRelevant ? "Career challenges: adapt strategy, avoid headwinds" : "Career plateau: conserve position";
      wealthOutlook = "Financial caution: conserve, avoid major investments";
      relationshipOutlook = "Relationship tension: patience and communication needed";
    }

    return {
      quality, score, careerOutlook, wealthOutlook, relationshipOutlook,
      summary: daYunPillar.stem + " " + daYunPillar.branch + " Da Yun (" + daYunPillar.ageRange + "): "
        + quality + ". " + stemGod + " governs with " + branchGod + " at the root. "
        + dyElement + " energy " + (score >= 0 ? "supports" : "challenges") + " the chart's Yong Shen (" + yongShenEl + ")."
    };
  }

  function buildLiuNian(yearPillar, dayStemIdx, pillars, yongShenEl, jiShenEls) {
    const annualStem = STEMS[yearPillar.stemIndex];
    const annualBranch = BRANCHES[yearPillar.branchIndex];
    const annualElement = STEM_ELEMENTS[yearPillar.stemIndex];
    const annualAnimal = ANIMALS[yearPillar.branchIndex];
    const stemGod = getTenGod(dayStemIdx, yearPillar.stemIndex);
    const mainHidden = HIDDEN_STEMS[annualBranch][0];
    const branchGod = getTenGod(dayStemIdx, stemIndex(mainHidden));

    // Check annual branch against natal pillar branches
    const triggers = [];
    ["year", "month", "day", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) return;
      const natalBranch = BRANCHES[pillar.branchIndex];
      const label = key[0].toUpperCase() + key.slice(1) + " Pillar";
      if (BRANCH_CLASHES[natalBranch] === annualBranch) {
        triggers.push({ pillar: label, natalBranch, annualBranch, type: "Clash",
          detail: natalBranch + " clashes with annual " + annualBranch + " — upheaval, breakthrough, or forced change at the " + key + " pillar." });
      }
      if (BRANCH_SIX_COMBINATIONS[natalBranch] === annualBranch) {
        triggers.push({ pillar: label, natalBranch, annualBranch, type: "Combination",
          detail: natalBranch + " combines with annual " + annualBranch + " — cooperation, binding, or new alliance at the " + key + " pillar." });
      }
      if (BRANCH_HARMS[natalBranch] === annualBranch) {
        triggers.push({ pillar: label, natalBranch, annualBranch, type: "Harm",
          detail: natalBranch + " and " + annualBranch + " form a harm — hidden tensions at the " + key + " pillar." });
      }
    });

    // Favorability score
    let favorScore = 0;
    if (annualElement === yongShenEl) favorScore = 0.8;
    else if (jiShenEls.includes(annualElement)) favorScore = -0.6;
    const clashCount = triggers.filter(t => t.type === "Clash").length;
    const combineCount = triggers.filter(t => t.type === "Combination").length;
    favorScore -= clashCount * 0.2;
    favorScore += combineCount * 0.1;

    let label;
    if (favorScore >= 0.5) label = "Favorable Year (吉)";
    else if (favorScore >= 0) label = "Neutral Year (平)";
    else if (favorScore >= -0.4) label = "Challenging Year (注意)";
    else label = "Caution Year (慎)";

    return {
      stem: annualStem, branch: annualBranch, element: annualElement, animal: annualAnimal,
      naYin: getNaYin(yearPillar.stemIndex, yearPillar.branchIndex),
      tenGods: { stem: stemGod, branchMainQi: branchGod },
      triggers, favorScore, label,
      summary: annualStem + " " + annualBranch + " (" + annualElement + " " + annualAnimal + ") — "
        + stemGod + " energy. " + label + ". " + (triggers.length ? triggers.map(t => t.detail).join("; ") : "No major pillar triggers.")
    };
  }

  function buildFutureLiuNian(dayStemIdx, pillars, yongShenEl, jiShenEls, startYear, count) {
    const years = [];
    for (let i = 0; i < count; i++) {
      const year = startYear + i;
      const yp = getAnnualPillar(year);
      const ln = buildLiuNian(yp, dayStemIdx, pillars, yongShenEl, jiShenEls);
      ln.year = year;
      years.push(ln);
    }
    return years;
  }

  function buildLiuYue(targetYear, dayStemIdx, annualStemIdx, pillars, yongShenEl) {
    const tigerStemIdx = mod((annualStemIdx % 5) * 2 + 2, 10);
    const months = [];
    for (let i = 0; i < 12; i++) {
      const jieIdx = JIE_INDICES[i];
      const jieDate = getSolarTermDate(targetYear, jieIdx);
      let nextJieIdx = JIE_INDICES[(i + 1) % 12];
      let nextJieDate;
      if (nextJieIdx === 0) nextJieDate = getSolarTermDate(targetYear + 1, 0);
      else nextJieDate = getSolarTermDate(targetYear, nextJieIdx);

      const monthStemIdx = mod(tigerStemIdx + i, 10);
      const monthBranchIdx = mod(2 + i, 12);
      const monthStem = STEMS[monthStemIdx], monthBranch = BRANCHES[monthBranchIdx];
      const monthElement = STEM_ELEMENTS[monthStemIdx];
      const stemGod = getTenGod(dayStemIdx, monthStemIdx);
      const mainHidden = HIDDEN_STEMS[monthBranch][0];
      const branchGod = getTenGod(dayStemIdx, stemIndex(mainHidden));

      // Triggers
      const triggers = [];
      ["year", "month", "day", "hour"].forEach(key => {
        const pillar = pillars[key];
        if (!pillar) return;
        const natalBranch = BRANCHES[pillar.branchIndex];
        if (BRANCH_CLASHES[natalBranch] === monthBranch) triggers.push({ pillar: key, type: "Clash" });
        if (BRANCH_SIX_COMBINATIONS[natalBranch] === monthBranch) triggers.push({ pillar: key, type: "Combination" });
      });

      // Favorable?
      let isFavorable = monthElement === yongShenEl;
      let actionGuidance = isFavorable
        ? "Favorable month — take initiative in career, finances, and important decisions."
        : triggers.some(t => t.type === "Clash")
          ? "Clash month — potential upheaval; stay grounded, avoid impulsive moves."
          : "Steady month — maintain course, avoid major changes.";

      months.push({
        month: i + 1, period: jieDate[0] + "/" + jieDate[1] + " - " + nextJieDate[0] + "/" + nextJieDate[1],
        stem: monthStem, branch: monthBranch, element: monthElement,
        tenGods: { stem: stemGod, branchMainQi: branchGod },
        isFavorable, triggers, actionGuidance,
        note: stemGod + " month, " + monthElement + " energy" + (isFavorable ? " (supports Yong Shen)" : "") + "."
      });
    }
    return months;
  }

  // ═══════════════════════════════════════════════════════════════
  // LAYER 7: SPECIALIZED READINGS (专项分析)
  // ═══════════════════════════════════════════════════════════════

  function analyzeCareer(profile, dayStemIdx) {
    const officerGods = profile.pillars;
    const pillars_ = profile.pillars;
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    const officerEl = elementControlledBy(dmElement);
    const resourceEl = elementProducedBy(dmElement);
    const yongShenEl = profile.yongShen.yongShen;

    // Check if chart has officer+resource (官印相生) — the classic career combination
    let officerFound = false, resourceFound = false;
    ["year", "month", "day", "hour"].forEach(key => {
      const p = profile.pillars[key];
      if (!p) return;
      const sEl = STEM_ELEMENTS[p.stemIndex];
      if (sEl === officerEl) officerFound = true;
      if (sEl === resourceEl) resourceFound = true;
    });

    const hasGuanYin = officerFound && resourceFound;
    const yiMaStars = profile.shenSha.all.filter(s => s.name.includes("Yi Ma"));
    const hasYiMa = yiMaStars.length > 0;

    let careerArchetype;
    if (hasGuanYin) careerArchetype = "官印相生 (Officer-Resource Mutual Generation) — Classic career official archetype. Authority plus learning brings steady rank advancement. Suited for government, institutions, and structured organizations.";
    else if (profile.geJu.patternGod === "Seven Killings") careerArchetype = "七杀格局 — Military, law enforcement, competitive fields, entrepreneurship. Success comes through pressure and decisive action.";
    else if (profile.geJu.patternGod === "Hurting Officer") careerArchetype = "伤官格局 — Creative, technical, or artistic fields. Independence and innovation are key. Authority structures may feel constraining.";
    else if (profile.geJu.patternGod.includes("Wealth")) careerArchetype = "财格 — Business, finance, trade, and resource management. Practical skills and wealth-building are natural strengths.";
    else careerArchetype = "Balanced career path — adaptable to multiple fields. Leverage the Yong Shen element (" + yongShenEl + ") for direction.";

    return {
      officerElement: officerEl,
      resourceElement: resourceEl,
      hasGuanYin,
      hasYiMa,
      careerArchetype,
      favorableIndustries: getIndustriesForElement(yongShenEl),
      summary: careerArchetype + (hasYiMa ? " Yi Ma star present — career mobility and relocation may accelerate progress." : "")
    };
  }

  function analyzeWealth(profile, dayStemIdx) {
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    const wealthEl = elementControls(dmElement);
    const outputEl = elementProduces(dmElement);
    const yongShenEl = profile.yongShen.yongShen;

    // Check wealth structure
    let directWealthCount = 0, indirectWealthCount = 0;
    let wealthProtected = false;
    let outputToWealth = false;
    const wealthBranches = [];

    ["year", "month", "day", "hour"].forEach(key => {
      const p = profile.pillars[key];
      if (!p) return;
      const stemEl = STEM_ELEMENTS[p.stemIndex];
      const stemGod = getTenGod(dayStemIdx, p.stemIndex);
      if (stemGod === "Direct Wealth") directWealthCount++;
      if (stemGod === "Indirect Wealth") indirectWealthCount++;
      if (stemEl === wealthEl && stemGod === "Direct Officer") wealthProtected = true;
      if (stemGod === "Eating God" || stemGod === "Hurting Officer") outputToWealth = true;
      // Check branches for wealth storage (辰戌丑未 are earth branches that can store wealth)
      const branch = BRANCHES[p.branchIndex];
      if (["Chen", "Xu", "Chou", "Wei"].includes(branch)) {
        const hidden = HIDDEN_STEMS[branch];
        if (hidden.some(h => STEM_ELEMENTS[stemIndex(h)] === wealthEl)) {
          wealthBranches.push({ branch, pillar: key });
        }
      }
    });

    const hasWealthStar = directWealthCount + indirectWealthCount > 0;
    const hasWealthStorage = wealthBranches.length > 0;

    let wealthArchetype;
    if (directWealthCount >= 2) wealthArchetype = "正财旺 — Stable income, salary-based, reliable accumulation. Conservative investment style suits this chart.";
    else if (indirectWealthCount >= 2) wealthArchetype = "偏财旺 — Business income, investments, windfall potential. Higher risk tolerance but requires discipline.";
    else if (outputToWealth) wealthArchetype = "食伤生财 — Talent/creativity generates wealth. Monetize skills, content, and intellectual property.";
    else if (hasWealthStorage) wealthArchetype = "财入库 — Wealth accumulates in storage (财库). Building assets and long-term holdings is natural.";
    else wealthArchetype = "财星不显 — Wealth comes through the Yong Shen (" + yongShenEl + "). Focus on career income first, investment later.";

    return {
      wealthElement: wealthEl,
      directWealthCount, indirectWealthCount,
      wealthProtected, outputToWealth, hasWealthStorage, wealthBranches,
      wealthArchetype,
      favorableWealthDirections: getIndustriesForElement(yongShenEl),
      summary: wealthArchetype
    };
  }

  function analyzeMarriage(profile, dayStemIdx) {
    const gender = profile.input.gender || "";
    const dayBranch = BRANCHES[profile.pillars.day.branchIndex];
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    const officerEl = elementControlledBy(dmElement);
    const wealthEl = elementControls(dmElement);

    // Spouse palace: Day branch
    // For women: Husband star = Officer (官杀)
    // For men: Wife star = Wealth (财)
    let spouseStar, spouseElement, spouseCondition;

    if (gender === "female") {
      spouseStar = "Officer (官杀) — husband star";
      spouseElement = officerEl;
      spouseCondition = checkSpouseCondition(dayStemIdx, profile.pillars, officerEl);
    } else {
      spouseStar = "Wealth (财) — wife star";
      spouseElement = wealthEl;
      spouseCondition = checkSpouseCondition(dayStemIdx, profile.pillars, wealthEl);
    }

    // Spouse palace clashes/combinations
    const dayBranchClash = BRANCH_CLASHES[dayBranch];
    const dayBranchCombine = BRANCH_SIX_COMBINATIONS[dayBranch];
    let palaceStability = "Stable";
    let palaceNote = "";
    ["year", "month"].forEach(key => {
      const p = profile.pillars[key];
      if (!p) return;
      const natalBranch = BRANCHES[p.branchIndex];
      if (natalBranch === dayBranchClash) {
        palaceStability = "Clashed";
        palaceNote = key + " pillar " + natalBranch + " clashes with spouse palace " + dayBranch + " — relationship turbulence possible";
      }
      if (natalBranch === dayBranchCombine) {
        palaceStability = "Combined";
        palaceNote = key + " pillar " + natalBranch + " combines with spouse palace " + dayBranch + " — strong bonding force";
      }
    });

    // Peach blossom in spouse palace?
    const taoHuaBranch = TAO_HUA_GROUPS[BRANCHES[profile.pillars.year.branchIndex]];
    // Actually use day branch for peach blossom
    const dayTaoHua = TAO_HUA_GROUPS[dayBranch];
    const hasTaoHuaInPalace = dayBranch === dayTaoHua;

    let marriageArchetype;
    if (palaceStability === "Clashed") marriageArchetype = "Spouse palace is clashed — relationship requires active maintenance. Late marriage or significant age gap may stabilize.";
    else if (palaceStability === "Combined") marriageArchetype = "Spouse palace is combined — strong bonding tendency. Partnership is a central life theme.";
    else if (hasTaoHuaInPalace) marriageArchetype = "Peach Blossom in spouse palace — romantic magnetism, but need to guard against distraction. Quality over quantity in relationships.";
    else if (spouseCondition.count === 0) marriageArchetype = "Spouse star not prominent — marriage comes through Da Yun timing. Career and self-development should precede partnership.";
    else marriageArchetype = "Balanced spouse influence — steady relationship potential. Focus on compatibility of elements and life phases.";

    return {
      gender, spouseStar, spouseElement,
      spousePalace: dayBranch,
      spouseFound: spouseCondition.count > 0,
      spouseCondition,
      palaceStability, palaceNote,
      hasTaoHuaInPalace,
      marriageArchetype,
      favorableMarriagePeriods: "When Da Yun or Liu Nian brings " + spouseElement + " element or Officer/Wealth ten gods.",
      summary: marriageArchetype
    };
  }

  function checkSpouseCondition(dayStemIdx, pillars, targetElement) {
    let count = 0;
    const locations = [];
    ["year", "month", "day", "hour"].forEach(key => {
      const p = pillars[key];
      if (!p) return;
      if (STEM_ELEMENTS[p.stemIndex] === targetElement) {
        count++;
        locations.push(key + " pillar stem (" + STEMS[p.stemIndex] + ")");
      }
    });
    return {
      count,
      locations,
      condition: count >= 2 ? "Strong" : count === 1 ? "Present" : "Absent",
      note: count > 0
        ? "Spouse star found in " + locations.join(", ") + "."
        : "Spouse star not visible in heavenly stems — check hidden stems and Da Yun timing."
    };
  }

  function analyzeHealth(profile, dayStemIdx) {
    const dmElement = STEM_ELEMENTS[dayStemIdx];
    const elementCounts = getElementCounts(profile.pillars);

    // Find weakest and strongest elements
    const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    // Organ correspondences (五行对应五脏)
    const organMap = {
      Wood: { organ: "Liver (肝)", system: "Tendons, eyes, gallbladder", risk: "Liver qi stagnation, eye strain, anger-related issues" },
      Fire: { organ: "Heart (心)", system: "Blood vessels, small intestine, tongue", risk: "Cardiovascular stress, insomnia, anxiety, inflammation" },
      Earth: { organ: "Spleen (脾)", system: "Stomach, muscles, mouth", risk: "Digestive weakness, fatigue, worry-related issues, weight fluctuation" },
      Metal: { organ: "Lung (肺)", system: "Skin, large intestine, nose", risk: "Respiratory weakness, skin conditions, grief-related stagnation" },
      Water: { organ: "Kidney (肾)", system: "Bones, bladder, ears", risk: "Lower back weakness, urinary issues, fear-related depletion, hormonal imbalance" }
    };

    const riskOrgans = [];
    // Weakest element's organ is most vulnerable
    riskOrgans.push({
      element: weakest[0],
      organ: organMap[weakest[0]].organ,
      system: organMap[weakest[0]].system,
      risk: organMap[weakest[0]].risk,
      level: "Primary vulnerability — the weakest element in the chart",
      advice: "Strengthen " + weakest[0] + " through diet, environment, and lifestyle per Five Element principles."
    });

    // Also check which element is being controlled/attacked
    const controllerOfWeakest = elementControlledBy(weakest[0]);
    if (elementCounts[controllerOfWeakest] && elementCounts[controllerOfWeakest] > elementCounts[weakest[0]]) {
      riskOrgans.push({
        element: weakest[0],
        organ: organMap[weakest[0]].organ,
        system: organMap[weakest[0]].system,
        risk: "Also suppressed by excessive " + controllerOfWeakest + " — compound vulnerability",
        level: "Secondary concern — elemental suppression",
        advice: "Reduce " + controllerOfWeakest + " influence while building " + weakest[0] + "."
      });
    }

    return {
      elementCounts,
      strongest: { element: strongest[0], count: strongest[1], organ: organMap[strongest[0]].organ },
      weakest: { element: weakest[0], count: weakest[1], organ: organMap[weakest[0]].organ },
      riskOrgans,
      overallHealth: strongest[1] - weakest[1] > 5
        ? "Elemental imbalance is significant — health management should address " + weakest[0] + " deficiency proactively."
        : "Moderate elemental balance — maintain lifestyle equilibrium, pay seasonal attention to " + weakest[0] + " system.",
      summary: "Weakest element: " + weakest[0] + " (" + weakest[1].toFixed(1) + ") → " + organMap[weakest[0]].organ
        + ". Strongest: " + strongest[0] + " (" + strongest[1].toFixed(1) + ") → " + organMap[strongest[0]].organ + "."
    };
  }

  function getElementCounts(pillars) {
    const counts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
    ["year", "month", "day", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) return;
      counts[STEM_ELEMENTS[pillar.stemIndex]] += 2;
      counts[BRANCH_ELEMENTS[pillar.branchIndex]] += 1.5;
      getHiddenStemDetails(pillar.branchIndex, pillar.stemIndex).forEach((h, i) => {
        counts[h.element] += i === 0 ? 0.8 : 0.4;
      });
    });
    return counts;
  }

  function getIndustriesForElement(element) {
    const map = {
      Wood: "Education, publishing, environmental, healthcare, botany, textiles, consulting",
      Fire: "Technology, entertainment, energy, marketing, culinary, media, aviation",
      Earth: "Real estate, construction, agriculture, insurance, mining, hospitality, ceramics",
      Metal: "Finance, law, engineering, military, jewelry, automotive, precision manufacturing",
      Water: "Shipping, logistics, communications, philosophy, psychology, fisheries, tourism"
    };
    return map[element] || "Diverse fields";
  }

  function getElementAdjustments(profile, dayStemIdx) {
    const yongShen = profile.yongShen.yongShen;
    const jiShen = profile.yongShen.jiShen || [];
    const weakestEl = profile.health.weakest.element;

    const adjustments = {
      career: { element: yongShen, directions: getDirectionsForElement(yongShen), industries: getIndustriesForElement(yongShen),
        advice: "Align career with " + yongShen + " element industries. " + getDirectionAdvice(yongShen) },
      environment: { colors: getColorsForElement(yongShen), avoidColors: jiShen.map(getColorsForElement).flat(),
        advice: "Incorporate " + yongShen + " colors in workspace and daily attire. Adjust home per the favorable direction." },
      health: { strengthenElement: weakestEl, foods: getFoodsForElement(weakestEl), exercises: getExercisesForElement(weakestEl),
        advice: "Focus on strengthening " + weakestEl + " through diet and activity. Seasonal attention per Tiao Hou guidance." },
      relationships: { favorableDirection: getDirectionForElement(yongShen),
        advice: "Social and romantic connections are more harmonious in " + yongShen + "-aligned environments." },
      timing: { favorableSeasons: getSeasonsForElement(yongShen), favorableMonths: "Months of " + yongShen + " element",
        advice: "Major decisions and new ventures are best initiated during " + yongShen + " seasonal windows." }
    };

    return adjustments;
  }

  function getColorsForElement(el) {
    const map = { Wood: ["Green", "Teal"], Fire: ["Red", "Orange", "Purple"], Earth: ["Yellow", "Brown", "Beige"],
      Metal: ["White", "Silver", "Gold"], Water: ["Black", "Dark Blue", "Navy"] };
    return map[el] || ["Neutral tones"];
  }

  function getDirectionsForElement(el) {
    const map = { Wood: "East, Southeast", Fire: "South", Earth: "Center, Northeast, Southwest",
      Metal: "West, Northwest", Water: "North" };
    return map[el] || "Center";
  }

  function getDirectionForElement(el) {
    const map = { Wood: "East", Fire: "South", Earth: "Center", Metal: "West", Water: "North" };
    return map[el] || "Center";
  }

  function getDirectionAdvice(el) {
    const map = { Wood: "Face East when working; favor Southeast-facing rooms.",
      Fire: "Face South; favor well-lit, open spaces.", Earth: "Center position; favor grounding, stable environments.",
      Metal: "Face West; favor organized, clean, structured spaces.", Water: "Face North; favor quiet, reflective environments near water." };
    return map[el] || "";
  }

  function getFoodsForElement(el) {
    const map = { Wood: "Leafy greens, sprouts, sour foods, wheat, green tea — support liver function.",
      Fire: "Bitter foods, red vegetables, whole grains, warm foods in moderation — support heart function.",
      Earth: "Sweet foods (natural), root vegetables, squash, millet — support spleen/stomach function.",
      Metal: "Pungent foods, white-colored foods, rice, pear — support lung function.",
      Water: "Salty foods (in moderation), dark beans, seaweed, bone broth — support kidney function." };
    return map[el] || "Balanced whole foods";
  }

  function getExercisesForElement(el) {
    const map = { Wood: "Stretching, yoga, tai chi, hiking — promote circulation and flexibility.",
      Fire: "Cardio, dancing, team sports — channel Fire energy constructively.",
      Earth: "Walking, gardening, grounding exercises — stabilize and center.",
      Metal: "Breathwork, swimming, structured training — strengthen lungs and discipline.",
      Water: "Meditation, qigong, restorative yoga — conserve and deepen energy." };
    return map[el] || "Moderate balanced exercise";
  }

  function getSeasonsForElement(el) {
    const map = { Wood: "Spring (Feb-Apr)", Fire: "Summer (May-Jul)", Earth: "Late summer, seasonal transitions",
      Metal: "Autumn (Aug-Oct)", Water: "Winter (Nov-Jan)" };
    return map[el] || "All seasons with balance";
  }

  function getTenGodCounts(pillars, dayStemIdx) {
    const counts = {};
    function add(stemIdx, weight) {
      const god = getTenGod(dayStemIdx, stemIdx);
      counts[god] = (counts[god] || 0) + weight;
    }
    ["year", "month", "day", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) return;
      add(pillar.stemIndex, 1);
      getHiddenStemDetails(pillar.branchIndex, dayStemIdx).forEach((h, i) => {
        add(stemIndex(h.stem), i === 0 ? 0.8 : 0.4);
      });
    });
    return counts;
  }

  function getTwelveStageByPillar(dayStem, pillars) {
    const entries = {};
    ["year", "month", "day", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) { entries[key] = null; return; }
      const stage = getTwelveStage(dayStem, BRANCHES[pillar.branchIndex]);
      entries[key] = { branch: BRANCHES[pillar.branchIndex], stage: stage.stage, stageIdx: stage.stageIdx, meaning: stage.meaning };
    });
    return entries;
  }

  function getTenGodByPillar(pillars, dayStemIdx) {
    const result = {};
    const fieldMeaning = {
      year: "Ancestral field, social background, early environment",
      month: "Career field, family pressure, adult responsibility",
      day: "Self, spouse palace, intimate pattern",
      hour: "Later life, children/legacy, private ambition"
    };
    ["year", "month", "day", "hour"].forEach(key => {
      const pillar = pillars[key];
      if (!pillar) { result[key] = { stemGod: null, branchGod: null, field: fieldMeaning[key], note: "Hour pillar not available (no birth time)" }; return; }
      const stemGod = getTenGod(dayStemIdx, pillar.stemIndex);
      const mainHidden = HIDDEN_STEMS[BRANCHES[pillar.branchIndex]][0];
      const branchGod = getTenGod(dayStemIdx, stemIndex(mainHidden));
      result[key] = {
        stem: STEMS[pillar.stemIndex], branch: BRANCHES[pillar.branchIndex],
        stemGod, branchGod, field: fieldMeaning[key],
        summary: key[0].toUpperCase() + key.slice(1) + " pillar: " + STEMS[pillar.stemIndex] + " " + BRANCHES[pillar.branchIndex]
          + " — " + stemGod + " governs, " + branchGod + " at root. Rules: " + fieldMeaning[key] + "."
      };
    });
    return result;
  }

  function buildBranchDynamics(pillars) {
    const keys = ["year", "month", "day", "hour"].filter(k => pillars[k]);
    const dynamics = [];
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const b1 = BRANCHES[pillars[keys[i]].branchIndex];
        const b2 = BRANCHES[pillars[keys[j]].branchIndex];
        const l1 = keys[i][0].toUpperCase() + keys[i].slice(1);
        const l2 = keys[j][0].toUpperCase() + keys[j].slice(1);
        if (BRANCH_CLASHES[b1] === b2) {
          dynamics.push({ type: "Clash", branches: [b1, b2], pillars: [l1, l2],
            meaning: l1 + " " + b1 + " clashes with " + l2 + " " + b2 + " — tension, movement, potential breakthrough." });
        }
        if (BRANCH_SIX_COMBINATIONS[b1] === b2) {
          dynamics.push({ type: "Six Combination", branches: [b1, b2], pillars: [l1, l2],
            meaning: l1 + " " + b1 + " combines with " + l2 + " " + b2 + " — affinity, cooperation, binding force." });
        }
        if (BRANCH_HARMS[b1] === b2) {
          dynamics.push({ type: "Harm", branches: [b1, b2], pillars: [l1, l2],
            meaning: l1 + " " + b1 + " harms " + l2 + " " + b2 + " — hidden friction, subtle undermining." });
        }
        if (BRANCH_PENALTIES[b1] && BRANCH_PENALTIES[b1].includes(b2)) {
          dynamics.push({ type: "Penalty", branches: [b1, b2], pillars: [l1, l2],
            meaning: l1 + " " + b1 + " and " + l2 + " " + b2 + " form a penalty — internal conflict, self-sabotage risk." });
        }
      }
    }
    if (dynamics.length === 0) {
      dynamics.push({ type: "Stable", branches: [], pillars: [], meaning: "No major branch clashes, combinations, harms, or penalties — stable foundation." });
    }
    return dynamics;
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN: calculateProfile()
  // ═══════════════════════════════════════════════════════════════

  function normalizeInput(input) {
    const next = input || {};
    const birthDate = parseBirthDate(next.birthDate);
    if (!birthDate) throw new Error("Please enter a valid birth date (YYYY-MM-DD).");
    const birthTime = typeof next.birthTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(next.birthTime)
      ? next.birthTime : "";
    const birthLocation = typeof next.birthLocation === "string" ? next.birthLocation.trim() : "";
    const gender = typeof next.gender === "string" ? next.gender.toLowerCase() : "";
    const lifeFocus = (next.lifeFocus && ["career", "wealth", "love", "protection", "balance"].includes(next.lifeFocus))
      ? next.lifeFocus : "balance";
    return { ...next, birthDate: next.birthDate, birthTime, lifeFocus, gender, birthLocation, parsedBirthDate: birthDate };
  }

  function calculateProfile(input) {
    const norm = normalizeInput(input);
    const { year, month, day } = norm.parsedBirthDate;

    // ── Layer 1: Pillar Calculation ────────────────────────────
    const yearPillar = getYearPillar(year, month, day);
    const monthPillar = getMonthPillar(yearPillar.stemIndex, month, day, year);
    const dayPillar = getDayPillar(year, month, day);

    // True Solar Time
    const solar = computeSolarAdjustment(norm.birthTime, norm.birthLocation);
    let effectiveBirthTime = norm.birthTime;
    let hourPillar = null;
    if (norm.birthTime) {
      hourPillar = getHourPillar(dayPillar.stemIndex, norm.birthTime);
      if (solar.used && solar.shiChenCrossing) {
        effectiveBirthTime = solar.solarTime;
        hourPillar = getHourPillar(dayPillar.stemIndex, solar.solarTime);
      }
    }

    const pillars = { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };
    const dayStemIdx = dayPillar.stemIndex;
    const dayStem = STEMS[dayStemIdx];
    const dayMasterElement = STEM_ELEMENTS[dayStemIdx];
    const monthBranch = BRANCHES[monthPillar.branchIndex];

    // Na Yin & Kong Wang
    const naYinByPillar = {};
    const kongWangByPillar = {};
    ["year", "month", "day", "hour"].forEach(key => {
      if (pillars[key]) {
        naYinByPillar[key] = getNaYin(pillars[key].stemIndex, pillars[key].branchIndex);
        const kw = getKongWang(pillars[key].branchIndex);
        kongWangByPillar[key] = kw.map(i => BRANCHES[i]);
      }
    });

    // ── Layer 2: Strength Assessment ──────────────────────────
    const strength = assessStrength(dayStemIdx, pillars);

    // ── Layer 3: Pattern Identification ───────────────────────
    const geJu = identifyGeJu(dayStemIdx, pillars, strength);

    // ── Layer 4: Yong Shen & Xi Ji ────────────────────────────
    const tiaoHou = getTiaoHou(dayStem, monthBranch);
    const yongShen = determineYongShen(geJu, strength, dayStemIdx, pillars, tiaoHou);

    // ── Layer 5: Shen Sha ─────────────────────────────────────
    const shenSha = findShenSha(dayStemIdx, pillars);

    // ── Layer 6: Da Yun & Liu Nian ────────────────────────────
    const daYun = buildDaYun(dayStemIdx, monthPillar, norm.gender, year, month, day);
    // Analyze each Da Yun pillar's impact
    if (daYun.pillars.length > 0) {
      daYun.pillars.forEach(p => {
        p.impact = analyzeDaYunImpact(p, dayStemIdx, yongShen.yongShen, yongShen.jiShen);
      });
    }

    const currentYear = new Date().getFullYear();
    const futureLiuNian = buildFutureLiuNian(dayStemIdx, pillars, yongShen.yongShen, yongShen.jiShen, currentYear, 10);
    const currentLiuNian = futureLiuNian[0];

    // Current year Liu Yue
    const annualPillar = getAnnualPillar(currentYear);
    const liuYue = buildLiuYue(currentYear, dayStemIdx, annualPillar.stemIndex, pillars, yongShen.yongShen);

    // ── Layer 7: Specialized Readings ──────────────────────────
    const career = analyzeCareer({
      pillars, geJu, yongShen, shenSha, input: norm
    }, dayStemIdx);

    const wealth = analyzeWealth({
      pillars, geJu, yongShen, input: norm
    }, dayStemIdx);

    const marriage = analyzeMarriage({
      pillars, input: norm
    }, dayStemIdx);

    const health = analyzeHealth({
      pillars, input: norm
    }, dayStemIdx);

    // Element counts & ten god counts
    const elementCounts = getElementCounts(pillars);
    const tenGodCounts = getTenGodCounts(pillars, dayStemIdx);

    // Twelve stages
    const twelveStages = getTwelveStageByPillar(dayStem, pillars);

    // Ten gods by pillar
    const tenGodByPillar = getTenGodByPillar(pillars, dayStemIdx);

    // Branch dynamics
    const branchDynamics = buildBranchDynamics(pillars);

    // Life adjustments
    const adjustments = getElementAdjustments({
      yongShen, health, input: norm
    }, dayStemIdx);

    // Hidden stems
    const hiddenStems = {};
    ["year", "month", "day", "hour"].forEach(key => {
      if (pillars[key]) hiddenStems[key] = getHiddenStemDetails(pillars[key].branchIndex, dayStemIdx);
    });

    // Seasonal command
    const season = BRANCH_SEASON[monthBranch];

    // Key turning points — identify the most impactful years in next 10
    const turningPoints = futureLiuNian
      .filter(ln => ln.favorScore >= 0.5 || ln.favorScore <= -0.4 || ln.triggers.some(t => t.type === "Clash"))
      .slice(0, 5)
      .map(ln => ({
        year: ln.year,
        label: ln.label,
        element: ln.element,
        tenGod: ln.tenGods.stem,
        reason: ln.favorScore >= 0.5
          ? "Yong Shen year — favorable for major decisions"
          : ln.favorScore <= -0.4
            ? "Caution year — conserve and prepare"
            : "Clash year — potential breakthrough through upheaval"
      }));

    // ═══════════════════════════════════════════════
    // BUILD FINAL PROFILE
    // ═══════════════════════════════════════════════
    const profile = {
      // Meta
      input: norm,
      computedAt: new Date().toISOString(),

      // Layer 1: Chart Layout
      pillars: {
        year: { stem: STEMS[yearPillar.stemIndex], branch: BRANCHES[yearPillar.branchIndex], stemIndex: yearPillar.stemIndex, branchIndex: yearPillar.branchIndex,
          element: STEM_ELEMENTS[yearPillar.stemIndex], animal: ANIMALS[yearPillar.branchIndex],
          naYin: naYinByPillar.year, kongWang: kongWangByPillar.year,
          hiddenStems: hiddenStems.year },
        month: { stem: STEMS[monthPillar.stemIndex], branch: BRANCHES[monthPillar.branchIndex], stemIndex: monthPillar.stemIndex, branchIndex: monthPillar.branchIndex,
          element: STEM_ELEMENTS[monthPillar.stemIndex], animal: ANIMALS[monthPillar.branchIndex],
          naYin: naYinByPillar.month, kongWang: kongWangByPillar.month,
          hiddenStems: hiddenStems.month },
        day: { stem: STEMS[dayPillar.stemIndex], branch: BRANCHES[dayPillar.branchIndex], stemIndex: dayPillar.stemIndex, branchIndex: dayPillar.branchIndex,
          element: STEM_ELEMENTS[dayPillar.stemIndex], animal: ANIMALS[dayPillar.branchIndex],
          naYin: naYinByPillar.day, kongWang: kongWangByPillar.day,
          hiddenStems: hiddenStems.day },
        hour: hourPillar
          ? { stem: STEMS[hourPillar.stemIndex], branch: BRANCHES[hourPillar.branchIndex], stemIndex: hourPillar.stemIndex, branchIndex: hourPillar.branchIndex,
            element: STEM_ELEMENTS[hourPillar.stemIndex], animal: ANIMALS[hourPillar.branchIndex],
            naYin: naYinByPillar.hour, kongWang: kongWangByPillar.hour,
            hiddenStems: hiddenStems.hour }
          : null
      },

      // Day Master
      dayMaster: dayStem,
      dayMasterStem: dayStem,
      dayMasterElement,
      dayMasterProfile: {
        Jia: "upright, growth-oriented, strongest when moving with conviction",
        Yi: "subtle, adaptive, strongest when choosing timing carefully",
        Bing: "open, radiant, naturally drawn toward visible expression",
        Ding: "refined, inwardly intense, strongest when meaning is personal",
        Wu: "steady, central, often called to hold things together for others",
        Ji: "careful, supportive, strongest when life feels ordered and useful",
        Geng: "direct, disciplined, naturally built for cutting through confusion",
        Xin: "precise, elegant, strongest when standards and discernment matter",
        Ren: "strategic, fluid, strongest when thought can move freely",
        Gui: "sensitive, intelligent, strongest when nuance is not ignored"
      }[dayStem],

      // Solar Adjustment
      solarAdjustment: solar,

      // Layer 2: Strength
      strength,

      // Layer 3: Pattern
      geJu,

      // Layer 4: Yong Shen & Xi Ji
      yongShen,
      tiaoHou,

      // Layer 5: Shen Sha
      shenSha,

      // Layer 6: Da Yun & Liu Nian
      daYun,
      currentYear: {
        year: currentYear,
        liuNian: currentLiuNian,
        liuYue,
        turningPoints
      },
      futureLiuNian,

      // Layer 7: Specialized Readings
      career,
      wealth,
      marriage,
      health,
      adjustments,

      // Additional Data
      elementCounts,
      tenGodCounts,
      twelveStages,
      tenGodByPillar,
      branchDynamics,
      season,
      seasonText: SEASONAL_COMMAND_TEXT[season],

      // Summary
      summary: dayStem + " " + dayMasterElement + " Day Master, born in " + monthBranch + " month (" + season + "). "
        + strength.band + " strength. " + geJu.patternName + ". "
        + "Yong Shen: " + yongShen.yongShen + ". "
        + yongShen.summary
    };

    return profile;
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════
  window.BaziEngineV2 = {
    calculateProfile,
    // Utility exports for external use
    getTenGod,
    getNaYin,
    getKongWang,
    getSolarTermDate,
    getAnnualPillar,
    STEMS, BRANCHES, ANIMALS, STEM_ELEMENTS, BRANCH_ELEMENTS,
    HIDDEN_STEMS, NA_YIN, TIAO_HOU,
    BRANCH_CLASHES, BRANCH_SIX_COMBINATIONS, BRANCH_HARMS, BRANCH_PENALTIES,
    TWELVE_STAGE_NAMES, TWELVE_STAGE_MEANINGS
  };
})();
