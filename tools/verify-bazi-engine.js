#!/usr/bin/env node
/**
 * Regression check for the BaZi calculation core (bazi_engine_v2.js).
 *
 * Run from the repository root:
 *   node tools/verify-bazi-engine.js
 *
 * No dependencies. The expected pillars and solar-term dates below are fixed
 * reference values taken from published Chinese almanac data (also cross-checked
 * against the lunar-javascript library). This guards the three accuracy fixes:
 *   1. the sexagenary day-cycle anchor,
 *   2. the December / early-January month boundary,
 *   3. solar-term dates expressed in China Standard Time.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
global.window = {};
vm.runInThisContext(
  fs.readFileSync(path.join(root, 'bazi_engine_v2.js'), 'utf8'),
  { filename: 'bazi_engine_v2.js' }
);

const E = global.window.BaziEngineV2;
const S = E.STEMS;
const B = E.BRANCHES;

let passed = 0;
let failed = 0;

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL  ${name}\n      expected ${e}\n      actual   ${a}`);
  }
}

function pillar(p) {
  return S[p.stemIndex] + B[p.branchIndex];
}

function chart(date, time) {
  const p = E.calculateProfile({ birthDate: date, birthTime: time, gender: 'male', lifeFocus: 'career' });
  return {
    year: pillar(p.pillars.year),
    month: pillar(p.pillars.month),
    day: pillar(p.pillars.day),
    hour: p.pillars.hour ? pillar(p.pillars.hour) : null,
  };
}

// ── 1. Full-chart reference cases ────────────────────────────────
const charts = [
  // date, time, [year, month, day, hour]
  ['1990-05-15', '14:30', ['GengWu', 'XinSi', 'GengChen', 'GuiWei']],
  ['2000-01-01', '12:00', ['JiMao', 'BingZi', 'WuWu', 'WuWu']],
  ['1984-02-02', '00:00', ['GuiHai', 'YiChou', 'BingYin', 'WuZi']],
  ['2024-02-04', '18:00', ['JiaChen', 'BingYin', 'WuXu', 'XinYou']],
];
for (const [date, time, expected] of charts) {
  const c = chart(date, time);
  check(`chart ${date} ${time}`, [c.year, c.month, c.day, c.hour], expected);
}

// ── 2. Day-cycle anchors (1984-01-31 is Jia Zi) ─────────────────
const dayAnchors = [
  ['1984-01-31', 'JiaZi'],
  ['1984-02-02', 'BingYin'],
  ['2000-01-01', 'WuWu'],
];
for (const [date, expected] of dayAnchors) {
  check(`day pillar ${date}`, chart(date, '12:00').day, expected);
}

// ── 3. December / early-January month boundaries ────────────────
// Both sides of Da Xue (Dec) and Xiao Han (Jan) must resolve to the
// Zi (index 10) and Chou (index 11) months respectively.
const monthBoundaries = [
  ['1990-01-03', 'BingZi'],
  ['1990-01-06', 'DingChou'],
  ['1990-12-31', 'WuZi'],
  ['2000-01-01', 'BingZi'],
  ['2026-01-04', 'WuZi'],
  ['2026-01-06', 'JiChou'],
];
for (const [date, expected] of monthBoundaries) {
  check(`month pillar ${date}`, chart(date, '12:00').month, expected);
}

// ── 4. Solar-term dates in China Standard Time ──────────────────
// Full 24-term table per year, [month, day].
const expectedTerms = {
  2024: [
    [2, 4], [2, 19], [3, 5], [3, 20], [4, 4], [4, 19], [5, 5], [5, 20],
    [6, 5], [6, 21], [7, 6], [7, 22], [8, 7], [8, 22], [9, 7], [9, 22],
    [10, 8], [10, 23], [11, 7], [11, 22], [12, 6], [12, 21], [1, 6], [1, 20],
  ],
  2025: [
    [2, 3], [2, 18], [3, 5], [3, 20], [4, 4], [4, 20], [5, 5], [5, 21],
    [6, 5], [6, 21], [7, 7], [7, 22], [8, 7], [8, 23], [9, 7], [9, 23],
    [10, 8], [10, 23], [11, 7], [11, 22], [12, 7], [12, 21], [1, 5], [1, 20],
  ],
  2026: [
    [2, 4], [2, 18], [3, 5], [3, 20], [4, 5], [4, 20], [5, 5], [5, 21],
    [6, 5], [6, 21], [7, 7], [7, 23], [8, 7], [8, 23], [9, 7], [9, 23],
    [10, 8], [10, 23], [11, 7], [11, 22], [12, 7], [12, 22], [1, 5], [1, 20],
  ],
};
for (const year of Object.keys(expectedTerms)) {
  const actual = expectedTerms[year].map((_, i) => E.getSolarTermDate(Number(year), i));
  check(`solar terms ${year}`, actual, expectedTerms[year]);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
