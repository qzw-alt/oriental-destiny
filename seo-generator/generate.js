// SEO Page Generator — generates programmatic SEO pages for Oriental Destiny.
// Usage: node generate.js --category zodiac|daymaster|all

const fs = require('fs');
const path = require('path');

const { render } = require('./lib/renderer');
const { buildZodiacPage, buildDayMasterPage } = require('./lib/content-builder');
const { getTopbarLinks, getFooterLinks, getBodyLinks } = require('./lib/link-resolver');
const { updateSitemap } = require('./lib/sitemap');

const TEMPLATE_PATH = path.join(__dirname, 'templates', 'article-base.html');
const OUTPUT_DIR = path.join(__dirname, 'output');
const SITE_ROOT = path.join(__dirname, '..');

// Color theming per element (for element-banner, trait cards, bg)
const ELEMENT_THEMES = {
  Wood: {
    banner: 'linear-gradient(135deg, #2d5a27, #3a7d34)',
    traitBg: 'rgba(49,82,71,0.07)',
    traitBorder: 'rgba(49,82,71,0.2)',
    strengthBg: 'rgba(49,82,71,0.08)',
    strengthBorder: 'rgba(49,82,71,0.2)',
    bodyBg: 'radial-gradient(circle at top, rgba(49,82,71,0.12), transparent 34%), linear-gradient(180deg, #eaf5e8 0%, var(--paper) 42%, #f7fbf6 100%)',
  },
  Fire: {
    banner: 'linear-gradient(135deg, #8B2500, #a63a2c)',
    traitBg: 'rgba(166,58,44,0.07)',
    traitBorder: 'rgba(166,58,44,0.2)',
    strengthBg: 'rgba(166,58,44,0.08)',
    strengthBorder: 'rgba(166,58,44,0.2)',
    bodyBg: 'radial-gradient(circle at top, rgba(166,58,44,0.15), transparent 34%), linear-gradient(180deg, #f5e8e4 0%, var(--paper) 42%, #fbf5f3 100%)',
  },
  Earth: {
    banner: 'linear-gradient(135deg, #7a5a10, #b78a42)',
    traitBg: 'rgba(183,138,66,0.07)',
    traitBorder: 'rgba(183,138,66,0.2)',
    strengthBg: 'rgba(183,138,66,0.08)',
    strengthBorder: 'rgba(183,138,66,0.2)',
    bodyBg: 'radial-gradient(circle at top, rgba(183,138,66,0.12), transparent 34%), linear-gradient(180deg, #f7f2e5 0%, var(--paper) 42%, #fbf8f0 100%)',
  },
  Metal: {
    banner: 'linear-gradient(135deg, #5a5a6e, #8a8aa0)',
    traitBg: 'rgba(100,100,120,0.07)',
    traitBorder: 'rgba(100,100,120,0.2)',
    strengthBg: 'rgba(100,100,120,0.08)',
    strengthBorder: 'rgba(100,100,120,0.2)',
    bodyBg: 'radial-gradient(circle at top, rgba(120,120,140,0.1), transparent 34%), linear-gradient(180deg, #f2f2f5 0%, var(--paper) 42%, #f8f8fa 100%)',
  },
  Water: {
    banner: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
    traitBg: 'rgba(26,58,92,0.07)',
    traitBorder: 'rgba(26,58,92,0.2)',
    strengthBg: 'rgba(26,58,92,0.08)',
    strengthBorder: 'rgba(26,58,92,0.2)',
    bodyBg: 'radial-gradient(circle at top, rgba(26,58,92,0.1), transparent 34%), linear-gradient(180deg, #e8eef5 0%, var(--paper) 42%, #f5f7fb 100%)',
  },
};

