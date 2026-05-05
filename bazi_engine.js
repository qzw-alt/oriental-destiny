(function () {
  const stems = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
  const branches = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const elements = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
  const branchElements = ["Water", "Earth", "Wood", "Wood", "Earth", "Fire", "Fire", "Earth", "Metal", "Metal", "Earth", "Water"];
  const polarity = ["Yang", "Yin", "Yang", "Yin", "Yang", "Yin", "Yang", "Yin", "Yang", "Yin"];

  const hiddenStems = {
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

  const elementOrder = ["Wood", "Fire", "Earth", "Metal", "Water"];

  const branchSeason = {
    Yin: "Spring",
    Mao: "Spring",
    Chen: "Spring",
    Si: "Summer",
    Wu: "Summer",
    Wei: "Summer",
    Shen: "Autumn",
    You: "Autumn",
    Xu: "Autumn",
    Hai: "Winter",
    Zi: "Winter",
    Chou: "Winter"
  };

  const dayMasterProfiles = {
    Jia: "upright, growth-oriented, and strongest when moving with conviction",
    Yi: "subtle, adaptive, and strongest when choosing timing carefully",
    Bing: "open, radiant, and naturally drawn toward visible expression",
    Ding: "refined, inwardly intense, and strongest when meaning is personal",
    Wu: "steady, central, and often called to hold things together for others",
    Ji: "careful, supportive, and strongest when life feels ordered and useful",
    Geng: "direct, disciplined, and naturally built for cutting through confusion",
    Xin: "precise, elegant, and strongest when standards and discernment matter",
    Ren: "strategic, fluid, and strongest when thought can move freely",
    Gui: "sensitive, intelligent, and strongest when nuance is not ignored"
  };

  const elementMeaning = {
    Wood: "growth, direction, and renewal",
    Fire: "visibility, expression, and momentum",
    Earth: "stability, trust, and containment",
    Metal: "clarity, precision, and discernment",
    Water: "intuition, flexibility, and depth"
  };

  const jewelrySupport = {
    Wood: "green or plant-coded materials, wooden textures, and symbols of growth",
    Fire: "warm reds, brighter stones, expressive symbols, and confidence-supportive tones",
    Earth: "golden or earthy materials, grounding bracelets, and calmer protective forms",
    Metal: "silver-white tones, cleaner shapes, and symbols that sharpen focus or protection",
    Water: "dark tones, obsidian-like protection, fluid symbolism, and calmer reflective forms"
  };

  const supportedFocuses = ["career", "wealth", "love", "protection", "balance"];

  const focusLabels = {
    career: "career and standing in the outer world",
    wealth: "wealth, retention, and the keeping of resources",
    love: "human bonds, affection, and emotional steadiness",
    protection: "protection, boundaries, and the settling of disturbance",
    balance: "the broader ordering of the life pattern"
  };

  const strengthWeights = {
    season: {
      sameElement: 2.5,
      resourceElement: 1.6,
      outputElement: -0.8,
      wealthElement: -1.2,
      neutral: 0.4
    },
    stem: {
      sameElement: 1.6,
      resourceElement: 1.2,
      outputElement: -0.6,
      wealthElement: -0.9,
      officerElement: -0.8
    },
    branch: {
      sameElement: 1.0,
      resourceElement: 0.8,
      outputElement: -0.4,
      wealthElement: -0.6,
      officerElement: -0.6
    },
    bands: {
      strongAt: 5.5,
      weakAt: 2.2
    }
  };

  const branchClashes = {
    Zi: "Wu",
    Chou: "Wei",
    Yin: "Shen",
    Mao: "You",
    Chen: "Xu",
    Si: "Hai",
    Wu: "Zi",
    Wei: "Chou",
    Shen: "Yin",
    You: "Mao",
    Xu: "Chen",
    Hai: "Si"
  };

  const branchCombinations = {
    Zi: "Chou",
    Chou: "Zi",
    Yin: "Hai",
    Hai: "Yin",
    Mao: "Xu",
    Xu: "Mao",
    Chen: "You",
    You: "Chen",
    Si: "Shen",
    Shen: "Si",
    Wu: "Wei",
    Wei: "Wu"
  };

  const tenGodMeanings = {
    Friend: "peer force, self-will, identity, and the need to stand on one's own feet",
    "Rob Wealth": "competition, shared resources, social pressure, and the tendency for energy or money to scatter",
    "Eating God": "talent, ease of expression, nourishment, and productive output",
    "Hurting Officer": "sharp expression, refusal to be boxed in, visibility, and friction with authority",
    "Indirect Wealth": "opportunity, movement, outside resources, and flexible income paths",
    "Direct Wealth": "stable money, responsibility, management, and practical value",
    "Seven Killings": "pressure, risk, discipline, urgency, and the need to convert stress into courage",
    "Direct Officer": "order, reputation, rules, rank, and proper responsibility",
    "Indirect Resource": "intuition, study, protection, unusual support, and inner recovery",
    "Direct Resource": "formal support, learning, patience, guidance, and steady recovery"
  };

  const hiddenStemRanks = ["Main Qi", "Middle Qi", "Residual Qi"];

  const seasonalCommandText = {
    Spring: "Wood command is active. Growth, movement, planning, and outward direction carry more force.",
    Summer: "Fire command is active. Visibility, heat, expression, and urgency carry more force.",
    Autumn: "Metal command is active. Order, judgment, standards, and cutting decisions carry more force.",
    Winter: "Water command is active. Storage, reflection, fear, wisdom, and hidden movement carry more force."
  };

  const twelveStageStart = {
    Jia: "Hai",
    Bing: "Yin",
    Wu: "Yin",
    Geng: "Si",
    Ren: "Shen",
    Yi: "Wu",
    Ding: "You",
    Ji: "You",
    Xin: "Zi",
    Gui: "Mao"
  };

  const twelveStageDirection = {
    Jia: 1,
    Bing: 1,
    Wu: 1,
    Geng: 1,
    Ren: 1,
    Yi: -1,
    Ding: -1,
    Ji: -1,
    Xin: -1,
    Gui: -1
  };

  const twelveStageNames = [
    "Chang Sheng",
    "Mu Yu",
    "Guan Dai",
    "Lin Guan",
    "Di Wang",
    "Shuai",
    "Bing",
    "Si",
    "Mu",
    "Jue",
    "Tai",
    "Yang"
  ];

  const twelveStageMeanings = {
    "Chang Sheng": "birth, renewal, fresh support, and the beginning of strength",
    "Mu Yu": "exposure, sensitivity, attraction, and unstable refinement",
    "Guan Dai": "formation, presentation, learning rank, and preparing to stand",
    "Lin Guan": "arrival, responsibility, usable strength, and direct action",
    "Di Wang": "peak force, confidence, excess, and the need for wise regulation",
    Shuai: "decline, reduced momentum, and the need to conserve",
    Bing: "illness, fatigue, vulnerability, and careful maintenance",
    Si: "ending, stillness, hidden pressure, and release",
    Mu: "storage, reserve, containment, and what is buried or protected",
    Jue: "severance, emptiness, transition, and the need for renewal",
    Tai: "conception, quiet potential, and early formation",
    Yang: "nourishment, protection, preparation, and gradual recovery"
  };

  const seasonRegulators = {
    Spring: {
      primary: "Metal",
      secondary: "Earth",
      reason: "Spring Wood can become too spreading, so Metal gives pruning and Earth gives anchoring."
    },
    Summer: {
      primary: "Water",
      secondary: "Metal",
      reason: "Summer Fire can become too hot and fast, so Water cools the chart and Metal gives clean containment."
    },
    Autumn: {
      primary: "Fire",
      secondary: "Water",
      reason: "Autumn Metal can become cold and sharp, so Fire warms and Water prevents dryness."
    },
    Winter: {
      primary: "Fire",
      secondary: "Wood",
      reason: "Winter Water can become too cold and stored, so Fire warms the chart and Wood helps life move again."
    }
  };

  const yongShenMethodLabels = {
    supportControl: "Fu Yi",
    climate: "Tiao Hou",
    bridge: "Tong Guan",
    medicine: "Bing Yao"
  };

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function stemIndex(stem) {
    return stems.indexOf(stem);
  }

  function elementProduces(element) {
    const i = elementOrder.indexOf(element);
    return elementOrder[(i + 1) % 5];
  }

  function elementProducedBy(element) {
    const i = elementOrder.indexOf(element);
    return elementOrder[(i + 4) % 5];
  }

  function elementControls(element) {
    const i = elementOrder.indexOf(element);
    return elementOrder[(i + 2) % 5];
  }

  function elementControlledBy(element) {
    const i = elementOrder.indexOf(element);
    return elementOrder[(i + 3) % 5];
  }

  function parseBirthDate(dateValue) {
    if (typeof dateValue !== "string") return null;
    const [year, month, day] = dateValue.split("-").map(Number);
    const target = new Date(Date.UTC(year, month - 1, day));
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      target.getUTCFullYear() !== year ||
      target.getUTCMonth() !== month - 1 ||
      target.getUTCDate() !== day
    ) {
      return null;
    }
    return { year, month, day };
  }

  function normalizeInput(input) {
    const next = input || {};
    const birthDate = parseBirthDate(next.birthDate);
    if (!birthDate) {
      throw new Error("Please enter a valid birth date before opening the chart.");
    }

    const lifeFocus = supportedFocuses.includes(next.lifeFocus) ? next.lifeFocus : "balance";
    const birthTime = typeof next.birthTime === "string" ? next.birthTime : "";
    const gender = typeof next.gender === "string" ? next.gender.toLowerCase() : "";
    const birthLocation = typeof next.birthLocation === "string" ? next.birthLocation.trim() : "";
    if (birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) {
      throw new Error("Please enter birth time in HH:MM format, or leave it blank if unknown.");
    }

    return {
      ...next,
      birthDate: next.birthDate,
      birthTime,
      lifeFocus,
      gender,
      birthLocation,
      parsedBirthDate: birthDate,
      warnings: supportedFocuses.includes(next.lifeFocus)
        ? []
        : ["The selected life focus was not recognized, so the reading used general balance."]
    };
  }

  function isOnOrAfter(month, day, boundaryMonth, boundaryDay) {
    return month > boundaryMonth || (month === boundaryMonth && day >= boundaryDay);
  }

  function getSolarYear(year, month, day) {
    return isOnOrAfter(month, day, 2, 4) ? year : year - 1;
  }

  function getYearPillar(year, month, day) {
    const solarYear = getSolarYear(year, month, day);
    return {
      stemIndex: mod(solarYear - 4, 10),
      branchIndex: mod(solarYear - 4, 12)
    };
  }

  function getSolarMonthIndex(month, day) {
    if (isOnOrAfter(month, day, 2, 4) && !isOnOrAfter(month, day, 3, 6)) return 0;
    if (isOnOrAfter(month, day, 3, 6) && !isOnOrAfter(month, day, 4, 5)) return 1;
    if (isOnOrAfter(month, day, 4, 5) && !isOnOrAfter(month, day, 5, 6)) return 2;
    if (isOnOrAfter(month, day, 5, 6) && !isOnOrAfter(month, day, 6, 6)) return 3;
    if (isOnOrAfter(month, day, 6, 6) && !isOnOrAfter(month, day, 7, 7)) return 4;
    if (isOnOrAfter(month, day, 7, 7) && !isOnOrAfter(month, day, 8, 8)) return 5;
    if (isOnOrAfter(month, day, 8, 8) && !isOnOrAfter(month, day, 9, 8)) return 6;
    if (isOnOrAfter(month, day, 9, 8) && !isOnOrAfter(month, day, 10, 8)) return 7;
    if (isOnOrAfter(month, day, 10, 8) && !isOnOrAfter(month, day, 11, 7)) return 8;
    if (isOnOrAfter(month, day, 11, 7) && !isOnOrAfter(month, day, 12, 7)) return 9;
    if (isOnOrAfter(month, day, 12, 7) || !isOnOrAfter(month, day, 1, 6)) return 10;
    return 11;
  }

  function getMonthPillar(yearStemIndex, month, day) {
    const solarMonthIndex = getSolarMonthIndex(month, day);
    const tigerStemIndex = mod((yearStemIndex % 5) * 2 + 2, 10);
    return {
      stemIndex: mod(tigerStemIndex + solarMonthIndex, 10),
      branchIndex: mod(2 + solarMonthIndex, 12)
    };
  }

  function getDayPillar(year, month, day) {
    const reference = Date.UTC(1984, 1, 2);
    const target = Date.UTC(year, month - 1, day);
    const diffDays = Math.round((target - reference) / 86400000);
    const cycleIndex = mod(diffDays, 60);
    return {
      stemIndex: mod(cycleIndex, 10),
      branchIndex: mod(cycleIndex, 12)
    };
  }

  function getHourBranchIndex(timeValue) {
    if (!timeValue) return null;
    const [hour] = timeValue.split(":").map(Number);
    return Math.floor(mod(hour + 1, 24) / 2);
  }

  function getHourPillar(dayStemIndex, timeValue) {
    const hourBranchIndex = getHourBranchIndex(timeValue);
    if (hourBranchIndex === null) return null;
    const startStemIndex = mod((dayStemIndex % 5) * 2, 10);
    return {
      stemIndex: mod(startStemIndex + hourBranchIndex, 10),
      branchIndex: hourBranchIndex
    };
  }

  function describePillar(pillar) {
    return `${stems[pillar.stemIndex]} ${branches[pillar.branchIndex]}`;
  }

  function pillarLabel(pillar) {
    return `${describePillar(pillar)} (${elements[pillar.stemIndex]} ${animals[pillar.branchIndex]})`;
  }

  function getHiddenStemDetails(branchIndex, dayStemIndex) {
    return hiddenStems[branches[branchIndex]].map((stem) => ({
      stem,
      element: elements[stemIndex(stem)],
      tenGod: getTenGod(dayStemIndex, stemIndex(stem))
    }));
  }

  function getTenGod(dayStemIdx, otherStemIdx) {
    const dayElement = elements[dayStemIdx];
    const otherElement = elements[otherStemIdx];
    const samePolarity = polarity[dayStemIdx] === polarity[otherStemIdx];

    if (dayElement === otherElement) {
      return samePolarity ? "Friend" : "Rob Wealth";
    }
    if (elementProduces(dayElement) === otherElement) {
      return samePolarity ? "Eating God" : "Hurting Officer";
    }
    if (elementControls(dayElement) === otherElement) {
      return samePolarity ? "Indirect Wealth" : "Direct Wealth";
    }
    if (elementControlledBy(dayElement) === otherElement) {
      return samePolarity ? "Seven Killings" : "Direct Officer";
    }
    return samePolarity ? "Indirect Resource" : "Direct Resource";
  }

  function getElementCounts(pillars) {
    const counts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
    pillars.forEach((pillar) => {
      counts[elements[pillar.stemIndex]] += 2;
      counts[branchElements[pillar.branchIndex]] += 1.5;
      getHiddenStemDetails(pillar.branchIndex, pillar.stemIndex).forEach((hidden) => {
        counts[hidden.element] += 0.5;
      });
    });
    return counts;
  }

  function getTenGodCounts(pillars, dayStemIndex) {
    const counts = {};

    function add(stemIdx, weight) {
      const god = getTenGod(dayStemIndex, stemIdx);
      counts[god] = (counts[god] || 0) + weight;
    }

    pillars.forEach((pillar) => {
      add(pillar.stemIndex, 1);
      getHiddenStemDetails(pillar.branchIndex, dayStemIndex).forEach((hidden, index) => {
        add(stemIndex(hidden.stem), index === 0 ? 0.8 : 0.4);
      });
    });

    return counts;
  }

  function getSeasonBonus(dayMasterElement, monthBranchIndex) {
    const monthElement = branchElements[monthBranchIndex];
    if (monthElement === dayMasterElement) return strengthWeights.season.sameElement;
    if (monthElement === elementProducedBy(dayMasterElement)) return strengthWeights.season.resourceElement;
    if (monthElement === elementProduces(dayMasterElement)) return strengthWeights.season.outputElement;
    if (monthElement === elementControls(dayMasterElement)) return strengthWeights.season.wealthElement;
    return strengthWeights.season.neutral;
  }

  function getDayMasterStrength(dayStemIndex, pillars) {
    const dayElement = elements[dayStemIndex];
    const resourceElement = elementProducedBy(dayElement);
    const outputElement = elementProduces(dayElement);
    const wealthElement = elementControls(dayElement);
    const officerElement = elementControlledBy(dayElement);

    let score = getSeasonBonus(dayElement, pillars.month.branchIndex);

    [pillars.year, pillars.month, pillars.day, pillars.hour].filter(Boolean).forEach((pillar) => {
      const stemElement = elements[pillar.stemIndex];
      const branchElement = branchElements[pillar.branchIndex];

      if (stemElement === dayElement) score += strengthWeights.stem.sameElement;
      if (stemElement === resourceElement) score += strengthWeights.stem.resourceElement;
      if (stemElement === outputElement) score += strengthWeights.stem.outputElement;
      if (stemElement === wealthElement) score += strengthWeights.stem.wealthElement;
      if (stemElement === officerElement) score += strengthWeights.stem.officerElement;

      if (branchElement === dayElement) score += strengthWeights.branch.sameElement;
      if (branchElement === resourceElement) score += strengthWeights.branch.resourceElement;
      if (branchElement === outputElement) score += strengthWeights.branch.outputElement;
      if (branchElement === wealthElement) score += strengthWeights.branch.wealthElement;
      if (branchElement === officerElement) score += strengthWeights.branch.officerElement;
    });

    let band = "Balanced";
    if (score >= strengthWeights.bands.strongAt) band = "Strong";
    else if (score <= strengthWeights.bands.weakAt) band = "Weak";

    return {
      score,
      band,
      method: "Configured rule weights for season, visible stems, and branch elements.",
      weights: strengthWeights
    };
  }

  function getFavorableElements(dayStemIndex, strengthBand) {
    const dm = elements[dayStemIndex];
    const resource = elementProducedBy(dm);
    const output = elementProduces(dm);
    const wealth = elementControls(dm);
    const officer = elementControlledBy(dm);

    if (strengthBand === "Strong") {
      return [wealth, officer, output];
    }
    if (strengthBand === "Weak") {
      return [resource, dm, output];
    }
    return [output, wealth, officer];
  }

  function buildFavorableElementReasoning(dayStemIndex, strengthBand, favorableElements) {
    const dm = elements[dayStemIndex];
    const firstTwo = favorableElements.slice(0, 2).join(" and ");

    if (strengthBand === "Strong") {
      return `Because the ${dm} Day Master reads strong in this simplified score, the engine favors elements that move, regulate, or spend its excess. That is why ${firstTwo} are placed first.`;
    }
    if (strengthBand === "Weak") {
      return `Because the ${dm} Day Master reads weak in this simplified score, the engine favors resource and companion support before heavier pressure. That is why ${firstTwo} are placed first.`;
    }
    return `Because the ${dm} Day Master reads balanced in this simplified score, the engine favors useful expression and practical direction rather than adding more of the same root. That is why ${firstTwo} are placed first.`;
  }

  function buildFocusStrategy(focus, profile) {
    const primary = profile.favorableElements[0];
    const secondary = profile.favorableElements[1];
    const copy = {
      career: `For career, the first practical move is to make work more visible while keeping timing and structure steady. ${primary} and ${secondary} are treated as the main support directions.`,
      wealth: `For wealth, the first practical move is to reduce leakage and hold resources with clearer routines. ${primary} and ${secondary} are treated as the main support directions.`,
      love: `For love, the first practical move is to calm the emotional field before asking for stronger connection. ${primary} and ${secondary} are treated as the main support directions.`,
      protection: `For protection, the first practical move is to strengthen boundaries without adding unnecessary agitation. ${primary} and ${secondary} are treated as the main support directions.`,
      balance: `For general balance, the first practical move is to restrain what is excessive and nourish what is thin. ${primary} and ${secondary} are treated as the main support directions.`
    };

    return {
      focus,
      label: focusLabels[focus],
      primaryElement: primary,
      secondaryElement: secondary,
      ageEmphasis: copy[focus]
    };
  }

  function buildLifePhaseReading(profile, input) {
    const currentYear = new Date().getFullYear();
    const birth = input.parsedBirthDate;
    const age = birth ? currentYear - birth.year : null;
    const timeNote = profile.pillars.hour
      ? "Because birth time was supplied, the hour pillar is included in this first layer."
      : "Because birth time was not supplied, the reading leaves the hour pillar open and avoids overclaiming that layer.";

    if (age === null) return timeNote;
    if (age < 24) {
      return `${timeNote} At this life stage, the reading is treated as early formation: identity, study, direction, and support habits matter most.`;
    }
    if (age < 42) {
      return `${timeNote} At this life stage, the reading is treated as active building: career, money flow, relationships, and repeated choices become easier to see.`;
    }
    if (age < 60) {
      return `${timeNote} At this life stage, the reading is treated as consolidation: what has been built, drained, or delayed becomes more important than raw momentum.`;
    }
    return `${timeNote} At this life stage, the reading is treated as refinement: peace, protection, health of routine, and stable support matter more than restless expansion.`;
  }

  function getDominantTenGod(tenGodCounts) {
    return Object.entries(tenGodCounts).sort((a, b) => b[1] - a[1])[0] || ["Friend", 0];
  }

  function sortCounts(counts) {
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }

  function buildPersonalityReading(profile) {
    const strongestGod = getDominantTenGod(profile.tenGodCounts)[0];
    const dominantElement = sortCounts(profile.elementCounts)[0][0];

    return `In this chart, the Day Master stands as ${profile.dayMasterStem} ${profile.dayMasterElement}. This is the root of the person, and it often shows one who is ${profile.dayMasterProfile}. ${dominantElement} qi rises strongly in the overall balance, while ${strongestGod} shows itself most clearly among the ten gods. From this, one may say that the person's nature moves most readily through ${elementMeaning[dominantElement]}, and the fate responds most visibly when that current is either nourished or obstructed.`;
  }

  function buildCareerReading(profile) {
    const strongestGod = getDominantTenGod(profile.tenGodCounts)[0];
    return `When one speaks of work and public standing, one must first look at where the chart allows force to gather. Here, ${strongestGod} is prominent, while ${profile.favorableElements[0]} and ${profile.favorableElements[1]} are more able to open the road ahead. This means advancement comes not from forcing the matter in a contrary way, but from acting in season and leaning into what the chart is prepared to carry.`;
  }

  function buildWealthReading(profile) {
    return `As for wealth, it is not merely a question of chasing gain. One must see whether the chart can receive, hold, and circulate what comes. In this case, ${profile.favorableElements[0]} and ${profile.favorableElements[1]} are of greater use, so money matters improve when life is arranged in harmony with those qualities, rather than through restless effort alone.`;
  }

  function buildLoveReading(profile) {
    return `In matters of affection and union, the chart does not simply ask for intensity. It asks whether the heart can remain open without becoming depleted. With a ${profile.strength.band.toLowerCase()} Day Master and a ${profile.dayMasterElement.toLowerCase()} root, this fate responds best where feeling is clear, steady, and not burdened by needless turbulence.`;
  }

  function buildProtectionReading(profile) {
    return `When seeking protection, it is unwise to add fierceness where the chart first requires steadiness. The support of ${profile.favorableElements[0]} and ${profile.favorableElements[1]} suggests that protective symbols should gather the spirit, settle disturbance, and guard the boundary, rather than merely excite the field with more force.`;
  }

  function buildBalanceReading(profile) {
    const dominantElement = sortCounts(profile.elementCounts)[0][0];
    const weakestElement = sortCounts(profile.elementCounts).slice(-1)[0][0];
    return `The work of balance in this chart is to restrain the excess of ${dominantElement} and gently raise what is thin in ${weakestElement}. For this reason, ${profile.favorableElements[0]} and ${profile.favorableElements[1]} are marked as the more useful medicines, rather than repeating the habit the chart already follows too easily.`;
  }

  function buildInterpretations(profile) {
    return {
      personality: buildPersonalityReading(profile),
      career: buildCareerReading(profile),
      wealth: buildWealthReading(profile),
      love: buildLoveReading(profile),
      protection: buildProtectionReading(profile),
      balance: buildBalanceReading(profile)
    };
  }

  function buildReaderCounsel(profile, input) {
    return `When this chart is read in the old method, one does not ask only what is present, but what the fate can truly carry. Here the Day Master is judged as ${profile.strength.band.toLowerCase()}, so the matter of ${focusLabels[input.lifeFocus]} should not be forced in a contrary season. The chart is more willing to open when ${profile.favorableElements[0]} and ${profile.favorableElements[1]} are brought near in conduct, environment, and symbol. What is excessive should be restrained a little; what is thin should be nourished a little. In this way, one follows the grain of the chart rather than struggling against it.`;
  }

  function buildMasterMessage(profile, input) {
    const base = `I have looked upon the four pillars and do not speak carelessly. Your Day Master is ${profile.dayMasterStem} ${profile.dayMasterElement}; therefore the movement of your life should not follow noise, but measure.`;

    const endings = {
      career: ` At present, what most deserves care is career and worldly standing. If you proceed in accord with ${profile.favorableElements[0]} and ${profile.favorableElements[1]}, the road opens with less resistance and your name may travel farther. If you move against the grain of the chart, effort may be spent yet rank and recognition arrive slowly. Keep the heart upright, keep your work orderly, and let the supporting object remain near the body. In time, what is delayed in office or profession may still find its proper gate.`,
      wealth: ` At present, what most deserves care is wealth and the keeping of what is earned. If you proceed in accord with ${profile.favorableElements[0]} and ${profile.favorableElements[1]}, gain is more easily gathered and leakage is reduced. If you move against the grain of the chart, money may come yet fail to remain. Keep desire measured, keep accounts clear, and let the supporting object remain near the body. In this way, what is scattered may collect and what is earned may be better preserved.`,
      love: ` At present, what most deserves care is affection and human bonds. If you proceed in accord with ${profile.favorableElements[0]} and ${profile.favorableElements[1]}, the heart settles and connection becomes easier to sustain. If you move against the grain of the chart, feeling may deepen yet remain troubled by strain or misunderstanding. Keep speech gentle, keep the dwelling peaceful, and let the supporting object remain near the body. In this way, what is distant may soften and what is uncertain may become more sincere.`,
      protection: ` At present, what most deserves care is protection and the guarding of one's field. If you proceed in accord with ${profile.favorableElements[0]} and ${profile.favorableElements[1]}, disturbance is more easily quieted and the boundary around the self becomes firmer. If you move against the grain of the chart, the spirit may tire and outer interference grows harder to dismiss. Keep the mind clean, keep the home orderly, and let the supporting object remain near the body. In this way, what is unsettled may calm and what presses too closely may withdraw.`,
      balance: ` At present, what most deserves care is the ordering of the whole life pattern. If you proceed in accord with ${profile.favorableElements[0]} and ${profile.favorableElements[1]}, what is excessive can be moderated and what is thin can be better nourished. If you move against the grain of the chart, life may remain busy yet not fully ordered. Keep the heart upright, keep daily habits measured, and let the supporting object remain near the body. In this way, what is scattered may gather and what is out of season may return to proper measure.`
    };

    return base + endings[input.lifeFocus];
  }

  function buildFocusReading(focus, profile) {
    const strongestGod = getDominantTenGod(profile.tenGodCounts)[0];
    const favorableText = profile.favorableElements.slice(0, 2).join(" and ");

    const copy = {
      career: `For career and worldly movement, one sees that ${strongestGod} rises clearly in the chart, while ${favorableText} offer better support for recognition and forward motion.`,
      wealth: `For wealth, one sees that ${strongestGod} has a strong voice in the chart, while ${favorableText} are more able to steady gain and prevent leakage.`,
      love: `For affection and human closeness, one sees that ${strongestGod} is active, while ${favorableText} are better able to warm, soften, and regulate the bond.`,
      protection: `For protection, one sees that ${strongestGod} is prominent, while ${favorableText} are more able to guard the boundary and settle disorder.`,
      balance: `For the overall ordering of the chart, one sees that ${strongestGod} is prominent, while ${favorableText} are the more useful supports for restoring measure.`
    };

    return copy[focus] || copy.balance;
  }

  function buildJewelryDirection(profile, focus) {
    const primary = profile.favorableElements[0];
    const secondary = profile.favorableElements[1];
    const carrier = focus === "protection" ? "pendant" : "bracelet";

    return {
      carrier,
      primaryElement: primary,
      secondaryElement: secondary,
      copy: `If one were to choose a supporting object, a ${carrier} carrying ${primary}${secondary ? ` and ${secondary}` : ""} support would be the more fitting direction. In symbolic terms, this often points toward ${jewelrySupport[primary]}.`
    };
  }

  function getPillarBranchEntries(pillars) {
    return ["year", "month", "day", "hour"]
      .filter((key) => pillars[key])
      .map((key) => ({
        key,
        branch: branches[pillars[key].branchIndex],
        label: `${key[0].toUpperCase()}${key.slice(1)} Branch`
      }));
  }

  function buildBranchDynamics(pillars) {
    const entries = getPillarBranchEntries(pillars);
    const dynamics = [];

    entries.forEach((left, leftIndex) => {
      entries.slice(leftIndex + 1).forEach((right) => {
        if (branchClashes[left.branch] === right.branch) {
          dynamics.push({
            type: "Clash",
            branches: [left.branch, right.branch],
            pillars: [left.label, right.label],
            meaning: `${left.label} ${left.branch} and ${right.label} ${right.branch} form a branch clash, so this layer is read as movement, tension, relocation, interruption, or the need to change how energy is handled.`
          });
        }
        if (branchCombinations[left.branch] === right.branch) {
          dynamics.push({
            type: "Combination",
            branches: [left.branch, right.branch],
            pillars: [left.label, right.label],
            meaning: `${left.label} ${left.branch} and ${right.label} ${right.branch} form a branch combination, so this layer is read as affinity, binding, cooperation, or a pattern that can become stronger when conditions support it.`
          });
        }
      });
    });

    if (!dynamics.length) {
      dynamics.push({
        type: "Stable",
        branches: entries.map((entry) => entry.branch),
        pillars: entries.map((entry) => entry.label),
        meaning: "No major branch clash or six-combination is found in this simplified layer, so the reading gives more weight to element balance, ten gods, and the strength of the Day Master."
      });
    }

    return dynamics;
  }

  function buildElementDiagnosis(elementCounts) {
    const ranking = sortCounts(elementCounts);
    const total = ranking.reduce((sum, [, value]) => sum + value, 0);
    const strongest = ranking[0];
    const weakest = ranking[ranking.length - 1];
    const average = total / ranking.length;
    const spread = strongest[1] - weakest[1];

    const status = {};
    ranking.forEach(([element, value]) => {
      if (value >= average + 1.2) status[element] = "High";
      else if (value <= average - 1.2) status[element] = "Low";
      else status[element] = "Moderate";
    });

    return {
      strongest: strongest[0],
      weakest: weakest[0],
      spread,
      average,
      status,
      summary: `${strongest[0]} is the most visible element and ${weakest[0]} is the thinnest. The spread is ${spread.toFixed(1)} points, so the chart is read for both excess and absence rather than a single lucky element.`
    };
  }

  function buildTenGodStructure(tenGodCounts) {
    const ranking = sortCounts(tenGodCounts);
    const dominant = ranking[0] || ["Friend", 0];
    const secondary = ranking[1] || dominant;

    return {
      dominant: dominant[0],
      secondary: secondary[0],
      summary: `${dominant[0]} leads the ten-god pattern, with ${secondary[0]} close behind. This points first toward ${tenGodMeanings[dominant[0]]}, then toward ${tenGodMeanings[secondary[0]]}.`,
      topThree: ranking.slice(0, 3).map(([god, value]) => ({
        god,
        value,
        meaning: tenGodMeanings[god]
      }))
    };
  }

  function buildAnnualTrigger(profile, currentYear) {
    const annualPillar = getYearPillar(currentYear, 2, 4);
    const annualBranch = branches[annualPillar.branchIndex];
    const annualStem = stems[annualPillar.stemIndex];
    const natalBranches = getPillarBranchEntries(profile.pillars);
    const triggered = natalBranches
      .filter((entry) => branchClashes[entry.branch] === annualBranch || branchCombinations[entry.branch] === annualBranch)
      .map((entry) => ({
        pillar: entry.label,
        natalBranch: entry.branch,
        annualBranch,
        type: branchClashes[entry.branch] === annualBranch ? "Clash" : "Combination"
      }));

    const triggerText = triggered.length
      ? triggered.map((item) => `${item.type} with ${item.pillar} ${item.natalBranch}`).join("; ")
      : "no major simplified branch clash or combination with the natal branches";

    return {
      year: currentYear,
      pillar: `${annualStem} ${annualBranch}`,
      element: elements[annualPillar.stemIndex],
      animal: animals[annualPillar.branchIndex],
      triggered,
      summary: `${currentYear} is read here as ${annualStem} ${annualBranch}. In this simplified annual layer, it shows ${triggerText}. This is a timing hint, not a full luck-cycle judgment.`
    };
  }

  function buildSeasonalCommand(profile) {
    const monthBranch = branches[profile.pillars.month.branchIndex];
    const commandElement = branchElements[profile.pillars.month.branchIndex];
    const season = profile.season;
    const dayElement = profile.dayMasterElement;
    let dayMasterCondition = "Neutral";

    if (commandElement === dayElement) {
      dayMasterCondition = "In Season";
    } else if (commandElement === elementProducedBy(dayElement)) {
      dayMasterCondition = "Supported by Season";
    } else if (commandElement === elementProduces(dayElement)) {
      dayMasterCondition = "Drained by Season";
    } else if (commandElement === elementControls(dayElement)) {
      dayMasterCondition = "Spent into Wealth Season";
    } else if (commandElement === elementControlledBy(dayElement)) {
      dayMasterCondition = "Pressed by Officer Season";
    }

    return {
      monthBranch,
      season,
      commandElement,
      dayMasterCondition,
      summary: `The month branch ${monthBranch} places the chart under ${season} command, with ${commandElement} carrying the seasonal authority. ${seasonalCommandText[season]} For this ${dayElement} Day Master, the seasonal relation is read as ${dayMasterCondition.toLowerCase()}.`
    };
  }

  function buildHiddenStemInfluence(profile) {
    const weights = [0.7, 0.2, 0.1];
    const influence = {};

    ["year", "month", "day", "hour"].forEach((key) => {
      const pillar = profile.pillars[key];
      if (!pillar) {
        influence[key] = {
          label: `${key[0].toUpperCase()}${key.slice(1)} Branch`,
          entries: [],
          summary: "Open because birth time was not supplied."
        };
        return;
      }

      const branch = branches[pillar.branchIndex];
      const entries = hiddenStems[branch].map((stem, index) => ({
        stem,
        rank: hiddenStemRanks[index] || "Residual Qi",
        weight: weights[index] || 0.1,
        element: elements[stemIndex(stem)],
        tenGod: getTenGod(profile.pillars.day.stemIndex, stemIndex(stem))
      }));

      influence[key] = {
        label: `${key[0].toUpperCase()}${key.slice(1)} Branch ${branch}`,
        entries,
        summary: `${branch} stores ${entries.map((entry) => `${entry.rank} ${entry.stem} ${entry.element} as ${entry.tenGod}`).join(", ")}. The main qi is treated as the most visible hidden influence.`
      };
    });

    return influence;
  }

  function getTwelveStage(dayStem, branch) {
    const startIndex = branches.indexOf(twelveStageStart[dayStem]);
    const branchIndex = branches.indexOf(branch);
    const direction = twelveStageDirection[dayStem];
    const stageIndex = mod((branchIndex - startIndex) * direction, 12);
    const stage = twelveStageNames[stageIndex];
    return {
      stage,
      meaning: twelveStageMeanings[stage]
    };
  }

  function buildTwelveStages(profile) {
    const dayStem = profile.dayMasterStem;
    const entries = getPillarBranchEntries(profile.pillars).map((entry) => {
      const stage = getTwelveStage(dayStem, entry.branch);
      return {
        pillar: entry.label,
        branch: entry.branch,
        stage: stage.stage,
        meaning: stage.meaning,
        summary: `${entry.label} ${entry.branch} places ${dayStem} at ${stage.stage}, read as ${stage.meaning}.`
      };
    });

    const strongest = entries.find((entry) => ["Lin Guan", "Di Wang", "Chang Sheng"].includes(entry.stage)) || entries[0];
    return {
      entries,
      summary: strongest
        ? `The strongest twelve-stage signal is ${strongest.stage} at ${strongest.pillar}, so this layer reads the chart for ${strongest.meaning}.`
        : "The twelve-stage layer is open because no branch entries were available."
    };
  }

  function buildTenGodByPillar(profile) {
    const pillarMeaning = {
      year: "ancestral field, social background, early environment, and distant networks",
      month: "career field, family pressure, adult responsibilities, and the strongest seasonal gate",
      day: "self, partner palace, intimate pattern, and the person's own seat",
      hour: "later life, children or legacy, private ambition, and what develops with time"
    };

    return ["year", "month", "day", "hour"].map((key) => {
      const pillar = profile.pillars[key];
      if (!pillar) {
        return {
          pillar: key,
          label: `${key[0].toUpperCase()}${key.slice(1)} Pillar`,
          stemGod: "Open",
          branchGod: "Open",
          summary: "Open because birth time was not supplied."
        };
      }

      const stemGod = getTenGod(profile.pillars.day.stemIndex, pillar.stemIndex);
      const mainHidden = hiddenStems[branches[pillar.branchIndex]][0];
      const branchGod = getTenGod(profile.pillars.day.stemIndex, stemIndex(mainHidden));
      return {
        pillar: key,
        label: `${key[0].toUpperCase()}${key.slice(1)} Pillar`,
        stemGod,
        branchGod,
        field: pillarMeaning[key],
        summary: `${key[0].toUpperCase()}${key.slice(1)} pillar governs ${pillarMeaning[key]}. Its visible stem reads as ${stemGod}, while the branch main qi reads as ${branchGod}.`
      };
    });
  }

  function buildLuckPhase(profile) {
    const birthYear = profile.input.birthDate ? Number(profile.input.birthDate.slice(0, 4)) : null;
    const currentYear = new Date().getFullYear();
    const age = birthYear ? currentYear - birthYear : null;

    const phases = [
      { max: 18, name: "Foundation", emphasis: "family field, study habits, identity formation, and early protection" },
      { max: 30, name: "Emergence", emphasis: "skill formation, first public direction, relationship imprinting, and mobility" },
      { max: 42, name: "Expansion", emphasis: "career building, wealth circulation, partnership choices, and visible responsibility" },
      { max: 54, name: "Consolidation", emphasis: "resource retention, authority, family structure, and correcting old leaks" },
      { max: 66, name: "Refinement", emphasis: "health of routine, protection, reputation, and meaningful legacy" },
      { max: Infinity, name: "Return", emphasis: "peace, transmission, spiritual order, and simplifying what remains" }
    ];
    const phase = phases.find((item) => age <= item.max) || phases[phases.length - 1];

    return {
      age,
      name: phase.name,
      emphasis: phase.emphasis,
      summary: age === null
        ? "Luck phase is left open because the birth year could not be read."
        : `At about age ${age}, this simplified life-stage layer is read as ${phase.name}. It emphasizes ${phase.emphasis}. This is not a precise Da Yun calculation; it is a readable stage prompt.`
    };
  }

  function addUsefulGodScore(scores, element, method, points, reason) {
    if (!scores[element]) {
      scores[element] = {
        element,
        score: 0,
        reasons: []
      };
    }
    scores[element].score += points;
    scores[element].reasons.push({
      method,
      label: yongShenMethodLabels[method],
      points,
      reason
    });
  }

  function buildSupportControlLayer(profile) {
    const scores = {};
    const dm = profile.dayMasterElement;
    const resource = elementProducedBy(dm);
    const output = elementProduces(dm);
    const wealth = elementControls(dm);
    const officer = elementControlledBy(dm);

    if (profile.strength.band === "Strong") {
      addUsefulGodScore(scores, wealth, "supportControl", 3, `The ${dm} Day Master reads strong, so wealth element ${wealth} helps spend and direct excess strength.`);
      addUsefulGodScore(scores, officer, "supportControl", 2.4, `Officer element ${officer} regulates a strong Day Master and gives structure.`);
      addUsefulGodScore(scores, output, "supportControl", 1.8, `Output element ${output} releases strength through expression and work.`);
    } else if (profile.strength.band === "Weak") {
      addUsefulGodScore(scores, resource, "supportControl", 3, `The ${dm} Day Master reads weak, so resource element ${resource} is needed first for recovery and support.`);
      addUsefulGodScore(scores, dm, "supportControl", 2.4, `Companion element ${dm} helps the Day Master stand before taking on wealth or officer pressure.`);
      addUsefulGodScore(scores, output, "supportControl", 0.8, `A small amount of output ${output} can move the chart, but it should not drain the Day Master too heavily.`);
    } else {
      addUsefulGodScore(scores, output, "supportControl", 2.4, `The ${dm} Day Master reads balanced, so output element ${output} gives useful movement without overloading the root.`);
      addUsefulGodScore(scores, wealth, "supportControl", 2, `Wealth element ${wealth} gives practical direction and material handling.`);
      addUsefulGodScore(scores, officer, "supportControl", 1.4, `Officer element ${officer} adds order when the chart can carry it.`);
    }

    return scores;
  }

  function buildClimateLayer(profile) {
    const scores = {};
    const regulator = seasonRegulators[profile.season];
    if (!regulator) return scores;

    addUsefulGodScore(scores, regulator.primary, "climate", 2.4, regulator.reason);
    addUsefulGodScore(scores, regulator.secondary, "climate", 1.2, `As a secondary climate regulator, ${regulator.secondary} helps the chart avoid seasonal imbalance.`);
    return scores;
  }

  function buildBridgeLayer(profile, analysisContext) {
    const scores = {};
    const dynamics = analysisContext.branchDynamics || [];
    const hasClash = dynamics.some((entry) => entry.type === "Clash");
    const hasCombination = dynamics.some((entry) => entry.type === "Combination");
    const weakest = analysisContext.elementDiagnosis ? analysisContext.elementDiagnosis.weakest : sortCounts(profile.elementCounts).slice(-1)[0][0];

    if (hasClash) {
      addUsefulGodScore(scores, weakest, "bridge", 1.4, `A branch clash is present, so the thinnest element ${weakest} is used as a bridge to reduce one-sided pressure.`);
      addUsefulGodScore(scores, profile.favorableElements[0], "bridge", 1, `The first favorable element ${profile.favorableElements[0]} is kept as a stabilizing bridge through the clash.`);
    }
    if (hasCombination) {
      addUsefulGodScore(scores, profile.favorableElements[0], "bridge", 1.2, `A branch combination is present, so ${profile.favorableElements[0]} helps turn affinity into usable support rather than attachment.`);
    }
    if (!hasClash && !hasCombination) {
      addUsefulGodScore(scores, profile.favorableElements[0], "bridge", 0.8, `No major simplified branch clash or combination is present, so the bridge layer follows the first favorable element.`);
    }

    return scores;
  }

  function buildMedicineLayer(profile, analysisContext) {
    const scores = {};
    const diagnosis = analysisContext.elementDiagnosis || buildElementDiagnosis(profile.elementCounts);
    const strongest = diagnosis.strongest;
    const weakest = diagnosis.weakest;
    const restrainer = elementControlledBy(strongest);
    const nourisher = elementProducedBy(weakest);

    addUsefulGodScore(scores, restrainer, "medicine", 1.8, `${strongest} is the most visible element, so ${restrainer} is used as medicine to restrain excess.`);
    addUsefulGodScore(scores, nourisher, "medicine", 1.4, `${weakest} is the thinnest element, so ${nourisher} is used as medicine to nourish what is weak.`);
    addUsefulGodScore(scores, weakest, "medicine", 0.8, `The thin element ${weakest} is also marked for gentle replenishment, not heavy overcorrection.`);
    return scores;
  }

  function mergeUsefulGodScores(layers) {
    const merged = {};
    layers.forEach((layer) => {
      Object.values(layer).forEach((entry) => {
        if (!merged[entry.element]) {
          merged[entry.element] = { element: entry.element, score: 0, reasons: [] };
        }
        merged[entry.element].score += entry.score;
        merged[entry.element].reasons.push(...entry.reasons);
      });
    });
    return Object.values(merged).sort((a, b) => b.score - a.score);
  }

  function buildUsefulGodAnalysis(profile, analysisContext) {
    const supportControl = buildSupportControlLayer(profile);
    const climate = buildClimateLayer(profile);
    const bridge = buildBridgeLayer(profile, analysisContext);
    const medicine = buildMedicineLayer(profile, analysisContext);
    const ranked = mergeUsefulGodScores([supportControl, climate, bridge, medicine]);
    const primary = ranked[0];
    const supporting = ranked.slice(1, 3);
    const strongest = analysisContext.elementDiagnosis.strongest;
    const avoid = ranked
      .filter((entry) => entry.element === strongest && entry.score < primary.score)
      .map((entry) => entry.element);
    if (!avoid.includes(strongest) && profile.strength.band === "Strong") avoid.push(strongest);

    return {
      primary: primary.element,
      supporting: supporting.map((entry) => entry.element),
      avoid,
      ranked,
      layers: {
        supportControl: Object.values(supportControl),
        climate: Object.values(climate),
        bridge: Object.values(bridge),
        medicine: Object.values(medicine)
      },
      summary: `The useful-god logic weighs support/control, climate regulation, bridge function, and disease-medicine correction. ${primary.element} ranks first as the primary useful god, with ${supporting.map((entry) => entry.element).join(" and ")} as supporting gods.`
    };
  }

  function buildDeepFocusReading(focus, profile) {
    const tenGod = profile.advancedAnalysis.tenGodStructure.dominant;
    const branchDynamic = profile.advancedAnalysis.branchDynamics[0];
    const elementDiagnosis = profile.advancedAnalysis.elementDiagnosis;
    const primary = profile.advancedAnalysis.usefulGodAnalysis.primary || profile.favorableElements[0];

    const copy = {
      career: `Career is read through visibility, pressure, authority, and whether output can turn into recognition. With ${tenGod} leading and ${branchDynamic.type.toLowerCase()} dynamics present, the useful move is to use ${primary} support to turn scattered effort into a clearer public role.`,
      wealth: `Wealth is read through whether the chart can receive, hold, and manage resources. With ${tenGod} leading and ${elementDiagnosis.strongest} already prominent, the useful move is to use ${primary} support to reduce leakage before seeking expansion.`,
      love: `Love is read through emotional pacing, warmth, trust, and whether the chart can stay open without depletion. With ${tenGod} leading and ${branchDynamic.type.toLowerCase()} dynamics present, the useful move is to use ${primary} support to steady the bond before intensifying it.`,
      protection: `Protection is read through boundaries, recovery, and the places where pressure enters the field. With ${tenGod} leading and ${elementDiagnosis.weakest} thin, the useful move is to use ${primary} support to gather energy instead of simply adding force.`,
      balance: `Balance is read through the strongest and weakest elements, then checked against branch movement and ten-god pressure. With ${elementDiagnosis.strongest} high and ${elementDiagnosis.weakest} low, the useful move is to use ${primary} support as the first correction.`
    };

    return copy[focus] || copy.balance;
  }

  function buildAdvancedAnalysis(profile, currentYear) {
    const elementDiagnosis = buildElementDiagnosis(profile.elementCounts);
    const tenGodStructure = buildTenGodStructure(profile.tenGodCounts);
    const branchDynamics = buildBranchDynamics(profile.pillars);
    const annualTrigger = buildAnnualTrigger(profile, currentYear);
    const seasonalCommand = buildSeasonalCommand(profile);
    const hiddenStemInfluence = buildHiddenStemInfluence(profile);
    const twelveStages = buildTwelveStages(profile);
    const tenGodByPillar = buildTenGodByPillar(profile);
    const luckPhase = buildLuckPhase(profile);
    const usefulGodAnalysis = buildUsefulGodAnalysis(profile, {
      elementDiagnosis,
      branchDynamics
    });

    return {
      elementDiagnosis,
      tenGodStructure,
      branchDynamics,
      annualTrigger,
      seasonalCommand,
      hiddenStemInfluence,
      twelveStages,
      tenGodByPillar,
      luckPhase,
      usefulGodAnalysis,
      depthSummary: `${seasonalCommand.summary} ${twelveStages.summary} ${luckPhase.summary} ${usefulGodAnalysis.summary}`,
      summary: `${elementDiagnosis.summary} ${tenGodStructure.summary} ${branchDynamics[0].meaning} ${annualTrigger.summary}`
    };
  }

  function calculateProfile(input) {
    const normalizedInput = normalizeInput(input);
    const { year, month, day } = normalizedInput.parsedBirthDate;
    const yearPillar = getYearPillar(year, month, day);
    const monthPillar = getMonthPillar(yearPillar.stemIndex, month, day);
    const dayPillar = getDayPillar(year, month, day);
    const hourPillar = getHourPillar(dayPillar.stemIndex, normalizedInput.birthTime || "");
    const pillars = { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };
    const pillarList = [yearPillar, monthPillar, dayPillar].concat(hourPillar ? [hourPillar] : []);
    const dayMasterStem = stems[dayPillar.stemIndex];
    const dayMasterElement = elements[dayPillar.stemIndex];
    const zodiac = animals[yearPillar.branchIndex];
    const elementCounts = getElementCounts(pillarList);
    const tenGodCounts = getTenGodCounts(pillarList, dayPillar.stemIndex);
    const strength = getDayMasterStrength(dayPillar.stemIndex, pillars);
    const favorableElements = getFavorableElements(dayPillar.stemIndex, strength.band);
    const favorableElementReasoning = buildFavorableElementReasoning(dayPillar.stemIndex, strength.band, favorableElements);
    const jewelry = buildJewelryDirection({
      favorableElements
    }, normalizedInput.lifeFocus);

    const hidden = {
      year: getHiddenStemDetails(yearPillar.branchIndex, dayPillar.stemIndex),
      month: getHiddenStemDetails(monthPillar.branchIndex, dayPillar.stemIndex),
      day: getHiddenStemDetails(dayPillar.branchIndex, dayPillar.stemIndex),
      hour: hourPillar ? getHiddenStemDetails(hourPillar.branchIndex, dayPillar.stemIndex) : []
    };

    const profile = {
      schemaVersion: "2026-04-30.yongshen-1",
      input: {
        birthDate: normalizedInput.birthDate,
        birthTime: normalizedInput.birthTime,
        lifeFocus: normalizedInput.lifeFocus,
        gender: normalizedInput.gender,
        birthLocation: normalizedInput.birthLocation
      },
      isValid: true,
      warnings: normalizedInput.warnings,
      zodiac,
      dayMasterStem,
      dayMasterElement,
      dayMasterProfile: dayMasterProfiles[dayMasterStem],
      season: branchSeason[branches[monthPillar.branchIndex]],
      pillars,
      pillarLabels: {
        year: pillarLabel(yearPillar),
        month: pillarLabel(monthPillar),
        day: pillarLabel(dayPillar),
        hour: hourPillar ? pillarLabel(hourPillar) : "Open because birth time was not supplied"
      },
      hiddenStems: hidden,
      elementCounts,
      tenGodCounts,
      strength,
      favorableElements,
      favorableElementReasoning,
      jewelry,
      focusReading: buildFocusReading(normalizedInput.lifeFocus, {
        tenGodCounts,
        favorableElements
      }),
      calculationNotes: {
        solarTerms: "Simplified fixed-date solar-term boundaries are used for the year and month pillars.",
        dayPillar: "The day pillar is calculated from a fixed 60-day cycle reference date.",
        hourPillar: hourPillar ? "Birth time was supplied, so the hour pillar is included." : "Birth time was not supplied, so the hour pillar is left open."
      },
      note: "This automated layer follows simplified fixed-date solar-term boundaries and rule-based interpretation. A human reading is still needed to refine exact solar terms, timing, nuance, and the final symbolic recommendation."
    };

    profile.elementRanking = sortCounts(elementCounts);
    profile.tenGodRanking = sortCounts(tenGodCounts);
    profile.advancedAnalysis = buildAdvancedAnalysis(profile, new Date().getFullYear());
    profile.usefulGodAnalysis = profile.advancedAnalysis.usefulGodAnalysis;
    profile.favorableElements = [
      profile.usefulGodAnalysis.primary,
      ...profile.usefulGodAnalysis.supporting,
      ...profile.favorableElements
    ].filter((element, index, list) => list.indexOf(element) === index);
    profile.favorableElementReasoning = profile.usefulGodAnalysis.summary;
    profile.jewelry = buildJewelryDirection({
      favorableElements: profile.favorableElements
    }, normalizedInput.lifeFocus);
    profile.deepFocusReading = buildDeepFocusReading(normalizedInput.lifeFocus, profile);
    profile.interpretations = buildInterpretations(profile);
    profile.focusStrategy = buildFocusStrategy(normalizedInput.lifeFocus, profile);
    profile.lifePhaseReading = buildLifePhaseReading(profile, normalizedInput);
    profile.readerCounsel = buildReaderCounsel(profile, normalizedInput);
    profile.masterMessage = buildMasterMessage(profile, normalizedInput);

    return profile;
  }

  window.BaziEngine = {
    stems,
    branches,
    animals,
    elements,
    branchElements,
    hiddenStems,
    elementMeaning,
    jewelrySupport,
    strengthWeights,
    calculateProfile,
    describePillar
  };
})();
