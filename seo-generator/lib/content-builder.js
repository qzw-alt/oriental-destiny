// Content builder — assembles article body HTML from data + components.
const { vary } = require('./variation');

// ── Zodiac Sign Page Builder ──────────────────────────────────────────

function buildZodiacPage(data, slug) {
  const z = data;
  const sections = [];

  // Intro paragraph
  sections.push(`<p>${vary('zodiacIntro', slug, z.name)}</p>`);

  // Element banner
  sections.push(`
<div class="element-banner">
    <div class="icon">${getZodiacEmoji(slug)}</div>
    <div class="text">
        <h3>The Essence of the ${z.name}</h3>
        <p>Branch: ${z.branch} (${z.chineseName}) · Element: ${z.element} · Polarity: ${z.polarity} · Order: ${z.order} of 12</p>
    </div>
</div>`);

  // Years table with element variants
  sections.push(`<h2>${z.name} Years and Element Variants</h2>`);
  sections.push(`<p>Each ${z.name} year is modified by one of the five elements, creating five distinct types of ${z.name}. Find your birth year below:</p>`);
  sections.push(buildYearsTable(z));

  // Personality section
  sections.push(`<h2>${z.name} Personality and Character Traits</h2>`);
  sections.push(`<p>${z.personality.overview}</p>`);
  sections.push(buildTraitGrid(z.personality.traits));

  // Strengths & Weaknesses
  sections.push(buildStrengthWeakness(z.personality.strengths, z.personality.weaknesses));

  // Career section
  sections.push(`<h2>${z.name} Career and Professional Life</h2>`);
  sections.push(`<p>${vary('careerIntro', slug, z.name)}</p>`);
  sections.push(buildCareerTable(z.career));

  // Compatibility section
  sections.push(`<h2>${z.name} Compatibility — Best Matches and Challenging Signs</h2>`);
  sections.push(buildCompatibilityList(z.compatibility));

  // Lucky items
  sections.push(`<h2>${z.name} Lucky Items and Symbols</h2>`);
  sections.push(buildLuckyGrid(z.luckyItems));

  // 2026 Fortune
  sections.push(`<h2>${z.name} 2026 Fortune — Year of the Fire Horse</h2>`);
  sections.push(buildFortuneSection(z, slug));

  // Element dynamics
  sections.push(`<h2>The ${z.name}'s Element Dynamics</h2>`);
  sections.push(`<p>${z.elementDynamic}</p>`);

  // Daoist treasure
  sections.push(`<h2>Daoist Jewelry for the ${z.name}</h2>`);
  sections.push(`<p>${z.daoistTreasure}</p>`);

  // CTA
  sections.push(buildCTA());

  // FAQ
  sections.push(`<h2>Frequently Asked Questions About the ${z.name}</h2>`);
  sections.push(buildZodiacFAQ(z, slug));

  return sections.join('\n\n');
}

// ── Day Master Page Builder ──────────────────────────────────────────

function buildDayMasterPage(data, slug) {
  const d = data;
  const sections = [];

  // Intro
  sections.push(`<p>${vary('dayMasterIntro', slug, d.englishName, d.element, d.image)}</p>`);

  // Element banner
  sections.push(`
<div class="element-banner">
    <div class="icon">${getElementEmoji(d.element)}</div>
    <div class="text">
        <h3>${d.stem} · ${d.englishName} · ${d.element} · ${d.polarity}</h3>
        <p>${d.image}</p>
    </div>
</div>`);

  // Personality
  sections.push(`<h2>${d.englishName} Day Master Personality</h2>`);
  sections.push(`<p>${d.personality.overview}</p>`);
  sections.push(buildTraitGridSimple(d.personality.coreTraits));
  sections.push(buildStrengthWeakness(d.personality.strengths, d.personality.weaknesses));

  // Career
  sections.push(`<h2>Best Careers for ${d.englishName} Day Masters</h2>`);
  sections.push(`<p>${vary('dayMasterCareer', slug, d.englishName, d.element)}</p>`);
  sections.push(buildCareerTable(d.career));

  // Relationships
  sections.push(`<h2>${d.englishName} Day Master in Love and Relationships</h2>`);
  sections.push(`<p>${d.relationships.description}</p>`);
  sections.push(`
<div class="element-pair">
    <div class="pair-label">Ideal Partner</div>
    <p class="pair-desc"><strong>${d.relationships.idealPartner}</strong></p>
</div>`);
  sections.push(`<p><strong>Most compatible Day Masters:</strong> ${d.relationships.compatibleDayMasters.join(', ')}</p>`);
  sections.push(`<p><strong>More challenging pairings:</strong> ${d.relationships.challengingDayMasters.join(', ')}</p>`);

  // Seasonal variations
  sections.push(`<h2>${d.englishName} Day Master Through the Seasons</h2>`);
  sections.push(buildSeasonalNotes(d.seasonalNotes));

  // Famous archetypes
  sections.push(`<h2>Famous ${d.englishName} Day Master Archetypes</h2>`);
  sections.push(`<p>${d.famousArchetypes}</p>`);

  // Element dynamics
  sections.push(`<h2>Element Dynamics for ${d.englishName} Day Master</h2>`);
  sections.push(`<p>${d.elementDynamics}</p>`);

  // Jewelry
  sections.push(`<h2>Daoist Jewelry Recommendations</h2>`);
  sections.push(`<p>${d.daoistJewelry}</p>`);

  // CTA
  sections.push(buildCTA());

  // FAQ
  sections.push(`<h2>Frequently Asked Questions</h2>`);
  sections.push(buildDayMasterFAQ(d, slug));

  return sections.join('\n\n');
}

