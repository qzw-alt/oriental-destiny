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

  // ── Solar Terms Astronomical Engine ──────────────────────────────
  // Computes the 24 solar terms (Jie Qi) by finding when the Sun's
  // apparent ecliptic longitude reaches exact multiples of 15 degrees.
  // Accurate to within a few minutes for any year.

  function jdToCalendar(jd) {
    var Z = Math.floor(jd + 0.5);
    var F = jd + 0.5 - Z;
    var A = Z;
    if (Z >= 2299161) {
      var alpha = Math.floor((Z - 1867216.25) / 36524.25);
      A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    var B = A + 1524;
    var C = Math.floor((B - 122.1) / 365.25);
    var D = Math.floor(365.25 * C);
    var E = Math.floor((B - D) / 30.6001);
    var day = B - D - Math.floor(30.6001 * E) + F;
    var month = E < 14 ? E - 1 : E - 13;
    var year = month > 2 ? C - 4716 : C - 4715;
    return { year: year, month: month, day: Math.floor(day) };
  }

  function gregorianToJD(year, month, day) {
    var a = Math.floor((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y
      + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  function sunLongitude(jd) {
    var T = (jd - 2451545.0) / 36525;
    var T2 = T * T;
    var T3 = T2 * T;
    // Mean solar longitude
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
    // Mean solar anomaly
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T2;
    var Mrad = M * Math.PI / 180;
    var M2rad = 2 * Mrad;
    var M3rad = 3 * Mrad;
    // Equation of center
    var C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(M2rad)
          + 0.000289 * Math.sin(M3rad);
    var lon = (L0 + C) % 360;
    if (lon < 0) lon += 360;
    return lon;
  }

  function angleDiff(a, b) {
    var d = a - b;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  // Solar term names (for output)
  var SOLAR_TERM_NAMES = [
    "Li Chun", "Yu Shui", "Jing Zhe", "Chun Fen",
    "Qing Ming", "Gu Yu", "Li Xia", "Xiao Man",
    "Mang Zhong", "Xia Zhi", "Xiao Shu", "Da Shu",
    "Li Qiu", "Chu Shu", "Bai Lu", "Qiu Fen",
    "Han Lu", "Shuang Jiang", "Li Dong", "Xiao Xue",
    "Da Xue", "Dong Zhi", "Xiao Han", "Da Han"
  ];

  // The 12 "Jie" (month-starting) term indices
  var JIE_INDICES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  var JIE_MONTH_MAP = { 0:0, 2:1, 4:2, 6:3, 8:4, 10:5, 12:6, 14:7, 16:8, 18:9, 20:10, 22:11 };

  function computeSolarTerm(year, termIndex) {
    var targetLon = (315 + termIndex * 15) % 360;
    // Initial estimate: Li Chun is ~Feb 4 (day 35), each term ~15.218 days apart
    var jan1JD = gregorianToJD(year, 1, 1);
    var jd = jan1JD + 35 + termIndex * 15.2184;
    // Newton's method refinement
    for (var iter = 0; iter < 12; iter++) {
      var lon = sunLongitude(jd);
      var diff = angleDiff(lon, targetLon);
      if (Math.abs(diff) < 0.0001) break;
      jd -= diff / 0.9856;
    }
    return jdToCalendar(jd);
  }

  // Get solar term date as [month, day], cached per year for performance
  var _solarTermCache = {};
  function getSolarTermDate(year, termIndex) {
    var key = year + "_" + termIndex;
    if (!_solarTermCache[key]) {
      var d = computeSolarTerm(year, termIndex);
      _solarTermCache[key] = [d.month, d.day];
    }
    return _solarTermCache[key];
  }

  // ── City Coordinates & True Solar Time ───────────────────────────

  var CITY_COORDS = {
    "beijing":       [39.9, 116.4, 8],
    "shanghai":      [31.2, 121.5, 8],
    "guangzhou":     [23.1, 113.3, 8],
    "shenzhen":      [22.5, 114.1, 8],
    "chengdu":       [30.6, 104.1, 8],
    "chongqing":     [29.6, 106.6, 8],
    "tianjin":       [39.1, 117.2, 8],
    "wuhan":         [30.6, 114.3, 8],
    "nanjing":       [32.1, 118.8, 8],
    "xian":          [34.3, 108.9, 8],
    "hangzhou":      [30.3, 120.2, 8],
    "suzhou":        [31.3, 120.6, 8],
    "kunming":       [25.0, 102.7, 8],
    "xiamen":        [24.5, 118.1, 8],
    "changsha":      [28.2, 113.0, 8],
    "zhengzhou":     [34.8, 113.6, 8],
    "jinan":         [36.7, 117.0, 8],
    "taiyuan":       [37.9, 112.6, 8],
    "fuzhou":        [26.1, 119.3, 8],
    "guiyang":       [26.6, 106.7, 8],
    "haerbin":       [45.8, 126.5, 8],
    "changchun":     [43.9, 125.3, 8],
    "shenyang":      [41.8, 123.4, 8],
    "dalian":        [38.9, 121.6, 8],
    "qingdao":       [36.1, 120.4, 8],
    "wulumuqi":      [43.8, 87.6, 8],
    "urumqi":        [43.8, 87.6, 8],
    "lanzhou":       [36.1, 103.8, 8],
    "lasa":          [29.6, 91.1, 8],
    "lhasa":         [29.6, 91.1, 8],
    "hong kong":     [22.3, 114.2, 8],
    "taipei":        [25.0, 121.5, 8],
    "taibei":        [25.0, 121.5, 8],
    "macau":         [22.2, 113.5, 8],
    "macao":         [22.2, 113.5, 8],
    "singapore":     [1.3, 103.8, 8],
    "kuala lumpur":  [3.1, 101.7, 8],
    "kl":            [3.1, 101.7, 8],
    "tokyo":         [35.7, 139.7, 9],
    "osaka":         [34.7, 135.5, 9],
    "seoul":         [37.6, 127.0, 9],
    "busan":         [35.2, 129.1, 9],
    "sydney":        [-33.9, 151.2, 10],
    "melbourne":     [-37.8, 145.0, 10],
    "brisbane":      [-27.5, 153.0, 10],
    "perth":         [-32.0, 115.9, 8],
    "auckland":      [-36.8, 174.8, 12],
    "wellington":    [-41.3, 174.8, 12],
    "london":        [51.5, -0.1, 0],
    "manchester":    [53.5, -2.2, 0],
    "paris":         [48.9, 2.3, 1],
    "berlin":        [52.5, 13.4, 1],
    "rome":          [41.9, 12.5, 1],
    "madrid":        [40.4, -3.7, 1],
    "barcelona":     [41.4, 2.2, 1],
    "amsterdam":     [52.4, 4.9, 1],
    "zurich":        [47.4, 8.5, 1],
    "stockholm":     [59.3, 18.1, 1],
    "moscow":        [55.8, 37.6, 3],
    "new york":      [40.7, -74.0, -5],
    "new york city": [40.7, -74.0, -5],
    "nyc":           [40.7, -74.0, -5],
    "los angeles":   [34.1, -118.2, -8],
    "la":            [34.1, -118.2, -8],
    "san francisco": [37.8, -122.4, -8],
    "sf":            [37.8, -122.4, -8],
    "chicago":       [41.9, -87.6, -6],
    "houston":       [29.8, -95.4, -6],
    "seattle":       [47.6, -122.3, -8],
    "boston":        [42.4, -71.1, -5],
    "washington dc": [38.9, -77.0, -5],
    "miami":         [25.8, -80.2, -5],
    "toronto":       [43.7, -79.4, -5],
    "vancouver":     [49.3, -123.1, -8],
    "montreal":      [45.5, -73.6, -5],
    "calgary":       [51.0, -114.1, -7],
    "sao paulo":     [-23.5, -46.6, -3],
    "rio de janeiro":[-22.9, -43.2, -3],
    "buenos aires":  [-34.6, -58.4, -3],
    "mexico city":   [19.4, -99.1, -6],
    "dubai":         [25.2, 55.3, 4],
    "abu dhabi":     [24.5, 54.4, 4],
    "doha":          [25.3, 51.5, 3],
    "riyadh":        [24.7, 46.7, 3],
    "mumbai":        [19.1, 72.9, 5.5],
    "delhi":         [28.6, 77.2, 5.5],
    "new delhi":     [28.6, 77.2, 5.5],
    "bangkok":       [13.8, 100.5, 7],
    "jakarta":       [-6.2, 106.8, 7],
    "manila":        [14.6, 121.0, 8],
    "kolkata":       [22.6, 88.4, 5.5],
    "calcutta":      [22.6, 88.4, 5.5],
    "ho chi minh":   [10.8, 106.6, 7],
    "saigon":        [10.8, 106.6, 7],
    "hanoi":         [21.0, 105.8, 7]
  };

  function resolveCityCoords(cityName) {
    if (!cityName) return null;
    var key = cityName.trim().toLowerCase();
    // Exact match
    if (CITY_COORDS[key]) return CITY_COORDS[key];
    // Partial match (city name contains the lookup key or vice versa)
    for (var k in CITY_COORDS) {
      if (key.indexOf(k) !== -1 || k.indexOf(key) !== -1) {
        return CITY_COORDS[k];
      }
    }
    return null;
  }

  function getBrowserTimezoneOffset() {
    return -(new Date().getTimezoneOffset()) / 60;
  }

  function getShiChenIndex(hourFloat) {
    // Shi Chen: 子 23-01, 丑 01-03, 寅 03-05, ..., 亥 21-23
    // index: 子=0, 丑=1, ..., 亥=11
    if (hourFloat >= 23 || hourFloat < 1) return 0;
    return Math.floor((hourFloat + 1) / 2);
  }

  function computeSolarAdjustment(birthTime, cityName) {
    if (!birthTime) return { used: false, note: "No birth time provided; solar adjustment skipped." };

    var parts = birthTime.split(":").map(Number);
    var clockMinutes = parts[0] * 60 + (parts[1] || 0);
    var clockHourFloat = clockMinutes / 60;

    var coords = resolveCityCoords(cityName);
    var usedCityDb = true;

    if (!coords) {
      // Fallback: use browser timezone to estimate
      var tzOffset = getBrowserTimezoneOffset();
      coords = [0, tzOffset * 15, tzOffset];
      usedCityDb = false;
    }

    var lat = coords[0];
    var lon = coords[1];
    var tzOffset = coords[2];

    // Standard meridian for the timezone
    var tzMeridian = tzOffset * 15;
    // Adjustment: each degree of longitude difference = 4 minutes
    var adjustmentMinutes = (lon - tzMeridian) * 4;
    var solarMinutes = clockMinutes + adjustmentMinutes;

    // Handle day rollover
    var solarHourFloat = (solarMinutes / 60) % 24;
    if (solarHourFloat < 0) solarHourFloat += 24;

    var clockShiChen = getShiChenIndex(clockHourFloat);
    var solarShiChen = getShiChenIndex(solarHourFloat);
    var crossing = clockShiChen !== solarShiChen;

    // Format solar time as HH:MM
    var solarHour = Math.floor(solarHourFloat);
    var solarMin = Math.round((solarHourFloat - solarHour) * 60);
    if (solarMin === 60) { solarHour = (solarHour + 1) % 24; solarMin = 0; }
    var solarTimeStr = String(solarHour).padStart(2, "0") + ":" + String(solarMin).padStart(2, "0");

    var amountStr = (adjustmentMinutes >= 0 ? "+" : "") + Math.round(adjustmentMinutes);

    var note;
    if (usedCityDb) {
      note = "True solar time adjustment: " + amountStr + " min for " + (cityName || "unknown") + " (lon " + lon.toFixed(1) + "). ";
      if (crossing) {
        note += "The correction crosses a Shi Chen boundary — the adjusted hour pillar is used.";
      } else {
        note += "No Shi Chen boundary crossing.";
      }
    } else {
      note = "Solar time estimated from browser timezone (city not in database). Adjustment: " + amountStr + " min. For precise readings, consult a practitioner.";
    }

    return {
      city: cityName || "unknown",
      longitude: lon,
      timezoneMeridian: tzMeridian,
      adjustmentMinutes: Math.round(adjustmentMinutes),
      clockTime: birthTime,
      solarTime: solarTimeStr,
      shiChenCrossing: crossing,
      clockShiChen: clockShiChen,
      solarShiChen: solarShiChen,
      used: true,
      usedCityDb: usedCityDb,
      note: note
    };
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

  // ── Pillar calculation using real solar terms ───────────────────

  function getSolarTermForYear(year, termIndex) {
    var d = getSolarTermDate(year, termIndex);
    // d is [month, day] — month may be 1 (Jan) for Xiao Han / Da Han
    // For Xiao Han / Da Han (terms 22, 23) that fall in January,
    // they "belong" to the solar year starting at previous Li Chun,
    // so we shift the effective year forward for comparison.
    // But for month boundary checks, we need the actual calendar month/day.
    var actualYear = d[0] === 1 ? year : year;
    return { month: d[0], day: d[1], year: actualYear };
  }

  function getSolarYear(year, month, day) {
    // Li Chun = solar term index 0
    var liChun = getSolarTermDate(year, 0);
    return isOnOrAfter(month, day, liChun[0], liChun[1]) ? year : year - 1;
  }

  function getYearPillar(year, month, day) {
    const solarYear = getSolarYear(year, month, day);
    return {
      stemIndex: mod(solarYear - 4, 10),
      branchIndex: mod(solarYear - 4, 12)
    };
  }

  function getSolarMonthIndex(month, day, year) {
    // Check each of the 12 Jie (month-starting terms)
    for (var i = 0; i < 12; i++) {
      var jieIdx = JIE_INDICES[i];
      var jie = getSolarTermDate(year, jieIdx);
      // The term date gives the START of this solar month
      // Check on-or-after this Jie and before the next Jie
      var nextJieIdx = JIE_INDICES[(i + 1) % 12];
      var nextJie;
      if (nextJieIdx === 0) {
        // The next Jie after Da Xue (index 20 → Xiao Han 22? No, Jie cycle is:
        // 0(LiChun),2(JingZhe),4(QingMing),6(LiXia),8(MangZhong),10(XiaoShu),
        // 12(LiQiu),14(BaiLu),16(HanLu),18(LiDong),20(DaXue),22(XiaoHan)
        // After XiaoHan(22), the next is LiChun(0) of next year or this year)
        nextJie = getSolarTermDate(year + 1, 0);
      } else {
        nextJie = getSolarTermDate(year, nextJieIdx);
      }
      // Handle Xiao Han (22) in January: it's "after" Da Xue but in next calendar year
      // For year boundaries, if nextJie month is Jan and current month is Dec, it's fine
      if (isOnOrAfter(month, day, jie[0], jie[1]) &&
          !isOnOrAfter(month, day, nextJie[0], nextJie[1])) {
        return JIE_MONTH_MAP[jieIdx];
      }
    }
    // Fallback: should not reach here, but return 11 (Chou month / Xiao Han) for Jan dates
    return 11;
  }

  function getMonthPillar(yearStemIndex, month, day, year) {
    const solarMonthIndex = getSolarMonthIndex(month, day, year);
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
    const annualPillar = getAnnualPillar(currentYear);
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
      summary: `${currentYear} is read here as ${annualStem} ${annualBranch}. In this simplified annual layer, it shows ${triggerText}.`
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

  // ── Real Da Yun (大运) Calculation ────────────────────────────────

  function getDaYunDirection(gender, yearStemIndex) {
    var isYang = polarity[yearStemIndex] === "Yang";
    if (gender === "male") return isYang ? "forward" : "backward";
    if (gender === "female") return isYang ? "backward" : "forward";
    return null;
  }

  function daysBetweenDates(y1, m1, d1, y2, m2, d2) {
    var jd1 = gregorianToJD(y1, m1, d1);
    var jd2 = gregorianToJD(y2, m2, d2);
    return Math.abs(jd2 - jd1);
  }

  function findNearestSolarTerm(birthYear, birthMonth, birthDay, direction) {
    // Search all 24 solar terms in birth year and adjacent years
    var birthJD = gregorianToJD(birthYear, birthMonth, birthDay);
    var bestTerm = null;
    var bestJD = null;
    var bestDays = Infinity;

    // Search birth year and one adjacent year
    var searchYears = direction === "forward"
      ? [birthYear, birthYear + 1]
      : [birthYear - 1, birthYear];

    for (var yi = 0; yi < searchYears.length; yi++) {
      var sy = searchYears[yi];
      for (var ti = 0; ti < 24; ti++) {
        var d = getSolarTermDate(sy, ti);
        var termJD = gregorianToJD(sy, d[0], d[1]); // d[0] is actual month
        // For January terms (Da Han, Xiao Han), they might belong to a different year
        // Adjust: if term month > birth month and we're looking backward, or vice versa
        var diff = termJD - birthJD;

        if (direction === "forward" && diff > 0 && diff < bestDays) {
          bestDays = diff;
          bestJD = termJD;
          bestTerm = { index: ti, name: SOLAR_TERM_NAMES[ti], date: d, year: sy };
        } else if (direction === "backward" && diff < 0 && Math.abs(diff) < bestDays) {
          bestDays = Math.abs(diff);
          bestJD = termJD;
          bestTerm = { index: ti, name: SOLAR_TERM_NAMES[ti], date: d, year: sy };
        }
      }
    }

    return {
      termName: bestTerm ? bestTerm.name : "Unknown",
      termIndex: bestTerm ? bestTerm.index : 0,
      termDate: bestTerm ? bestTerm.date : [2, 4],
      termYear: bestTerm ? bestTerm.year : birthYear,
      daysDifference: Math.round(bestDays),
      direction: direction
    };
  }

  function calculateQiYunAge(daysToBoundary) {
    if (daysToBoundary <= 0) return 1;
    // 3 days = 1 year of Qi Yun age
    var rawAge = daysToBoundary / 3;
    // Round up: any partial 3-day block counts as a year
    return Math.ceil(rawAge);
  }

  function buildDaYunPillars(startStemIdx, startBranchIdx, direction, count, dayMasterStemIdx) {
    count = count || 8;
    var pillars = [];
    var step = direction === "forward" ? 1 : -1;

    for (var i = 0; i < count; i++) {
      // First pillar starts from month pillar, NOT including month pillar (next step)
      var stemIdx = mod(startStemIdx + step * (i + 1), 10);
      var branchIdx = mod(startBranchIdx + step * (i + 1), 12);
      var stem = stems[stemIdx];
      var branch = branches[branchIdx];
      var elem = elements[stemIdx];
      var animal = animals[branchIdx];
      var stemGod = getTenGod(dayMasterStemIdx, stemIdx);
      var mainHidden = hiddenStems[branch][0];
      var branchGod = getTenGod(dayMasterStemIdx, stemIndex(mainHidden));

      pillars.push({
        index: i,
        stemIndex: stemIdx,
        branchIndex: branchIdx,
        stem: stem,
        branch: branch,
        element: elem,
        animal: animal,
        tenGods: {
          stem: stemGod,
          branchMainQi: branchGod
        }
      });
    }

    return pillars;
  }

  function getCurrentDaYun(daYunPillars, qiYunAge, currentAge) {
    if (currentAge < qiYunAge) {
      return { beforeFirst: true, note: "Da Yun has not yet started. Qi Yun begins at age " + qiYunAge + "." };
    }
    var yearsSinceQiYun = currentAge - qiYunAge;
    var pillarIndex = Math.floor(yearsSinceQiYun / 10);
    if (pillarIndex >= daYunPillars.length) {
      pillarIndex = daYunPillars.length - 1;
    }
    var yearInPillar = yearsSinceQiYun % 10;
    var pillar = daYunPillars[pillarIndex];
    return {
      pillar: pillar,
      pillarIndex: pillarIndex,
      yearInPillar: yearInPillar,
      startAge: qiYunAge + pillarIndex * 10,
      endAge: qiYunAge + (pillarIndex + 1) * 10 - 1,
      summary: "Currently in Da Yun " + (pillarIndex + 1) + ": " + pillar.stem + " " + pillar.branch + " (" + pillar.element + " " + pillar.animal + "), year " + (yearInPillar + 1) + " of 10."
    };
  }

  function buildDaYun(profile, input, dayMasterStemIdx) {
    var gender = (input.gender || "").toLowerCase();
    if (gender !== "male" && gender !== "female") {
      return {
        note: "Gender not provided; Da Yun calculation skipped. Da Yun direction depends on gender + year stem polarity.",
        pillars: [],
        current: null
      };
    }

    var birth = input.parsedBirthDate;
    var yearStemIdx = profile.pillars.year.stemIndex;
    var direction = getDaYunDirection(gender, yearStemIdx);
    if (!direction) {
      return {
        note: "Could not determine Da Yun direction.",
        pillars: [],
        current: null
      };
    }

    var boundary = findNearestSolarTerm(birth.year, birth.month, birth.day, direction);
    var qiYunAge = calculateQiYunAge(boundary.daysDifference);
    var daYunPillars = buildDaYunPillars(
      profile.pillars.month.stemIndex,
      profile.pillars.month.branchIndex,
      direction,
      8,
      dayMasterStemIdx
    );

    // Build age ranges for each pillar
    for (var i = 0; i < daYunPillars.length; i++) {
      daYunPillars[i].startAge = qiYunAge + i * 10;
      daYunPillars[i].endAge = qiYunAge + (i + 1) * 10 - 1;
      daYunPillars[i].ageRange = daYunPillars[i].startAge + "-" + daYunPillars[i].endAge;
    }

    var currentYear = new Date().getFullYear();
    var currentAge = birth ? currentYear - birth.year : null;
    var current = currentAge !== null ? getCurrentDaYun(daYunPillars, qiYunAge, currentAge) : null;

    return {
      direction: direction,
      qiYunAge: qiYunAge,
      boundaryTerm: boundary.termName,
      boundaryDate: boundary.termDate,
      daysToBoundary: boundary.daysDifference,
      pillars: daYunPillars,
      current: current,
      summary: "Da Yun goes " + direction + ". " + boundary.daysDifference + " days from birth to " + boundary.termName + ", so Qi Yun starts at age " + qiYunAge + ". " + (current ? current.summary : "")
    };
  }

  // ── Liu Nian (流年) + Liu Yue (流月) ────────────────────────────

  function getAnnualPillar(year) {
    return {
      stemIndex: mod(year - 4, 10),
      branchIndex: mod(year - 4, 12)
    };
  }

  var BRANCH_HARMS = {
    Zi: "Wei", Chou: "Wu", Yin: "Si", Mao: "Chen",
    Chen: "Mao", Si: "Yin", Wu: "Chou", Wei: "Zi",
    Shen: "Hai", You: "Xu", Xu: "You", Hai: "Shen"
  };

  function buildLiuNian(profile, targetYear, dayMasterStemIdx) {
    var annualPillar = getAnnualPillar(targetYear);
    var annualStem = stems[annualPillar.stemIndex];
    var annualBranch = branches[annualPillar.branchIndex];
    var annualElement = elements[annualPillar.stemIndex];
    var annualAnimal = animals[annualPillar.branchIndex];

    // Ten gods of annual stem and branch main qi relative to Day Master
    var stemTenGod = getTenGod(dayMasterStemIdx, annualPillar.stemIndex);
    var mainHidden = hiddenStems[annualBranch][0];
    var branchTenGod = getTenGod(dayMasterStemIdx, stemIndex(mainHidden));

    // Check annual branch against each natal pillar branch
    var pillarTriggers = [];
    var pillarKeys = ["year", "month", "day", "hour"];
    pillarKeys.forEach(function (key) {
      var pillar = profile.pillars[key];
      if (!pillar) return;
      var natalBranch = branches[pillar.branchIndex];
      var label = key[0].toUpperCase() + key.slice(1) + " Branch";

      if (branchClashes[natalBranch] === annualBranch) {
        pillarTriggers.push({
          pillar: label,
          natalBranch: natalBranch,
          annualBranch: annualBranch,
          type: "Clash",
          detail: natalBranch + " clashes with " + annualBranch + " — potential upheaval or breakthrough at the " + key + " pillar."
        });
      }
      if (branchCombinations[natalBranch] === annualBranch) {
        pillarTriggers.push({
          pillar: label,
          natalBranch: natalBranch,
          annualBranch: annualBranch,
          type: "Combination",
          detail: natalBranch + " combines with " + annualBranch + " — opportunities for collaboration or binding at the " + key + " pillar."
        });
      }
      if (BRANCH_HARMS[natalBranch] === annualBranch) {
        pillarTriggers.push({
          pillar: label,
          natalBranch: natalBranch,
          annualBranch: annualBranch,
          type: "Harm",
          detail: natalBranch + " and " + annualBranch + " form a harm — subtle tensions or hidden friction at the " + key + " pillar."
        });
      }
    });

    // Favorability: does the annual element match the favorable/unfavorable elements?
    var favList = profile.usefulGodAnalysis
      ? [profile.usefulGodAnalysis.primary].concat(profile.usefulGodAnalysis.supporting || [])
      : profile.favorableElements.slice(0, 3);
    var avoidList = profile.usefulGodAnalysis
      ? (profile.usefulGodAnalysis.avoid || [])
      : [];

    var favorableScore = 0;
    if (favList.indexOf(annualElement) !== -1) favorableScore = 0.7;
    else if (avoidList.indexOf(annualElement) !== -1) favorableScore = -0.5;
    // Modulate by triggers
    var clashCount = pillarTriggers.filter(function (t) { return t.type === "Clash"; }).length;
    var combineCount = pillarTriggers.filter(function (t) { return t.type === "Combination"; }).length;
    favorableScore -= clashCount * 0.15;
    favorableScore += combineCount * 0.1;

    return {
      year: targetYear,
      stem: annualStem,
      branch: annualBranch,
      element: annualElement,
      animal: annualAnimal,
      tenGods: {
        stem: stemTenGod,
        branchMainQi: branchTenGod
      },
      pillarTriggers: pillarTriggers,
      favorableScore: Math.max(-1, Math.min(1, favorableScore)),
      summary: targetYear + " " + annualStem + " " + annualBranch + " (" + annualElement + " " + annualAnimal + ") brings " + stemTenGod + " energy. " + (pillarTriggers.length ? pillarTriggers.length + " pillar trigger(s) found." : "No major pillar triggers.")
    };
  }

  function buildLiuYue(profile, targetYear, dayMasterStemIdx) {
    // Monthly pillars for a given year
    // The year's first month (Yin month) starts from Li Chun
    // Month stem sequence depends on year stem
    var annualStemIdx = mod(targetYear - 4, 10);
    var tigerStemIdx = mod((annualStemIdx % 5) * 2 + 2, 10);
    var months = [];

    for (var i = 0; i < 12; i++) {
      var jieIdx = JIE_INDICES[i];
      var jieDate = getSolarTermDate(targetYear, jieIdx);
      var nextJieIdx = JIE_INDICES[(i + 1) % 12];
      var nextJieDate;
      if (nextJieIdx === 0) {
        nextJieDate = getSolarTermDate(targetYear + 1, 0);
      } else {
        nextJieDate = getSolarTermDate(targetYear, nextJieIdx);
      }

      var monthStemIdx = mod(tigerStemIdx + i, 10);
      var monthBranchIdx = mod(2 + i, 12); // Yin=2, Mao=3, ..., Chou=1
      var monthStem = stems[monthStemIdx];
      var monthBranch = branches[monthBranchIdx];
      var monthElement = elements[monthStemIdx];
      var stemTenGod = getTenGod(dayMasterStemIdx, monthStemIdx);
      var mainHidden = hiddenStems[monthBranch][0];
      var branchTenGod = getTenGod(dayMasterStemIdx, stemIndex(mainHidden));

      // Check this month's branch against natal pillars
      var triggers = [];
      ["year", "month", "day", "hour"].forEach(function (key) {
        var pillar = profile.pillars[key];
        if (!pillar) return;
        var natalBranch = branches[pillar.branchIndex];
        if (branchClashes[natalBranch] === monthBranch) {
          triggers.push({ pillar: key[0].toUpperCase() + key.slice(1), type: "Clash" });
        }
        if (branchCombinations[natalBranch] === monthBranch) {
          triggers.push({ pillar: key[0].toUpperCase() + key.slice(1), type: "Combination" });
        }
      });

      months.push({
        month: i + 1,
        period: jieDate[0] + "/" + jieDate[1] + " - " + nextJieDate[0] + "/" + nextJieDate[1],
        stem: monthStem,
        branch: monthBranch,
        element: monthElement,
        tenGods: { stem: stemTenGod, branchMainQi: branchTenGod },
        triggers: triggers,
        note: stemTenGod + " month — " + (triggers.length ? triggers.length + " natal pillar trigger(s)." : "steady flow.")
      });
    }

    return months;
  }

  function identifyTimingWindows(profile, liuNian, liuYue, dayMasterStemIdx) {
    var favElements = profile.usefulGodAnalysis
      ? [profile.usefulGodAnalysis.primary].concat(profile.usefulGodAnalysis.supporting || [])
      : profile.favorableElements.slice(0, 3);

    var windows = [];
    liuYue.forEach(function (month) {
      var score = 0;
      var type = "neutral";

      // Favorable element months get positive score
      if (favElements.indexOf(month.element) !== -1) {
        score += 3;
        type = "opportunity";
      }
      // Months with clashes get attention (could be transformative)
      if (month.triggers.some(function (t) { return t.type === "Clash"; })) {
        score += 2;
        if (type === "opportunity") type = "transformative";
        else type = "caution";
      }
      // Months with combinations get mild positive
      if (month.triggers.some(function (t) { return t.type === "Combination"; })) {
        score += 1;
        if (type === "neutral") type = "opportunity";
      }

      if (score > 0) {
        windows.push({
          period: month.period,
          stem: month.stem,
          branch: month.branch,
          element: month.element,
          type: type,
          score: score,
          guidance: type === "opportunity"
            ? "Favorable month — " + month.element + " energy supports your chart. Good for action and new starts."
            : type === "caution"
              ? "Transformative month — branch clash may bring upheaval but also breakthroughs. Stay grounded."
              : "Active month — " + month.element + " energy activates your chart. Pay attention to " + month.tenGods.stem + " themes."
        });
      }
    });

    // Keep top 5, sorted by score
    windows.sort(function (a, b) { return b.score - a.score; });
    return windows.slice(0, 5);
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

  function normalizeScores(ranked) {
    if (!ranked.length) return {};
    var maxScore = ranked[0].score;
    if (maxScore <= 0) maxScore = 1;
    var normalized = {};
    ranked.forEach(function (entry) {
      normalized[entry.element] = Math.round((entry.score / maxScore) * 100);
    });
    return normalized;
  }

  function detectLayerConflicts(layers) {
    var conflicts = {};
    var allElements = ["Wood", "Fire", "Earth", "Metal", "Water"];
    allElements.forEach(function (el) {
      var scoresByLayer = {};
      Object.keys(layers).forEach(function (layerName) {
        var layerEntries = layers[layerName];
        var entry = layerEntries.find(function (e) { return e.element === el; });
        scoresByLayer[layerName] = entry ? entry.score : 0;
      });
      var positive = Object.entries(scoresByLayer).filter(function (kv) { return kv[1] >= 1; });
      var negative = Object.entries(scoresByLayer).filter(function (kv) { return kv[1] < 0; });
      if (positive.length > 0 && negative.length > 0) {
        conflicts[el] = {
          positive: positive.map(function (kv) { return kv[0]; }),
          negative: negative.map(function (kv) { return kv[0]; }),
          detail: positive.map(function (kv) { return kv[0] + " layer scores " + el + " +" + kv[1]; }).join("; ") + " but " + negative.map(function (kv) { return kv[0] + " layer scores " + kv[1]; }).join("; ")
        };
      }
    });
    return conflicts;
  }

  function calculateConfidence(ranked) {
    if (ranked.length < 2) return { confidence: 100, level: "high", scoreSpread: 0 };
    var topScore = ranked[0].score;
    var secondScore = ranked[1].score;
    var totalScore = ranked.reduce(function (s, e) { return s + e.score; }, 0);
    if (totalScore <= 0) return { confidence: 50, level: "moderate", scoreSpread: 0 };
    var topShare = topScore / totalScore;
    var spread = Math.round((topScore - secondScore) * 10) / 10;
    // Confidence: top share scaled, with spread bonus
    var confidence = Math.min(100, Math.round(topShare * 100 * 1.5 + spread * 3));
    var level = confidence >= 65 ? "high" : (confidence >= 40 ? "moderate" : "low");
    return { confidence: confidence, level: level, scoreSpread: spread };
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

    var layers = {
      supportControl: Object.values(supportControl),
      climate: Object.values(climate),
      bridge: Object.values(bridge),
      medicine: Object.values(medicine)
    };
    var normalized = normalizeScores(ranked);
    var conflicts = detectLayerConflicts(layers);
    var confidence = calculateConfidence(ranked);
    var cautionElements = Object.keys(conflicts);

    var summary = primary.element + " (" + confidence.confidence + "%, " + confidence.level + " confidence) is the primary useful god, with " + supporting.map(function (e) { return e.element; }).join(" and ") + " as supporting gods.";
    if (cautionElements.length > 0) {
      summary += " Caution: " + cautionElements.join(", ") + " have conflicting signals across layers.";
    } else {
      summary += " Layer agreement is strong.";
    }

    return {
      primary: primary.element,
      supporting: supporting.map((entry) => entry.element),
      avoid,
      ranked,
      normalizedScores: normalized,
      confidence: confidence,
      conflicts: conflicts,
      cautionElements: cautionElements,
      layers: layers,
      summary: summary
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
        : `At about age ${age}, this simplified life-stage layer is read as ${phase.name}. It emphasizes ${phase.emphasis}. This is a readable stage prompt, complemented by the full Da Yun calculation.`
    };
  }

  function buildAdvancedAnalysis(profile, currentYear, input) {
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
    const monthPillar = getMonthPillar(yearPillar.stemIndex, month, day, year);
    const dayPillar = getDayPillar(year, month, day);

    // ── True Solar Time ──────────────────────────────────────────
    var solarAdjustment = computeSolarAdjustment(normalizedInput.birthTime, normalizedInput.birthLocation);
    var effectiveBirthTime = normalizedInput.birthTime;
    var hourPillarUncorrected = null;
    if (normalizedInput.birthTime) {
      hourPillarUncorrected = getHourPillar(dayPillar.stemIndex, normalizedInput.birthTime);
      if (solarAdjustment.used && solarAdjustment.shiChenCrossing) {
        effectiveBirthTime = solarAdjustment.solarTime;
      }
    }
    const hourPillar = getHourPillar(dayPillar.stemIndex, effectiveBirthTime);

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

    // Build solar terms note
    var liChun = getSolarTermDate(year, 0);
    var solarTermsNote = "Solar terms computed using astronomical algorithm (sun ecliptic longitude). Li Chun " + year + ": " + liChun[0] + "/" + liChun[1] + ".";
    if (year < 1900 || year > 2100) {
      solarTermsNote += " Year outside validated range (1900-2100); accuracy may degrade.";
    }

    var hourPillarNote;
    if (hourPillar) {
      hourPillarNote = "Birth time was supplied, so the hour pillar is included.";
      if (solarAdjustment.used && solarAdjustment.shiChenCrossing) {
        hourPillarNote += " True solar time correction (" + (solarAdjustment.adjustmentMinutes >= 0 ? "+" : "") + solarAdjustment.adjustmentMinutes + " min) shifted the hour pillar from the raw clock time.";
      } else if (solarAdjustment.used) {
        hourPillarNote += " True solar time correction applied (" + (solarAdjustment.adjustmentMinutes >= 0 ? "+" : "") + solarAdjustment.adjustmentMinutes + " min); no Shi Chen boundary crossing.";
      }
    } else {
      hourPillarNote = "Birth time was not supplied, so the hour pillar is left open.";
    }

    const profile = {
      schemaVersion: "2026-05-19.engine-upgrade-1",
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
        solarTerms: solarTermsNote,
        dayPillar: "The day pillar is calculated from a fixed 60-day cycle reference date.",
        hourPillar: hourPillarNote,
        solarTime: solarAdjustment.note
      },
      solarAdjustment: solarAdjustment,
      hourPillarUncorrected: hourPillarUncorrected ? pillarLabel(hourPillarUncorrected) : null,
      note: "This automated layer uses astronomical solar terms and true solar time correction. A human reading is still recommended for final refinement."
    };

    profile.elementRanking = sortCounts(elementCounts);
    profile.tenGodRanking = sortCounts(tenGodCounts);
    profile.advancedAnalysis = buildAdvancedAnalysis(profile, new Date().getFullYear(), normalizedInput);
    profile.usefulGodAnalysis = profile.advancedAnalysis.usefulGodAnalysis;

    // ── Da Yun ──────────────────────────────────────────────────
    profile.daYun = buildDaYun(profile, normalizedInput, dayPillar.stemIndex);

    // ── Liu Nian + Liu Yue + Timing Windows ────────────────────
    var currentYear = new Date().getFullYear();
    profile.liuNian = buildLiuNian(profile, currentYear, dayPillar.stemIndex);
    profile.liuYue = buildLiuYue(profile, currentYear, dayPillar.stemIndex);
    profile.timingWindows = identifyTimingWindows(profile, profile.liuNian, profile.liuYue, dayPillar.stemIndex);
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
