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
    const [year, month, day] = dateValue.split("-").map(Number);
    return { year, month, day };
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
    if (monthElement === dayMasterElement) return 2.5;
    if (monthElement === elementProducedBy(dayMasterElement)) return 1.6;
    if (monthElement === elementProduces(dayMasterElement)) return -0.8;
    if (monthElement === elementControls(dayMasterElement)) return -1.2;
    return 0.4;
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

      if (stemElement === dayElement) score += 1.6;
      if (stemElement === resourceElement) score += 1.2;
      if (stemElement === outputElement) score -= 0.6;
      if (stemElement === wealthElement) score -= 0.9;
      if (stemElement === officerElement) score -= 0.8;

      if (branchElement === dayElement) score += 1.0;
      if (branchElement === resourceElement) score += 0.8;
      if (branchElement === outputElement) score -= 0.4;
      if (branchElement === wealthElement) score -= 0.6;
      if (branchElement === officerElement) score -= 0.6;
    });

    let band = "Balanced";
    if (score >= 5.5) band = "Strong";
    else if (score <= 2.2) band = "Weak";

    return { score, band };
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
    const focusLabels = {
      career: "career and standing in the outer world",
      wealth: "wealth, retention, and the keeping of resources",
      love: "human bonds, affection, and emotional steadiness",
      protection: "protection, boundaries, and the settling of disturbance",
      balance: "the broader ordering of the life pattern"
    };

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

    return copy[focus];
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

  function calculateProfile(input) {
    const { year, month, day } = parseBirthDate(input.birthDate);
    const yearPillar = getYearPillar(year, month, day);
    const monthPillar = getMonthPillar(yearPillar.stemIndex, month, day);
    const dayPillar = getDayPillar(year, month, day);
    const hourPillar = getHourPillar(dayPillar.stemIndex, input.birthTime || "");
    const pillars = { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };
    const pillarList = [yearPillar, monthPillar, dayPillar].concat(hourPillar ? [hourPillar] : []);
    const dayMasterStem = stems[dayPillar.stemIndex];
    const dayMasterElement = elements[dayPillar.stemIndex];
    const zodiac = animals[yearPillar.branchIndex];
    const elementCounts = getElementCounts(pillarList);
    const tenGodCounts = getTenGodCounts(pillarList, dayPillar.stemIndex);
    const strength = getDayMasterStrength(dayPillar.stemIndex, pillars);
    const favorableElements = getFavorableElements(dayPillar.stemIndex, strength.band);
    const jewelry = buildJewelryDirection({
      favorableElements
    }, input.lifeFocus);

    const hidden = {
      year: getHiddenStemDetails(yearPillar.branchIndex, dayPillar.stemIndex),
      month: getHiddenStemDetails(monthPillar.branchIndex, dayPillar.stemIndex),
      day: getHiddenStemDetails(dayPillar.branchIndex, dayPillar.stemIndex),
      hour: hourPillar ? getHiddenStemDetails(hourPillar.branchIndex, dayPillar.stemIndex) : []
    };

    const profile = {
      input,
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
      jewelry,
      focusReading: buildFocusReading(input.lifeFocus, {
        tenGodCounts,
        favorableElements
      }),
      note: "This automated layer follows simplified solar-term boundaries and rule-based interpretation. A human reading is still needed to refine timing, nuance, and the final symbolic recommendation."
    };

    profile.interpretations = buildInterpretations(profile);
    profile.readerCounsel = buildReaderCounsel(profile, input);
    profile.masterMessage = buildMasterMessage(profile, input);
    profile.elementRanking = sortCounts(elementCounts);
    profile.tenGodRanking = sortCounts(tenGodCounts);

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
    calculateProfile,
    describePillar
  };
})();
