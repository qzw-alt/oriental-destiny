// Link resolver — generates internal link sets for generated pages.
const { pick, hashCode } = require('./variation');

// Categorized map of all site pages
const PAGES = {
  zodiac: [
    { slug: 'rat-zodiac-sign', name: 'Rat Zodiac Sign' },
    { slug: 'ox-zodiac-sign', name: 'Ox Zodiac Sign' },
    { slug: 'tiger-zodiac-sign', name: 'Tiger Zodiac Sign' },
    { slug: 'rabbit-zodiac-sign', name: 'Rabbit Zodiac Sign' },
    { slug: 'dragon-zodiac-sign', name: 'Dragon Zodiac Sign' },
    { slug: 'snake-zodiac-sign', name: 'Snake Zodiac Sign' },
    { slug: 'horse-zodiac-sign', name: 'Horse Zodiac Sign' },
    { slug: 'goat-zodiac-sign', name: 'Goat Zodiac Sign' },
    { slug: 'monkey-zodiac-sign', name: 'Monkey Zodiac Sign' },
    { slug: 'rooster-zodiac-sign', name: 'Rooster Zodiac Sign' },
    { slug: 'dog-zodiac-sign', name: 'Dog Zodiac Sign' },
    { slug: 'pig-zodiac-sign', name: 'Pig Zodiac Sign' },
  ],
  dayMaster: [
    { slug: 'jia-day-master', name: 'Jia Wood Day Master' },
    { slug: 'yi-day-master', name: 'Yi Wood Day Master' },
    { slug: 'bing-day-master', name: 'Bing Fire Day Master' },
    { slug: 'ding-day-master', name: 'Ding Fire Day Master' },
    { slug: 'wu-day-master', name: 'Wu Earth Day Master' },
    { slug: 'ji-day-master', name: 'Ji Earth Day Master' },
    { slug: 'geng-day-master', name: 'Geng Metal Day Master' },
    { slug: 'xin-day-master', name: 'Xin Metal Day Master' },
    { slug: 'ren-day-master', name: 'Ren Water Day Master' },
    { slug: 'gui-day-master', name: 'Gui Water Day Master' },
  ],
  elementPages: [
    { slug: 'fire-element-in-bazi', name: 'Fire Element in BaZi' },
    { slug: 'wood-element-in-bazi', name: 'Wood Element in BaZi' },
    { slug: 'earth-element-in-bazi', name: 'Earth Element in BaZi' },
    { slug: 'metal-element-in-bazi', name: 'Metal Element in BaZi' },
    { slug: 'water-element-in-bazi', name: 'Water Element in BaZi' },
    { slug: 'five-elements-explained', name: 'Five Elements Explained' },
  ],
  pillarPages: [
    { slug: 'year-pillar-bazi', name: 'Year Pillar in BaZi' },
    { slug: 'month-pillar-bazi', name: 'Month Pillar in BaZi' },
    { slug: 'day-pillar-bazi', name: 'Day Pillar in BaZi' },
    { slug: 'hour-pillar-bazi', name: 'Hour Pillar in BaZi' },
  ],
  guidePages: [
    { slug: 'what-is-bazi-complete-guide', name: 'What Is BaZi — Complete Guide' },
    { slug: 'bazi-guide', name: 'BaZi Guide' },
    { slug: 'how-to-read-bazi-chart', name: 'How to Read a BaZi Chart' },
    { slug: 'what-is-day-master', name: 'What Is a Day Master' },
    { slug: 'bazi-reading-vs-zodiac', name: 'BaZi vs Zodiac' },
    { slug: 'bazi-compatibility-reading', name: 'BaZi Compatibility Reading' },
    { slug: 'ten-gods-in-bazi', name: 'Ten Gods in BaZi' },
    { slug: 'luck-cycles-da-yun', name: 'Luck Cycles (Da Yun)' },
    { slug: 'bazi-calculator-guide', name: 'BaZi Calculator Guide' },
  ],
  commercial: [
    { slug: 'instant_reading', name: 'Free Reading' },
    { slug: 'products', name: 'Plans' },
    { slug: 'daoist-treasures', name: 'Daoist Treasures' },
  ],
};