// ── HTML Component Builders ──────────────────────────────────────────

function buildYearsTable(zodiac) {
  let html = `<table class="years-table"><thead><tr><th>Birth Years</th><th>Element</th><th>What This Means</th></tr></thead><tbody>`;
  for (const v of zodiac.elementVariants) {
    const yearRange = v.years.join(', ');
    html += `<tr><td><strong>${yearRange}</strong></td><td>${v.element}</td><td>${v.description}</td></tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function buildTraitGrid(traits) {
  let html = `<div class="trait-grid">`;
  for (const t of traits) {
    html += `
    <div class="trait-card">
        <div class="trait-icon">${t.icon}</div>
        <div class="trait-name">${t.name}</div>
        <div class="trait-desc">${t.desc}</div>
    </div>`;
  }
  html += `</div>`;
  return html;
}

function buildTraitGridSimple(traits) {
  const icons = ['🌱', '💫', '⚡', '🛡', '🎯', '💡'];
  let html = `<div class="trait-grid">`;
  for (let i = 0; i < traits.length; i++) {
    html += `
    <div class="trait-card">
        <div class="trait-icon">${icons[i] || '✨'}</div>
        <div class="trait-name">${traits[i]}</div>
    </div>`;
  }
  html += `</div>`;
  return html;
}

function buildStrengthWeakness(strengths, weaknesses) {
  return `
<div class="strength-weakness">
    <div class="sw-box strength">
        <h4>Core Strengths</h4>
        <ul>${strengths.map(s => `<li>${s}</li>`).join('\n')}</ul>
    </div>
    <div class="sw-box weakness">
        <h4>Common Tendencies to Watch</h4>
        <ul>${weaknesses.map(w => `<li>${w}</li>`).join('\n')}</ul>
    </div>
</div>`;
}

function buildCareerTable(careers) {
  let html = `<table class="career-table"><thead><tr><th>Field</th><th>Why It Suits</th></tr></thead><tbody>`;
  for (const c of careers) {
    html += `<tr><td><strong>${c.field}</strong></td><td>${c.why}</td></tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function buildCompatibilityList(compat) {
  let html = '';

  for (const c of compat.best) {
    html += `
<div class="compat-card excellent">
    <div class="compat-rating">${c.rating}</div>
    <div><strong>${c.animal}</strong> — ${c.reason}</div>
</div>`;
  }
  for (const c of (compat.good || [])) {
    html += `
<div class="compat-card good">
    <div class="compat-rating">${c.rating}</div>
    <div><strong>${c.animal}</strong> — ${c.reason}</div>
</div>`;
  }
  for (const c of (compat.challenging || [])) {
    html += `
<div class="compat-card challenging">
    <div class="compat-rating">${c.rating}</div>
    <div><strong>${c.animal}</strong> — ${c.reason}</div>
</div>`;
  }
  return html;
}

function buildLuckyGrid(lucky) {
  return `
<div class="lucky-grid">
    <div class="lucky-card">
        <div class="lucky-icon">🎨</div>
        <div class="lucky-label">Colors</div>
        <div class="lucky-value">${lucky.colors.join(', ')}</div>
    </div>
    <div class="lucky-card">
        <div class="lucky-icon">🔢</div>
        <div class="lucky-label">Numbers</div>
        <div class="lucky-value">${lucky.numbers.join(', ')}</div>
    </div>
    <div class="lucky-card">
        <div class="lucky-icon">🧭</div>
        <div class="lucky-label">Directions</div>
        <div class="lucky-value">${lucky.directions.join(', ')}</div>
    </div>
    <div class="lucky-card">
        <div class="lucky-icon">🌸</div>
        <div class="lucky-label">Flowers</div>
        <div class="lucky-value">${lucky.flowers.join(', ')}</div>
    </div>
</div>`;
}

function buildFortuneSection(zodiac, slug) {
  const f = zodiac.fortune2026;
  return `
<div class="fortune-section">
    <p><strong>Overall:</strong> ${f.overall}</p>
    <div class="fortune-grid">
        <div class="fortune-card">
            <div class="fortune-label">Career</div>
            <p>${vary('fortune2026Career', slug, zodiac.name)}</p>
        </div>
        <div class="fortune-card">
            <div class="fortune-label">Love</div>
            <p>${vary('fortune2026Love', slug, zodiac.name)}</p>
        </div>
        <div class="fortune-card">
            <div class="fortune-label">Wealth</div>
            <p>${vary('fortune2026Wealth', slug, zodiac.name)}</p>
        </div>
        <div class="fortune-card">
            <div class="fortune-label">Health</div>
            <p>${vary('fortune2026Health', slug, zodiac.name)}</p>
        </div>
    </div>
    <p style="margin-top:18px;"><strong>Key months:</strong> ${f.keyMonths.map(m => monthName(m)).join(', ')}</p>
</div>`;
}

function buildSeasonalNotes(notes) {
  return `
<div class="element-pair"><div class="pair-label">Spring</div><p class="pair-desc">${notes.spring}</p></div>
<div class="element-pair"><div class="pair-label">Summer</div><p class="pair-desc">${notes.summer}</p></div>
<div class="element-pair"><div class="pair-label">Autumn</div><p class="pair-desc">${notes.autumn}</p></div>
<div class="element-pair"><div class="pair-label">Winter</div><p class="pair-desc">${notes.winter}</p></div>`;
}

function buildCTA() {
  return `
<div class="cta-box">
    <h2>Discover Your Personal BaZi Chart</h2>
    <p>Your zodiac sign is just the beginning. Enter your birth details for a free instant BaZi reading — your Day Master, element balance, and personalized guidance.</p>
    <a href="instant_reading.html">Get Your Free BaZi Reading →</a>
</div>`;
}

function buildZodiacFAQ(z, slug) {
  const qa = [
    { q: `What are the ${z.name} years?`, a: `${z.name} years include ${z.years.slice(0, 6).join(', ')} and continue in 12-year cycles. The most recent ${z.name} year was ${z.years[z.years.length - 2]}, and the next will be ${z.years[z.years.length - 1]}.` },
    { q: `What element is the ${z.name}?`, a: `The ${z.name}'s fixed element is ${z.element}. But your specific birth year adds a second layer — each ${z.name} year is also associated with one of the five elements (Wood, Fire, Earth, Metal, Water) that modifies how ${z.name} traits express themselves.` },
    { q: `Who is the ${z.name} most compatible with?`, a: `The ${z.name} finds the most natural harmony with ${z.compatibility.best.map(c => c.animal).join(', ')}. These signs share complementary energies and values. The most challenging matches tend to be ${z.compatibility.challenging.map(c => c.animal).join(', ')}.` },
    { q: `What is the ${z.name}'s luck in 2026?`, a: `${z.fortune2026.overall.substring(0, 150)}...` },
    { q: `What careers suit the ${z.name}?`, a: `${z.name}-year people tend to excel in ${z.career.slice(0, 3).map(c => c.field).join(', ')}, and related fields that reward their natural strengths.` },
    { q: `How does the ${z.name}'s element work in BaZi?`, a: `${z.elementDynamic}` }
  ];

  let html = '<div class="faq-section">';
  for (const item of qa) {
    html += `
    <div class="faq-item">
        <h3>${item.q}</h3>
        <p>${item.a}</p>
    </div>`;
  }
  html += '</div>';
  return html;
}

function buildDayMasterFAQ(d, slug) {
  const qa = [
    { q: `What does it mean to have a ${d.englishName} Day Master?`, a: `${d.personality.overview.substring(0, 200)}...` },
    { q: `What careers are best for ${d.englishName} Day Masters?`, a: `${d.englishName} Day Masters tend to find satisfaction in ${d.career.slice(0, 3).map(c => c.field).join(', ')}, and roles that allow them to express their ${d.element} nature fully.` },
    { q: `Who is the best partner for a ${d.englishName} Day Master?`, a: `${d.relationships.description.substring(0, 200)}...` },
    { q: `How does ${d.englishName} Day Master change with the seasons?`, a: `The ${d.englishName} Day Master's expression shifts significantly with the season of birth. ${d.seasonalNotes.spring.split('.')[0]}.` },
    { q: `What element dynamics affect ${d.englishName} Day Master?`, a: `${d.elementDynamics}` },
    { q: `What jewelry suits a ${d.englishName} Day Master?`, a: `${d.daoistJewelry}` }
  ];

  let html = '<div class="faq-section">';
  for (const item of qa) {
    html += `
    <div class="faq-item">
        <h3>${item.q}</h3>
        <p>${item.a}</p>
    </div>`;
  }
  html += '</div>';
  return html;
}

// ── Helpers ───────────────────────────────────────────────────────────

function getZodiacEmoji(slug) {
  const map = { rat: '🐀', ox: '🐂', tiger: '🐅', rabbit: '🐇', dragon: '🐉', snake: '🐍', horse: '🐎', goat: '🐐', monkey: '🐒', rooster: '🐓', dog: '🐕', pig: '🐖' };
  return map[slug] || '✨';
}

function getElementEmoji(element) {
  const map = { Wood: '🌳', Fire: '🔥', Earth: '🏔', Metal: '⚔', Water: '💧' };
  return map[element] || '✨';
}

function monthName(n) {
  const names = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
  return names[n] || `Month ${n}`;
}

module.exports = { buildZodiacPage, buildDayMasterPage };
