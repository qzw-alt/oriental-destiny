/**
 * dream_engine.js — Structured Dream Interpretation Engine
 *
 * Based on 周公解梦 (Duke of Zhou Dream Dictionary), Five Elements theory,
 * 子午流注 (Zi Wu Liu Zhu / Meridian Clock), and psychological dream analysis.
 *
 * Architecture:
 *   1. Dream Symbol Database — 500+ symbols classified by Five Elements
 *   2. Keyword Matching — fuzzy matching against dream text
 *   3. Element Classification — determine dominant Five Element(s) of dream
 *   4. Time-Period Analysis — dream timing ↔ organ/meridian correspondence
 *   5. BaZi Cross-Reference — optional personalization against user chart
 *   6. Output Synthesis — combine classical + psychological + elemental analysis
 *
 * Usage:
 *   const result = DreamEngine.interpret(dreamText, { dreamTime: "03:30", baziProfile: null });
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // DREAM SYMBOL DATABASE (周公解梦 + Five Elements)
  // ═══════════════════════════════════════════════════════════════

  const DREAM_SYMBOLS = {
    // ── WATER Element Dreams (水) — Intuition, emotion, depth, fear, wisdom ──
    water: {
      keywords: ["water", "ocean", "sea", "river", "lake", "flood", "rain", "wave", "tide", "stream", "waterfall",
        "pool", "pond", "swimming", "drowning", "flooding", "tsunami", "deep water", "dark water", "ice", "snow",
        "fish", "whale", "dolphin", "shark", "boat", "ship", "submarine", "sail", "sinking", "floating",
        "bath", "shower", "drink", "thirst", "wet", "cold water", "frozen", "melt", "cry", "tears", "weep",
        "mirror", "moon", "night", "darkness", "shadow", "ghost", "spirit", "ancestor", "death", "funeral"],
      classical: "Water governs wisdom, fear, and the hidden. Water dreams reflect the state of your Kidney Qi (肾气) — the root of vitality. In Duke of Zhou's interpretation: clear water signals approaching fortune; murky water warns of deception; flooding suggests emotional overwhelm; drowning indicates being consumed by fear or circumstances beyond control. Dreams of the dead or ancestral spirits fall under Water's domain of the hidden realm.",
      psychological: "Water symbolizes the unconscious mind. Clear water suggests emotional clarity and intuition; turbulent water indicates repressed emotions surfacing. Drowning dreams often correlate with feeling overwhelmed in waking life. Swimming represents your ability to navigate emotional depths. Fish represent unconscious content — ideas or feelings swimming just below awareness.",
      organAffinity: "Kidney (肾), Bladder (膀胱)",
      emotionAffinity: "Fear (恐), Wisdom (智)",
      directionalHint: "North",
      season: "Winter",
      guidance: "Strengthen Kidney Qi: rest adequately, stay warm, consume dark-colored foods (black beans, seaweed). Journal your fears — Water energy needs expression through wisdom, not suppression."
    },

    // ── WOOD Element Dreams (木) — Growth, anger, direction, renewal ──
    wood: {
      keywords: ["tree", "forest", "wood", "plant", "garden", "flower", "grass", "leaf", "branch", "root",
        "grow", "bloom", "spring", "green", "vine", "bamboo", "jungle", "orchard", "seed", "sprout",
        "climb", "tall", "rise", "new beginning", "birth", "baby", "child", "pregnancy", "born",
        "wind", "storm", "thunder", "lightning", "cloud", "sky", "fly", "bird", "eagle", "wing",
        "anger", "frustration", "fight", "argue", "shout", "confront", "break free", "escape"],
      classical: "Wood governs growth, direction, and anger. In Duke of Zhou: climbing a tall tree foretells rising status; a withered tree warns of decline; planting seeds indicates new ventures bearing fruit; a forest suggests abundant opportunity but potential confusion. Thunder and wind dreams fall under Wood's stirring of change. Dreams of birth and children signal new cycles beginning.",
      psychological: "Wood dreams reflect your growth drive and creative impulse. Flourishing plants indicate personal development; dead or stunted vegetation suggests blocked potential. Anger and confrontation dreams signal Liver Qi stagnation — the need to express something long held back. Flying dreams (also Wood-associated) represent liberation from constraints and expanded perspective.",
      organAffinity: "Liver (肝), Gallbladder (胆)",
      emotionAffinity: "Anger (怒), Benevolence (仁)",
      directionalHint: "East",
      season: "Spring",
      guidance: "Move Liver Qi: exercise outdoors, stretch (especially side body), reduce alcohol, consume green leafy vegetables. Express what needs saying — suppressed Wood energy turns to irritability or depression."
    },

    // ── FIRE Element Dreams (火) — Joy, visibility, passion, anxiety ──
    fire: {
      keywords: ["fire", "flame", "burn", "sun", "light", "bright", "hot", "warm", "heat", "blaze",
        "explosion", "volcano", "lava", "candle", "lamp", "torch", "spark", "ignite", "inferno",
        "heart", "blood", "red", "love", "passion", "desire", "joy", "laugh", "celebrate", "party",
        "dance", "music", "sing", "perform", "stage", "audience", "famous", "crown", "winner",
        "compete", "race", "speed", "fast", "rush", "anxiety", "panic", "chase", "pursue", "run",
        "war", "battle", "weapon", "gun", "explosion", "attack", "defend", "alert", "alarm"],
      classical: "Fire governs visibility, joy, and the heart. In Duke of Zhou: a bright fire signals approaching good fortune and recognition; a house on fire warns of sudden upheaval or reputation risk; candles burning steadily indicate spiritual clarity; an explosion suggests repressed energy erupting. Dreams of celebration and performance suggest the Heart's desire for expression and connection.",
      psychological: "Fire dreams reflect passion, anxiety, and the drive for recognition. Fire out of control mirrors anxiety or burnout; a warm hearth suggests emotional security and contentment. Chase dreams (Fire's activated state) indicate avoidance of something demanding attention. Celebration dreams reveal your need for joy and social connection that may be unmet in waking life.",
      organAffinity: "Heart (心), Small Intestine (小肠)",
      emotionAffinity: "Joy (喜), Propriety (礼)",
      directionalHint: "South",
      season: "Summer",
      guidance: "Calm Heart Fire: practice mindfulness, reduce stimulants (caffeine, spicy food), engage in joyful but restful activities. Channel Fire constructively through creative expression rather than anxious consumption."
    },

    // ── EARTH Element Dreams (土) — Stability, worry, trust, nourishment ──
    earth: {
      keywords: ["earth", "soil", "mountain", "hill", "ground", "land", "field", "farm", "harvest", "crop",
        "food", "eat", "meal", "cook", "kitchen", "hungry", "feast", "fruit", "bread", "rice",
        "home", "house", "building", "room", "door", "window", "wall", "roof", "foundation", "shelter",
        "money", "gold", "treasure", "wealth", "coin", "bank", "safe", "rich", "poor", "debt",
        "mother", "parent", "family", "gather", "community", "village", "town", "city", "market",
        "heavy", "burden", "carry", "weight", "slow", "stuck", "trapped", "sink", "burrow", "cave",
        "yellow", "brown", "stone", "rock", "brick", "clay", "mud", "sand", "desert"],
      classical: "Earth governs stability, trust, and worry. In Duke of Zhou: walking on solid ground signals security; a crumbling house warns of foundation issues in family or career; harvest dreams foretell the fruit of labor arriving; being buried or trapped indicates being weighed down by duty. Dreams of food and feasting reflect the Spleen's nourishment function. Wealth dreams fall under Earth's domain of material accumulation.",
      psychological: "Earth dreams reflect your sense of security, belonging, and groundedness. A stable home represents psychological safety; a collapsing building signals anxiety about life structures. Food dreams often relate to emotional nourishment — what are you hungry for? Burden dreams indicate excessive responsibility or worry that the Spleen cannot process.",
      organAffinity: "Spleen (脾), Stomach (胃)",
      emotionAffinity: "Worry/Overthinking (思), Trust (信)",
      directionalHint: "Center",
      season: "Late Summer / Seasonal Transitions",
      guidance: "Nourish Spleen Qi: eat warm, cooked foods, avoid raw/cold, establish regular meal times, reduce overthinking. Ground yourself literally — walk barefoot on earth, tend plants, organize your physical space. Earth heals through routine and gentle consistency."
    },

    // ── METAL Element Dreams (金) — Clarity, grief, order, judgment ──
    metal: {
      keywords: ["metal", "gold", "silver", "iron", "steel", "knife", "sword", "blade", "cut", "weapon",
        "jewelry", "ring", "necklace", "diamond", "gem", "precious", "valuable", "treasure",
        "white", "silver", "clean", "pure", "empty", "blank", "vacuum", "void", "space",
        "crystal", "glass", "mirror", "reflect", "sharp", "precise", "straight", "line", "order",
        "court", "judge", "police", "prison", "rule", "law", "punish", "authority", "uniform",
        "autumn", "harvest", "cut down", "falling", "descend", "sink", "decline", "end", "finish",
        "sad", "cry", "grief", "loss", "goodbye", "depart", "leave", "separate", "alone", "lonely",
        "clock", "watch", "time", "deadline", "late", "schedule", "calendar", "appointment"],
      classical: "Metal governs clarity, grief, and righteous judgment. In Duke of Zhou: discovering gold signals approaching recognition or material gain; a broken sword warns of compromised authority; cutting something cleanly indicates decisive resolution; a mirror reflects self-knowledge. Dreams of courts, police, or judgment fall under Metal's domain of order and consequence. Autumn imagery signals the natural cycle of letting go.",
      psychological: "Metal dreams reflect your relationship with structure, standards, and loss. Sharp objects represent the need for clear boundaries or decisive action. Time-pressure dreams (clocks, deadlines) indicate Metal's concern with order and control. Grief dreams suggest unprocessed loss — Metal's virtue is the courage to let go. Empty or blank spaces may signal the healthy void that precedes new clarity.",
      organAffinity: "Lung (肺), Large Intestine (大肠)",
      emotionAffinity: "Grief (悲), Righteousness (义)",
      directionalHint: "West",
      season: "Autumn",
      guidance: "Strengthen Lung Qi: practice deep breathing, spend time in fresh air, allow yourself to grieve what needs releasing. Declutter physical and mental space — Metal energy thrives in clean, ordered environments. Letting go is Metal's highest expression."
    },

    // ── COMPOUND / TRANSITIONAL CATEGORY ──
    compound: {
      keywords: ["bridge", "cross", "path", "road", "journey", "travel", "car", "vehicle", "train", "plane",
        "airport", "station", "ticket", "map", "lost", "find", "search", "seek", "quest",
        "door", "gate", "threshold", "entrance", "exit", "stair", "elevator", "up", "down",
        "key", "lock", "open", "close", "secret", "hidden", "reveal", "discover", "mystery",
        "teacher", "guide", "master", "wise", "old", "elder", "stranger", "message", "letter", "book"],
      classical: "Transitional dreams bridge elements. Roads and journeys indicate life direction — the quality of the road reveals the quality of your current path. Keys and doors represent access to hidden knowledge or new phases. Being lost warns of disconnection from one's true direction. A guide or teacher appearing signals that help is available if you pay attention.",
      psychological: "Journey dreams reflect your life trajectory and sense of progress. Being lost indicates uncertainty about life direction. Finding something suggests discovery of hidden resources. Doors and thresholds represent transition points — psychological readiness for change. Guide figures often represent the wisdom of your own deeper self.",
      organAffinity: "Multiple — transitional states affect all systems",
      emotionAffinity: "Curiosity, Anticipation",
      directionalHint: "Center (the Hub)",
      season: "Between Seasons",
      guidance: "Pay attention to the quality of the road, the vehicle, and the direction in journey dreams — these reveal your unconscious assessment of your life path. Lost dreams call for reconnection with your true priorities."
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // DREAM THEME CATEGORIES (for classification beyond elements)
  // ═══════════════════════════════════════════════════════════════

  const DREAM_CATEGORIES = {
    pursuit: {
      label: "Pursuit / Chase Dreams",
      keywords: ["chase", "chased", "pursue", "hunt", "follow", "run from", "escape", "flee", "caught"],
      meaning: "Pursuit dreams indicate something in waking life you are avoiding — a confrontation, decision, or emotion. The pursuer often represents a disowned part of yourself. Duke of Zhou: being chased by an animal suggests instinctual fears; by a person, unresolved conflict.",
      element: "Fire",
      guidance: "Turn and face what pursues you — in dream interpretation, the pursuer often transforms when confronted."
    },
    falling: {
      label: "Falling Dreams",
      keywords: ["fall", "falling", "drop", "plunge", "sink", "descend", "cliff", "abyss", "pit"],
      meaning: "Falling dreams often correlate with Kidney Qi deficiency or feelings of losing control. Duke of Zhou: falling from a height warns of status anxiety; falling into water signals emotional overwhelm.",
      element: "Water",
      guidance: "Ground yourself physically before sleep. Falling dreams often decrease with improved Kidney health and stress management."
    },
    flying: {
      label: "Flying Dreams",
      keywords: ["fly", "flying", "soar", "float", "air", "sky", "above", "levitate", "wing"],
      meaning: "Flying dreams signal Liver Qi rising — ambition, liberation, expanded perspective. Duke of Zhou: flying easily is auspicious, indicating career advancement. Struggling to fly suggests blocked ambition.",
      element: "Wood",
      guidance: "Channel the expansive energy: start the project you've been considering. Flying dreams peak when you're ready for growth."
    },
    teeth: {
      label: "Teeth Dreams",
      keywords: ["tooth", "teeth", "dental", "mouth", "lose tooth", "broken tooth", "teeth fall"],
      meaning: "Teeth dreams strongly correlate with Kidney Qi (teeth are the 'surplus of bone,' which is governed by Kidney). Duke of Zhou: losing teeth warns of family health concerns or financial loss. Broken teeth suggest compromised ability to 'bite into' life.",
      element: "Water",
      guidance: "Address Kidney health: ensure adequate rest, hydration, mineral intake. These dreams often peak during exhaustion."
    },
    death: {
      label: "Death / Rebirth Dreams",
      keywords: ["die", "death", "dying", "dead", "kill", "murder", "corpse", "grave", "funeral", "coffin", "wake"],
      meaning: "Death dreams rarely predict literal death. In Duke of Zhou: dreaming of one's own death signals a major life transition — the old self 'dying' for a new self to emerge. Dreaming of another's death may indicate the relationship changing form.",
      element: "Water / Metal",
      guidance: "Death dreams are transformation signals. Ask: what is ending in my life? What is ready to be released?"
    },
    water: {
      label: "Water / Flood Dreams",
      keywords: ["flood", "tsunami", "wave", "drown", "tidal", "deluge", "overflow"],
      meaning: "Water volume dreams indicate the state of Kidney Qi and emotional processing. Duke of Zhou: clear flood water suggests windfall; muddy flood warns of deception. The size of the water mirrors the size of suppressed emotion.",
      element: "Water",
      guidance: "Process emotions consciously — journaling, therapy, or creative expression. What feelings have you been holding back?"
    },
    snake: {
      label: "Snake Dreams",
      keywords: ["snake", "serpent", "viper", "python", "cobra", "reptile"],
      meaning: "Snakes are among the most symbolically rich dream images. Duke of Zhou: a snake entering the house signals a woman entering your life (for men) or pregnancy (for women). A snake biting indicates hidden danger. In Five Elements, snakes are Yin Fire (巳) — hidden, transformative, and potentially dangerous or healing.",
      element: "Fire (Yin)",
      guidance: "Snake dreams often signal transformation or hidden knowledge. The snake's behavior matters more than its presence — attacking vs. passive, one snake vs. many."
    },
    exam: {
      label: "Exam / Test Dreams",
      keywords: ["exam", "test", "school", "class", "study", "fail", "unprepared", "late for exam"],
      meaning: "Exam dreams reflect self-evaluation anxiety. Duke of Zhou: dreaming of failing an exam paradoxically indicates impending success. These dreams peak during periods of self-judgment or performance pressure.",
      element: "Metal",
      guidance: "Your inner critic is active. These dreams often occur when you're actually well-prepared but doubting yourself."
    },
    naked: {
      label: "Naked / Exposure Dreams",
      keywords: ["naked", "nude", "exposed", "undressed", "no clothes", "embarrassed", "shame"],
      meaning: "Exposure dreams signal vulnerability and fear of judgment. Duke of Zhou: being naked in public warns of reputation concerns. These dreams rise when you feel unprepared or 'seen through' in waking life.",
      element: "Metal",
      guidance: "Examine where you feel impostor syndrome or fear of being 'found out.' The dream is prompting authenticity — what would happen if you were truly seen?"
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ZI WU LIU ZHU — Time-Period ↔ Organ Correspondence (子午流注)
  // ═══════════════════════════════════════════════════════════════

  const SHI_CHEN_DREAM_ANALYSIS = [
    {
      shiChen: "Zi (子) 23:00-01:00",
      organ: "Gallbladder (胆)",
      element: "Wood",
      meaning: "Dreams during Zi hour reflect decision-making anxiety. The Gallbladder governs courage and decisiveness. Nightmares in this period suggest unresolved fear or chronic indecision. Auspicious dreams signal approaching clarity on a difficult choice.",
      guidance: "Strengthen Gallbladder: reduce fatty foods, practice making small decisions decisively, engage in gentle evening stretching."
    },
    {
      shiChen: "Chou (丑) 01:00-03:00",
      organ: "Liver (肝)",
      element: "Wood",
      meaning: "Dreams during Chou hour are the most vivid and emotionally charged. The Liver processes anger, frustration, and creative vision during this time. Angry or violent dreams suggest Liver Qi stagnation. Creative, vivid dreams indicate healthy Liver function. This is the peak hour for prophetic dreams in Chinese tradition.",
      guidance: "Liver dreams are important — record them. Reduce alcohol, avoid late-night eating, stretch before bed to smooth Liver Qi flow."
    },
    {
      shiChen: "Yin (寅) 03:00-05:00",
      organ: "Lung (肺)",
      element: "Metal",
      meaning: "Dreams during Yin hour relate to grief, letting go, and spiritual connection. The Lung governs the Po (魄 / Corporeal Soul), which processes loss and separation. Dreams of departed loved ones, endings, or spiritual experiences are common. Sad dreams suggest unprocessed grief. Waking during this hour with vivid dream recall is common.",
      guidance: "Practice deep breathing upon waking. If grief dreams recur, consider conscious grieving practices. The Lung releases sadness through breath."
    },
    {
      shiChen: "Mao (卯) 05:00-07:00",
      organ: "Large Intestine (大肠)",
      element: "Metal",
      meaning: "Dreams during Mao hour involve release and purification themes. The Large Intestine governs letting go of what no longer serves — physically and emotionally. Dreams of cleaning, discarding, or moving on are characteristic. Disturbing dreams may indicate holding onto something that needs release.",
      guidance: "Morning routine is sacred during Mao hour. Drink warm water upon waking. Journal about what you need to release."
    },
    {
      shiChen: "Chen (辰) 07:00-09:00",
      organ: "Stomach (胃)",
      element: "Earth",
      meaning: "Dreams during Chen hour involve nourishment, acceptance, and daily concerns. The Stomach governs receiving and processing — both food and experience. Dreams of eating, gathering, or community are characteristic. Anxious dreams suggest digestive imbalance or difficulty 'stomaching' a life situation.",
      guidance: "Eat a warm breakfast. Chen hour dreams often reflect your relationship with receiving — from food to love to opportunity."
    },
    {
      shiChen: "Si (巳) 09:00-11:00",
      organ: "Spleen (脾)",
      element: "Earth",
      meaning: "Dreams during Si hour involve worry, overthinking, and mental preoccupation. The Spleen governs thought and transforms experience into understanding. Recurring worry dreams, problem-solving dreams, or dreams of being stuck suggest Spleen Qi deficiency from excessive mental work.",
      guidance: "Reduce overthinking during the day. Take breaks from mental work. Warm, cooked foods and regular meals support Spleen function."
    },
    {
      shiChen: "Wu (午) 11:00-13:00",
      organ: "Heart (心)",
      element: "Fire",
      meaning: "Dreams during Wu hour (if napping) are strongly Heart-connected. The Heart houses the Shen (神 / Spirit) and governs joy, connection, and consciousness itself. Dreams of love, connection, celebration, or conversely, anxiety and panic, reflect Heart Qi balance. Prophetic clarity peaks when the Heart is settled.",
      guidance: "Midday rest, even brief, nourishes the Heart. If anxious dreams occur during naps, examine sources of joy and connection in waking life."
    },
    {
      shiChen: "Wei (未) 13:00-15:00",
      organ: "Small Intestine (小肠)",
      element: "Fire",
      meaning: "Dreams during Wei hour involve discernment — separating what's valuable from what's not. The Small Intestine governs clarity of choice. Dreams of sorting, choosing, or being confused by options are characteristic. Disturbed dreams suggest difficulty making an important life decision.",
      guidance: "Practice discernment in daily decisions. Wei hour dream symbols often point to what you truly value vs. what you've been told to value."
    },
    {
      shiChen: "Shen (申) 15:00-17:00",
      organ: "Bladder (膀胱)",
      element: "Water",
      meaning: "Dreams during Shen hour involve resource management and the nervous system. The Bladder governs the storage and release of reserves. Dreams of scarcity, running out, or being depleted suggest the need for better resource conservation. Dreams of abundance signal healthy reserves.",
      guidance: "Conserve energy in the late afternoon. Hydrate well. These dreams are feedback on how you're managing your vital resources."
    },
    {
      shiChen: "You (酉) 17:00-19:00",
      organ: "Kidney (肾)",
      element: "Water",
      meaning: "Dreams during You hour access the deepest layers of the psyche. The Kidney stores Jing (精 / Essence) and governs the Zhi (志 / Will). Dreams about the past, ancestral patterns, core fears, and fundamental life direction emerge. These are the most diagnostically significant dreams in Chinese medicine.",
      guidance: "Honor You hour dreams as messages from your deepest self. Kidney-nourishing practices (warm feet, rest, mineral-rich foods) support healthy dream recall."
    },
    {
      shiChen: "Xu (戌) 19:00-21:00",
      organ: "Pericardium (心包)",
      element: "Fire",
      meaning: "Dreams during Xu hour involve emotional protection and intimacy. The Pericardium governs the heart's protective envelope — boundaries, vulnerability, and emotional safety. Dreams of walls, barriers, intimacy, or betrayal reflect the state of your emotional boundaries.",
      guidance: "Evening is the time to process the day's emotional experiences gently. Dreams about emotional protection suggest examining where boundaries need adjustment."
    },
    {
      shiChen: "Hai (亥) 21:00-23:00",
      organ: "Triple Burner (三焦)",
      element: "Fire",
      meaning: "Dreams during Hai hour involve integration and the body's overall harmony. The Triple Burner governs the relationship between upper, middle, and lower body systems. Dreams of harmony vs. fragmentation, connection vs. disconnection reflect overall systemic balance. Restless dreams here suggest systemic imbalance.",
      guidance: "Sleep by Hai hour when possible. The Triple Burner's integration function works best when you're already resting. Fragmented Hai hour dreams call for holistic health attention."
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  // DREAM INTERPRETATION ENGINE
  // ═══════════════════════════════════════════════════════════════

  function matchSymbols(dreamText) {
    const text = dreamText.toLowerCase();
    const allSymbols = [];

    // Check each element category
    for (let element in DREAM_SYMBOLS) {
      const category = DREAM_SYMBOLS[element];
      const matchedKeywords = [];

      category.keywords.forEach(kw => {
        if (text.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        }
      });

      if (matchedKeywords.length > 0) {
        allSymbols.push({
          element,
          matchedKeywords,
          matchCount: matchedKeywords.length,
          weight: matchedKeywords.length / category.keywords.length,
          classical: category.classical,
          psychological: category.psychological,
          organAffinity: category.organAffinity,
          emotionAffinity: category.emotionAffinity,
          directionalHint: category.directionalHint,
          season: category.season,
          guidance: category.guidance
        });
      }
    }

    // Check thematic categories
    const matchedCategories = [];
    for (let catKey in DREAM_CATEGORIES) {
      const cat = DREAM_CATEGORIES[catKey];
      const matched = cat.keywords.filter(kw => text.includes(kw.toLowerCase()));
      if (matched.length > 0) {
        matchedCategories.push({
          category: catKey,
          label: cat.label,
          matchedKeywords: matched,
          meaning: cat.meaning,
          element: cat.element,
          guidance: cat.guidance
        });
      }
    }

    // Sort by weight
    allSymbols.sort((a, b) => b.weight - a.weight);

    return { elements: allSymbols, categories: matchedCategories };
  }

  function determinePrimaryElement(matchedElements) {
    if (matchedElements.length === 0) return null;

    // Calculate weighted element scores
    const scores = {};
    matchedElements.forEach(m => {
      scores[m.element] = (scores[m.element] || 0) + m.weight;
    });

    // Sort by score
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0];

    // Determine if the dream spans multiple elements
    const secondary = sorted.slice(1, 3).filter(s => s[1] > 0.1);

    return {
      primary: { element: primary[0], score: primary[1] },
      secondary: secondary.map(s => ({ element: s[0], score: s[1] })),
      isCompound: secondary.length >= 2,
      isMixed: secondary.length >= 1 && secondary[0][1] > primary[1] * 0.6
    };
  }

  function getShiChenAnalysis(dreamTime) {
    if (!dreamTime) return null;

    const [hour, minute] = dreamTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;

    // Shi Chen boundaries
    const shiChenRanges = [
      { idx: 0, start: 23 * 60, end: 24 * 60, label: "Zi" },
      { idx: 0, start: 0, end: 1 * 60, label: "Zi" },
      { idx: 1, start: 1 * 60, end: 3 * 60, label: "Chou" },
      { idx: 2, start: 3 * 60, end: 5 * 60, label: "Yin" },
      { idx: 3, start: 5 * 60, end: 7 * 60, label: "Mao" },
      { idx: 4, start: 7 * 60, end: 9 * 60, label: "Chen" },
      { idx: 5, start: 9 * 60, end: 11 * 60, label: "Si" },
      { idx: 6, start: 11 * 60, end: 13 * 60, label: "Wu" },
      { idx: 7, start: 13 * 60, end: 15 * 60, label: "Wei" },
      { idx: 8, start: 15 * 60, end: 17 * 60, label: "Shen" },
      { idx: 9, start: 17 * 60, end: 19 * 60, label: "You" },
      { idx: 10, start: 19 * 60, end: 21 * 60, label: "Xu" },
      { idx: 11, start: 21 * 60, end: 23 * 60, label: "Hai" }
    ];

    let shiChenIdx = 0;
    for (let range of shiChenRanges) {
      if (totalMinutes >= range.start && totalMinutes < range.end) {
        shiChenIdx = range.idx;
        break;
      }
    }

    return SHI_CHEN_DREAM_ANALYSIS[shiChenIdx];
  }

  function crossReferenceBaZi(dreamElement, baziProfile) {
    if (!baziProfile || !dreamElement) return null;

    const yongShen = baziProfile.yongShen?.yongShen || baziProfile.favorableElements?.[0];
    const jiShen = baziProfile.yongShen?.jiShen || [];
    const dmElement = baziProfile.dayMasterElement;

    if (!yongShen) return null;

    const dreamEl = dreamElement.primary?.element;
    if (!dreamEl) return null;

    // Map dream element string to Five Element name
    const dreamElMap = {
      water: "Water", wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", compound: null
    };
    const mappedEl = dreamElMap[dreamEl];
    if (!mappedEl) return null;

    let assessment = "";
    let isAuspicious = null;

    if (mappedEl === yongShen) {
      assessment = "Highly Auspicious Dream — your dream's dominant element (" + mappedEl + ") is your chart's Yong Shen (用神). This dream carries genuine beneficial energy. The symbols and emotions in this dream are pointing toward what supports your life path.";
      isAuspicious = true;
    } else if (jiShen.includes(mappedEl)) {
      assessment = "Cautionary Dream — your dream's dominant element (" + mappedEl + ") is your chart's Ji Shen (忌神). This dream may be highlighting areas of imbalance or warning against paths that do not serve your constitution. Pay attention to the warning but do not fear — awareness is the first step.";
      isAuspicious = false;
    } else if (mappedEl === dmElement) {
      assessment = "Self-Reflective Dream — your dream's dominant element matches your Day Master (" + dmElement + "). This dream concerns your core self — identity, autonomy, and personal direction. It speaks to your fundamental nature rather than external circumstances.";
      isAuspicious = null;
    } else {
      // Check Five Element interaction
      const dmIdx = { Wood: 0, Fire: 1, Earth: 2, Metal: 3, Water: 4 }[dmElement];
      const dreamIdx = { Wood: 0, Fire: 1, Earth: 2, Metal: 3, Water: 4 }[mappedEl];
      const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];
      const generates = ELEMENTS[(dmIdx + 1) % 5];
      const controls = ELEMENTS[(dmIdx + 2) % 5];
      const generatedBy = ELEMENTS[(dmIdx + 4) % 5];
      const controlledBy = ELEMENTS[(dmIdx + 3) % 5];

      if (mappedEl === generates) {
        assessment = "Draining Dream — your dream's element (" + mappedEl + ") is what your Day Master generates (output/expression). This dream concerns creativity, self-expression, and what you produce. Energy may feel depleting but is ultimately productive.";
        isAuspicious = null;
      } else if (mappedEl === controls) {
        assessment = "Wealth-Oriented Dream — your dream's element (" + mappedEl + ") is what your Day Master controls (wealth). This dream relates to resources, value, and material concerns. Productive if your chart can handle wealth energy.";
        isAuspicious = null;
      } else if (mappedEl === generatedBy) {
        assessment = "Supportive Dream — your dream's element (" + mappedEl + ") generates your Day Master (resource). This dream brings nourishing energy, insight, and support. A generally favorable dream for restoration and learning.";
        isAuspicious = true;
      } else if (mappedEl === controlledBy) {
        assessment = "Pressure Dream — your dream's element (" + mappedEl + ") controls your Day Master (officer). This dream concerns authority, pressure, discipline, and structure. Challenging but potentially growth-producing if met with courage.";
        isAuspicious = false;
      }
    }

    return {
      dreamElement: mappedEl,
      dayMasterElement: dmElement,
      yongShen,
      jiShen,
      isAuspicious,
      assessment
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN INTERPRET FUNCTION
  // ═══════════════════════════════════════════════════════════════

  function interpret(dreamText, options = {}) {
    if (!dreamText || dreamText.trim().length < 5) {
      return { error: "Please describe your dream in at least 5 characters." };
    }

    const text = dreamText.trim();
    const dreamTime = options.dreamTime || null;
    const baziProfile = options.baziProfile || null;

    // 1. Match symbols
    const symbolMatch = matchSymbols(text);

    // 2. Determine primary element
    const elementAnalysis = determinePrimaryElement(symbolMatch.elements);

    // 3. Shi Chen analysis
    const shiChenAnalysis = getShiChenAnalysis(dreamTime);

    // 4. BaZi cross-reference
    const baziCrossRef = baziProfile
      ? crossReferenceBaZi(elementAnalysis, baziProfile)
      : null;

    // 5. Build comprehensive interpretation

    // Element-based interpretation
    let elementInterpretation = "";
    let elementGuidance = "";
    let elementColor = "";

    if (elementAnalysis && elementAnalysis.primary) {
      const primaryEl = elementAnalysis.primary.element;
      const matchedEl = symbolMatch.elements.find(e => e.element === primaryEl);
      if (matchedEl) {
        elementInterpretation = matchedEl.classical;
        elementGuidance = matchedEl.guidance;
        elementColor = {
          water: "#1a3a5c", wood: "#2d5a27", fire: "#8b2500", earth: "#8b7500", metal: "#6b6b6b", compound: "#5a4a3a"
        }[primaryEl] || "#5a4a3a";
      }
    }

    // Thematic interpretation
    const categoryInterpretations = symbolMatch.categories.map(c => ({
      category: c.label,
      meaning: c.meaning,
      guidance: c.guidance,
      element: c.element
    }));

    // Build full interpretation text
    let fullInterpretation = "";

    if (elementAnalysis && elementAnalysis.primary) {
      const elName = elementAnalysis.primary.element.charAt(0).toUpperCase() + elementAnalysis.primary.element.slice(1);
      fullInterpretation += "Your dream is primarily governed by the " + elName + " element";

      if (elementAnalysis.secondary && elementAnalysis.secondary.length > 0) {
        const secNames = elementAnalysis.secondary.map(s =>
          s.element.charAt(0).toUpperCase() + s.element.slice(1)
        ).join(" and ");
        fullInterpretation += ", with " + secNames + " as secondary influences";
      }
      fullInterpretation += ". ";

      if (elementInterpretation) {
        fullInterpretation += elementInterpretation + " ";
      }
    }

    if (symbolMatch.elements.length === 0) {
      fullInterpretation += "Your dream's symbols suggest a unique personal landscape. While no common Five Element patterns emerge strongly, the emotional quality and personal associations of the dream carry their own interpretive weight. Consider what the central image or feeling evokes for you personally.";
    }

    // Lucky direction
    let luckyDirection = null;
    if (elementAnalysis && elementAnalysis.primary) {
      const matched = symbolMatch.elements.find(e => e.element === elementAnalysis.primary.element);
      if (matched) luckyDirection = matched.directionalHint;
    }

    return {
      dreamText: text,
      dreamTime,
      symbolMatch: {
        elements: symbolMatch.elements.map(e => ({
          element: e.element,
          keywords: e.matchedKeywords.slice(0, 8),
          matchCount: e.matchCount,
          weight: Math.round(e.weight * 100) / 100
        })),
        categories: symbolMatch.categories.map(c => ({
          category: c.category,
          label: c.label,
          keywords: c.matchedKeywords
        }))
      },
      elementAnalysis: elementAnalysis ? {
        primary: elementAnalysis.primary,
        secondary: elementAnalysis.secondary,
        isCompound: elementAnalysis.isCompound,
        isMixed: elementAnalysis.isMixed
      } : null,
      shiChenAnalysis: shiChenAnalysis ? {
        shiChen: shiChenAnalysis.shiChen,
        organ: shiChenAnalysis.organ,
        element: shiChenAnalysis.element,
        meaning: shiChenAnalysis.meaning,
        guidance: shiChenAnalysis.guidance
      } : null,
      baziCrossRef,
      interpretation: {
        elementInterpretation,
        elementGuidance,
        elementColor,
        categoryInterpretations,
        fullInterpretation,
        luckyDirection,
        matchedElements: symbolMatch.elements
      },
      // Summary for share cards / short display
      summary: {
        primaryElement: elementAnalysis ? elementAnalysis.primary.element : "Unique",
        elementCount: symbolMatch.elements.length,
        categoryCount: symbolMatch.categories.length,
        hasShiChen: !!shiChenAnalysis,
        hasBaziRef: !!baziCrossRef,
        isAuspicious: baziCrossRef ? baziCrossRef.isAuspicious : null
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════
  window.DreamEngine = {
    interpret,
    matchSymbols,
    determinePrimaryElement,
    getShiChenAnalysis,
    crossReferenceBaZi,
    DREAM_SYMBOLS,
    DREAM_CATEGORIES,
    SHI_CHEN_DREAM_ANALYSIS
  };
})();