// Get topbar nav links for a page
function getTopbarLinks(category, slug) {
  const base = [
    '<a href="instant_reading.html">Free Reading</a>',
    '<a href="products.html">Plans</a>',
    '<a href="daoist-treasures.html">Daoist Treasures</a>',
  ];

  if (category === 'zodiac') {
    base.push('<a href="bazi-guide.html">BaZi Guide</a>');
    base.push('<a href="what-is-bazi-complete-guide.html">What Is BaZi</a>');
  } else if (category === 'dayMaster') {
    base.push('<a href="what-is-day-master.html">Day Master</a>');
    base.push('<a href="five-elements-explained.html">Five Elements</a>');
  }

  base.push('<a href="mailto:434338480@qq.com">Contact</a>');
  return base.join('\n                ');
}

// Get footer links for a page
function getFooterLinks(category, slug) {
  const base = [
    '<a href="instant_reading.html">Free Reading</a>',
    '<a href="products.html">Plans</a>',
    '<a href="bazi-guide.html">BaZi Guide</a>',
    '<a href="what-is-bazi-complete-guide.html">What Is BaZi</a>',
  ];

  if (category === 'zodiac') {
    base.push('<a href="five-elements-explained.html">Five Elements</a>');
    base.push('<a href="bazi-compatibility-reading.html">Compatibility</a>');
    base.push('<a href="policies.html">Policies</a>');
  } else if (category === 'dayMaster') {
    base.push('<a href="what-is-day-master.html">Day Master</a>');
    base.push('<a href="ten-gods-in-bazi.html">Ten Gods</a>');
    base.push('<a href="policies.html">Policies</a>');
  }

  return base.join('\n                ');
}

// Get related article links for inline cross-referencing within body text
function getBodyLinks(category, slug, count = 3) {
  const links = [];
  const seed = slug + '-body';

  if (category === 'zodiac') {
    // Link to other zodiac pages (best matches)
    const zodiacData = require('../data/zodiac-signs.json');
    const currentAnimal = zodiacData[slug];
    if (currentAnimal && currentAnimal.compatibility) {
      const bestMatches = currentAnimal.compatibility.best;
      for (const match of bestMatches.slice(0, 2)) {
        const animalSlug = match.animal.toLowerCase();
        links.push(`<a href="${animalSlug}-zodiac-sign.html">${match.animal} Zodiac Sign — personality, career, and fortune guide →</a>`);
      }
    }
    // Add a guide link
    const guide = pick(PAGES.guidePages, seed + 'guide');
    links.push(`<a href="${guide.slug}.html">${guide.name} →</a>`);
  } else if (category === 'dayMaster') {
    // Link to related day masters and guides
    const dayMasterData = require('../data/day-masters.json');
    const currentDm = dayMasterData[slug];
    if (currentDm && currentDm.relationships) {
      const compat = currentDm.relationships.compatibleDayMasters;
      if (compat && compat.length > 0) {
        // Match compatible day master to its slug (e.g., "Xin Metal" -> "xin-day-master")
        const compatKeyword = compat[0].toLowerCase().split(' ')[0];
        const allSlugs = PAGES.dayMaster.map(d => d.slug);
        const matched = allSlugs.find(s => s.startsWith(compatKeyword + '-'));
        if (matched) {
          links.push(`<a href="${matched}.html">${compat[0]} Day Master — complete personality and career guide →</a>`);
        }
      }
    }
    const guide = pick(PAGES.guidePages, seed + 'guide');
    links.push(`<a href="${guide.slug}.html">${guide.name} →</a>`);
    const pillar = pick(PAGES.pillarPages, seed + 'pillar');
    links.push(`<a href="${pillar.slug}.html">${pillar.name} →</a>`);
  }

  return links;
}

module.exports = { getTopbarLinks, getFooterLinks, getBodyLinks, PAGES };