function getTheme(element) {
  return ELEMENT_THEMES[element] || ELEMENT_THEMES.Earth; // Earth as default
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateZodiacPages() {
  const zodiacData = require('./data/zodiac-signs.json');
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const slugs = Object.keys(zodiacData);
  const results = [];

  for (const slug of slugs) {
    const z = zodiacData[slug];
    const theme = getTheme(z.element);
    const articleBody = buildZodiacPage(z, slug);
    const bodyLinks = getBodyLinks('zodiac', slug);

    const title = `${z.name} Zodiac Sign — Personality, Career, Compatibility, and 2026 Fortune`;
    const desc = `Complete guide to the ${z.name} in the Chinese zodiac: personality traits, element variants by birth year, career matches, love compatibility, and 2026 Fire Horse fortune forecast.`;

    // Assemble related links section
    let relatedHtml = '';
    if (bodyLinks.length > 0) {
      relatedHtml = '\n<h2>Explore More</h2>\n<p>' + bodyLinks.map(l => l).join('</p>\n<p>') + '</p>\n';
    }

    const vars = {
      META_DESCRIPTION: desc,
      CANONICAL_URL: `${slug}-zodiac-sign.html`,
      OG_TITLE: title,
      OG_DESCRIPTION: desc,
      PAGE_TITLE: title,
      JSONLD_HEADLINE: title,
      JSONLD_DESCRIPTION: desc,
      BODY_BG: theme.bodyBg,
      BANNER_GRADIENT: theme.banner,
      TRAIT_CARD_BG: theme.traitBg,
      TRAIT_CARD_BORDER: theme.traitBorder,
      STRENGTH_BG: theme.strengthBg,
      STRENGTH_BORDER: theme.strengthBorder,
      ARTICLE_LABEL: 'Zodiac Series',
      H1_TITLE: `${z.name} in the Chinese Zodiac — Complete Personality and Fortune Guide`,
      LEAD_PARAGRAPH: `The ${z.name} is the ${ordinal(z.order)} sign of the Chinese zodiac — ${z.chineseName}, branch ${z.branch}, ${z.element} element, ${z.polarity} polarity. ${z.personality.overview.substring(0, 150)}...`,
      READING_TIME: '9',
      ARTICLE_BODY: articleBody + relatedHtml,
      TOPBAR_LINKS: getTopbarLinks('zodiac', slug),
      FOOTER_LINKS: getFooterLinks('zodiac', slug),
    };

    const html = render(template, vars);
    const filename = `${slug}-zodiac-sign.html`;
    const outPath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(outPath, html, 'utf8');
    results.push({ loc: filename, changefreq: 'monthly', priority: '0.8' });
    console.log(`  Generated: ${filename}`);
  }

  return results;
}

function generateDayMasterPages() {
  const dmData = require('./data/day-masters.json');
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const slugs = Object.keys(dmData);
  const results = [];

  // Map stem slugs to element for theming
  const stemElements = {
    jia: 'Wood', yi: 'Wood',
    bing: 'Fire', ding: 'Fire',
    wu: 'Earth', ji: 'Earth',
    geng: 'Metal', xin: 'Metal',
    ren: 'Water', gui: 'Water',
  };

  for (const slug of slugs) {
    const d = dmData[slug];
    const theme = getTheme(stemElements[slug] || 'Earth');
    const articleBody = buildDayMasterPage(d, slug);
    const bodyLinks = getBodyLinks('dayMaster', slug);

    const title = `${d.stem} ${d.englishName} Day Master — Personality, Career, Love, and Seasons`;
    const desc = `Complete guide to the ${d.stem} ${d.englishName} (${d.pinyin}) Day Master in BaZi: personality traits, best careers, relationship compatibility, seasonal variations, and Daoist jewelry recommendations.`;

    let relatedHtml = '';
    if (bodyLinks.length > 0) {
      relatedHtml = '\n<h2>Explore More</h2>\n<p>' + bodyLinks.map(l => l).join('</p>\n<p>') + '</p>\n';
    }

    const vars = {
      META_DESCRIPTION: desc,
      CANONICAL_URL: `${slug}-day-master.html`,
      OG_TITLE: title,
      OG_DESCRIPTION: desc,
      PAGE_TITLE: title,
      JSONLD_HEADLINE: title,
      JSONLD_DESCRIPTION: desc,
      BODY_BG: theme.bodyBg,
      BANNER_GRADIENT: theme.banner,
      TRAIT_CARD_BG: theme.traitBg,
      TRAIT_CARD_BORDER: theme.traitBorder,
      STRENGTH_BG: theme.strengthBg,
      STRENGTH_BORDER: theme.strengthBorder,
      ARTICLE_LABEL: 'Day Master Series',
      H1_TITLE: `${d.stem} ${d.englishName} Day Master — Complete Guide to Personality and Destiny`,
      LEAD_PARAGRAPH: `${d.stem} (${d.pinyin}) is the ${d.englishName} Day Master — ${d.element} element, ${d.polarity} polarity. ${d.personality.overview.substring(0, 150)}...`,
      READING_TIME: '8',
      ARTICLE_BODY: articleBody + relatedHtml,
      TOPBAR_LINKS: getTopbarLinks('dayMaster', slug),
      FOOTER_LINKS: getFooterLinks('dayMaster', slug),
    };

    const html = render(template, vars);
    const filename = `${slug}-day-master.html`;
    const outPath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(outPath, html, 'utf8');
    results.push({ loc: filename, changefreq: 'monthly', priority: '0.8' });
    console.log(`  Generated: ${filename}`);
  }

  return results;
}

function copyToRoot(files) {
  for (const f of files) {
    const src = path.join(OUTPUT_DIR, f.loc);
    const dest = path.join(SITE_ROOT, f.loc);
    fs.copyFileSync(src, dest);
  }
  console.log(`\nCopied ${files.length} files to site root.`);
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Main ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const category = args.includes('--category') ? args[args.indexOf('--category') + 1] : (args.includes('--all') ? 'all' : null);

if (!category) {
  console.log('Usage: node generate.js --category zodiac|daymaster|all');
  console.log('  zodiac    - Generate 12 Chinese zodiac sign pages');
  console.log('  daymaster - Generate 10 Day Master pages');
  console.log('  all       - Generate all pages');
  process.exit(1);
}

console.log('Oriental Destiny — SEO Page Generator\n');

let allResults = [];

if (category === 'zodiac' || category === 'all') {
  console.log('Generating Zodiac Sign pages...');
  allResults = allResults.concat(generateZodiacPages());
}

if (category === 'daymaster' || category === 'all') {
  console.log('\nGenerating Day Master pages...');
  allResults = allResults.concat(generateDayMasterPages());
}

// Copy generated files to site root
console.log('\nCopying to site root...');
copyToRoot(allResults);

// Update sitemap
console.log('\nUpdating sitemap...');
updateSitemap(allResults);

console.log(`\nDone! ${allResults.length} pages generated and integrated.`);
