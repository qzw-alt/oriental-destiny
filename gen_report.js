const https = require('https');
const fs = require('fs');
const vm = require('vm');

global.window = {};
vm.runInThisContext(fs.readFileSync('bazi_engine_v2.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('report_engine_v2.js', 'utf8'));

const profile = window.BaziEngineV2.calculateProfile({
  birthDate: '1992-08-22', birthTime: '09:15',
  birthLocation: 'Shanghai', gender: 'female', lifeFocus: 'career'
});

const brief = window.buildCompactBrief(profile);
const engine = new window.ReportEngineV2({ proxyBaseURL: 'https://deepseek-proxy.qzwx10000.workers.dev' });

async function generate() {
  console.log('⏳ Generating BASIC report...');
  const basic = await engine.generateBasicReport(profile, 'career');
  console.log('   Basic:', basic.fallback ? 'FALLBACK' : 'OK', '| opening:', (basic.report?.opening||'').length, 'chars');

  console.log('⏳ Generating DELUXE (master annotations + jewelry)...');
  const deluxe = await engine.generateDeluxeReport(basic, profile, 'career');
  console.log('   Deluxe:', deluxe.fallback ? 'FALLBACK' : 'OK',
    '| annotations:', (deluxe.masterAnnotations||[]).length,
    '| jewelry:', deluxe.jewelryGuide ? 'YES' : 'NO');

  // Build HTML
  const html = buildDualHTML(basic.report, deluxe, brief, profile);
  fs.writeFileSync('sample_report.html', html);
  console.log('✅ sample_report.html written (' + (html.length/1024).toFixed(0) + ' KB)');
}

function buildDualHTML(basic, deluxe, brief, profile) {
  const sn = window.buildChartSnapshot(profile);
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const paras = text => {
    if (!text) return '';
    return String(text).split(/\n\n/).filter(Boolean)
      .map(pp => '<p>'+esc(pp).replace(/\n/g,'<br>')+'</p>').join('\n');
  };
  const items = arr => (arr||[]).map((a,i) => `
    <li class="pocket-item" style="animation-delay:${i*0.15}s">
      <span class="pocket-num">${i+1}</span>
      <span>${esc(a)}</span>
    </li>`).join('\n');

  // ── Pillars as traditional 八字 table ──
  const yr = sn.fourPillars.year.split(' · ');
  const mo = sn.fourPillars.month.split(' · ');
  const dy = sn.fourPillars.day.split(' · ');
  const hr = sn.fourPillars.hour.split(' · ');
  const pillarsHTML = `
    <div class="bazi-table">
      <div class="bazi-col"><span class="bazi-stem">${yr[0].slice(0,-2)}</span><span class="bazi-branch">${yr[0].slice(-2)}</span><span class="bazi-label">年柱 Year</span><span class="bazi-nayin">${yr[1]||''}</span></div>
      <div class="bazi-col"><span class="bazi-stem">${mo[0].slice(0,-2)}</span><span class="bazi-branch">${mo[0].slice(-2)}</span><span class="bazi-label">月柱 Month</span><span class="bazi-nayin">${mo[1]||''}</span></div>
      <div class="bazi-col day-master"><span class="bazi-stem">${dy[0].slice(0,-2)}</span><span class="bazi-branch">${dy[0].slice(-2)}</span><span class="bazi-label">日柱 Day</span><span class="bazi-dm">日主</span></div>
      <div class="bazi-col"><span class="bazi-stem">${hr[0].slice(0,-2)}</span><span class="bazi-branch">${hr[0].slice(-2)}</span><span class="bazi-label">时柱 Hour</span><span class="bazi-nayin">${hr[1]||''}</span></div>
    </div>`;

  // ── Master annotations as "天机" scrolls ──
  const annotationsHTML = (deluxe.masterAnnotations||[]).map((a, i) => `
    <div class="tianji-scroll" style="animation-delay:${i*0.25}s">
      <div class="tianji-header">
        <span class="tianji-seal">天机</span>
        <span class="tianji-num">第${['一','二','三','四','五'][i]||(i+1)}道</span>
      </div>
      <h3>${esc(a.title)}</h3>
      <div class="tianji-body">${esc(a.insight)}</div>
    </div>
  `).join('\n');

  // ── Jewelry as "灵石" cards ──
  const jg = deluxe.jewelryGuide;
  const jewelryHTML = jg ? `
    <div class="crystal-reveal">
      <div class="crystal-grid">
        <div class="crystal-card primary">
          <div class="crystal-badge">本命灵石</div>
          <div class="crystal-stone">${esc(jg.primaryCrystal?.name || '')}</div>
          <span class="crystal-element el">${esc(jg.primaryCrystal?.element || '')} 元素</span>
          <p class="crystal-why">${esc(jg.primaryCrystal?.whyForThisChart || '')}</p>
          <p class="crystal-wear">${esc(jg.primaryCrystal?.wearingGuidance || '')}</p>
        </div>
        <div class="crystal-card secondary">
          <div class="crystal-badge sec">护法灵玉</div>
          <div class="crystal-stone">${esc(jg.secondaryCrystal?.name || '')}</div>
          <span class="crystal-element el">${esc(jg.secondaryCrystal?.element || '')} 元素</span>
          <p class="crystal-why">${esc(jg.secondaryCrystal?.whyForThisChart || '')}</p>
          <p class="crystal-wear">${esc(jg.secondaryCrystal?.wearingGuidance || '')}</p>
        </div>
      </div>
      <div class="crystal-master-note">
        <p class="master-words">${esc(jg.masterNote || '')}</p>
        <p class="crystal-avoid">⚠ ${esc(jg.whatToAvoid || '')}</p>
      </div>
    </div>
  ` : '';

  // ── Element distribution bars ──
  const elCounts = profile.elementCounts || {};
  const elNames = ['Wood','Fire','Earth','Metal','Water'];
  const elChinese = {Wood:'木',Fire:'火',Earth:'土',Metal:'金',Water:'水'};
  const elColors = {Wood:'#4a7c59',Fire:'#b5342a',Earth:'#c9a24e',Metal:'#8a8a8a',Water:'#2c3e6b'};
  const maxCount = Math.max(1, ...elNames.map(e => elCounts[e]||0));
  const elBarsHTML = elNames.map(e => {
    const pct = Math.round(((elCounts[e]||0) / maxCount) * 100);
    return `<div class="el-bar-row">
      <span class="el-bar-label">${elChinese[e]} ${e}</span>
      <span class="el-bar-track"><span class="el-bar-fill" style="width:${pct}%;background:${elColors[e]}"></span></span>
      <span class="el-bar-val">${(elCounts[e]||0).toFixed(1)}</span>
    </div>`;
  }).join('\n');

  // ── Key tags ──
  const tagsHTML = `
    <span class="chip gold">${sn.pattern}</span>
    <span class="chip gold">用神: ${sn.yongShen}</span>
    <span class="chip gold">喜神: ${sn.xiShen}</span>
    <span class="chip red">忌神: ${sn.jiShen}</span>
    <span class="chip green">${sn.strength}</span>`;

  return `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>天命书 · ${profile.dayMaster}${profile.dayMasterElement}命主 — Oriental Destiny</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=Noto+Sans+SC:wght@400;500&display=swap" rel="stylesheet">
<style>
/* ══════════════════════════════════════════════════════════
   水墨风 · Ink Wash Destiny Scroll
   天命书 — Oriental Destiny Report System
   ══════════════════════════════════════════════════════════ */
:root {
  --ink: #1a1410;
  --ink-light: rgba(26,20,16,0.65);
  --ink-faint: rgba(26,20,16,0.35);
  --cinnabar: #b5342a;
  --cinnabar-deep: #8b1a14;
  --gold: #c9a24e;
  --gold-light: rgba(201,162,78,0.2);
  --gold-faint: rgba(201,162,78,0.08);
  --cream: #f5f0e8;
  --cream-dark: #ebe3d7;
  --paper: #faf7f1;
  --white: #fffdf8;
  --shadow-sm: 0 4px 20px rgba(26,20,16,0.06);
  --shadow: 0 12px 40px rgba(26,20,16,0.10);
  --shadow-lg: 0 24px 64px rgba(26,20,16,0.14);
  --radius: 8px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

body {
  font-family: 'Noto Serif SC', Georgia, 'STSong', 'SimSun', 'PingFang SC', serif;
  color: var(--ink);
  background:
    radial-gradient(ellipse at 25% 8%, rgba(201,162,78,0.10) 0%, transparent 55%),
    radial-gradient(ellipse at 72% 92%, rgba(181,52,42,0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(26,20,16,0.015) 0%, transparent 70%),
    linear-gradient(180deg, #f7f2e9 0%, var(--cream) 28%, var(--paper) 62%, #f5efe6 100%);
  line-height: 1.82;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── Scroll progress bar ── */
.scroll-track {
  position: fixed; top: 0; left: 0; width: 100%; height: 3px; z-index: 9999;
  background: transparent; pointer-events: none;
}
.scroll-track .fill {
  height: 100%; background: linear-gradient(90deg, var(--cinnabar), var(--gold), var(--cinnabar));
  width: 0%; transition: width 0.15s linear;
}

.container { max-width: 780px; margin: 0 auto; padding: 0 22px; }

/* ══════════════════════════════════════════════════════════
   CHAPTER SYSTEM
   ══════════════════════════════════════════════════════════ */
.chapter {
  position: relative;
  margin-bottom: 24px;
  padding: 44px 0 20px;
  opacity: 0; transform: translateY(36px);
  animation: chapterEnter 0.9s cubic-bezier(0.22,0.61,0.36,1) forwards;
}
.chapter:nth-child(1){animation-delay:0s}
.chapter:nth-child(2){animation-delay:0.15s}
.chapter:nth-child(3){animation-delay:0.3s}
.chapter:nth-child(4){animation-delay:0.45s}
.chapter:nth-child(5){animation-delay:0.6s}
.chapter:nth-child(6){animation-delay:0.75s}
.chapter:nth-child(7){animation-delay:0.9s}
.chapter:nth-child(8){animation-delay:1.05s}
.chapter:nth-child(9){animation-delay:1.2s}
.chapter:nth-child(10){animation-delay:1.35s}

@keyframes chapterEnter {
  from { opacity: 0; transform: translateY(36px); }
  to   { opacity: 1; transform: translateY(0); }
}

.chapter-marker {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 28px;
}
.chapter-marker .vol {
  font-size: 12px; letter-spacing: 0.2em;
  color: var(--cinnabar); font-weight: 700;
  writing-mode: vertical-rl;
  background: rgba(181,52,42,0.06);
  padding: 10px 6px; border-radius: 2px;
}
.chapter-marker .title-cn {
  font-size: 26px; font-weight: 900; color: var(--ink);
  letter-spacing: 0.04em;
}
.chapter-marker .title-en {
  font-size: 11px; color: var(--ink-faint);
  text-transform: uppercase; letter-spacing: 0.1em;
  margin-left: 6px; align-self: flex-end;
  padding-bottom: 2px;
}

/* ══════════════════════════════════════════════════════════
   HERO / COVER
   ══════════════════════════════════════════════════════════ */
.hero-cover {
  text-align: center;
  padding: 60px 0 50px;
  margin-bottom: 10px;
}
.seal-anim {
  display: inline-block;
  animation: sealStamp 1s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes sealStamp {
  0%   { transform: scale(2.8) rotate(-25deg); opacity: 0; }
  60%  { transform: scale(0.92) rotate(3deg); opacity: 1; }
  80%  { transform: scale(1.06) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.seal-inner {
  display: inline-block;
  width: 72px; height: 72px;
  border: 2.5px solid var(--cinnabar);
  border-radius: 4px;
  color: var(--cinnabar);
  font-size: 13px; font-weight: 900;
  line-height: 1.3; letter-spacing: 0.12em;
  display: flex; align-items: center; justify-content: center;
  writing-mode: vertical-rl;
  text-orientation: upright;
}
.hero-title {
  font-size: clamp(30px, 6vw, 48px);
  font-weight: 900;
  line-height: 1.25;
  margin: 24px 0 12px;
  letter-spacing: 0.03em;
}
.hero-title .em {
  color: var(--cinnabar);
  position: relative;
}
.hero-title .em::after {
  content: '';
  position: absolute; bottom: 2px; left: 0; right: 0;
  height: 6px;
  background: rgba(201,162,78,0.35);
  border-radius: 3px;
  z-index: -1;
}
.hero-sub {
  font-size: 16px; color: var(--ink-light);
  margin-bottom: 32px;
  letter-spacing: 0.04em;
}
.hero-divider {
  width: 80px; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  margin: 0 auto 10px;
}
.hero-badge {
  display: inline-block;
  padding: 7px 22px;
  border-radius: 20px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em;
  background: linear-gradient(135deg, var(--cinnabar), var(--cinnabar-deep));
  color: #fff;
  box-shadow: 0 4px 16px rgba(181,52,42,0.25);
}

/* ══════════════════════════════════════════════════════════
   BAZI CHART TABLE — ancient almanac style
   ══════════════════════════════════════════════════════════ */
.chart-card {
  background: var(--white);
  border-radius: 12px;
  padding: 32px 24px 24px;
  box-shadow: var(--shadow);
  border: 1px solid rgba(26,20,16,0.06);
  margin-bottom: 24px;
}
.chart-card .chart-title {
  font-size: 13px; letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint); text-align: center;
  margin-bottom: 24px;
}
.bazi-table {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  margin-bottom: 20px;
}
.bazi-col {
  text-align: center;
  padding: 18px 8px 14px;
  background: linear-gradient(180deg, rgba(201,162,78,0.04) 0%, transparent 100%);
  border-radius: 8px;
  position: relative;
  transition: transform 0.25s, box-shadow 0.25s;
}
.bazi-col:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(26,20,16,0.08);
}
.bazi-col.day-master {
  background: linear-gradient(180deg, rgba(201,162,78,0.12) 0%, rgba(201,162,78,0.02) 100%);
  border: 1.5px solid var(--gold-light);
}
.bazi-stem {
  display: block; font-size: 28px; font-weight: 900;
  color: var(--ink); letter-spacing: 0.04em;
}
.bazi-branch {
  display: block; font-size: 22px; font-weight: 700;
  color: var(--ink-light); margin-top: 2px;
}
.bazi-label {
  display: block; font-size: 10px; color: var(--ink-faint);
  margin-top: 8px; letter-spacing: 0.06em;
}
.bazi-nayin {
  display: block; font-size: 9px; color: var(--gold);
  margin-top: 2px; letter-spacing: 0.04em;
}
.bazi-dm {
  display: inline-block; margin-top: 4px;
  padding: 2px 8px; border-radius: 3px;
  background: var(--cinnabar); color: #fff;
  font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
}

/* ── Tags row ── */
.chip-row {
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
  margin-top: 4px;
}
.chip {
  display: inline-block; font-size: 10.5px; padding: 5px 13px;
  border-radius: 14px; font-weight: 600; letter-spacing: 0.04em;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.chip.gold { background: var(--gold-faint); color: #8a6d2f; }
.chip.red  { background: rgba(181,52,42,0.07); color: var(--cinnabar); }
.chip.green{ background: rgba(49,82,71,0.07); color: #315247; }

.shensha-line {
  font-size: 11px; color: var(--ink-faint);
  text-align: center; margin-top: 14px;
  letter-spacing: 0.03em;
}

/* ── Element bars ── */
.el-bars {
  margin-top: 18px; padding: 0 4px;
}
.el-bar-row {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 6px;
}
.el-bar-label {
  font-size: 11px; width: 80px; text-align: right;
  color: var(--ink-light); letter-spacing: 0.04em;
  font-family: 'Noto Sans SC', sans-serif;
}
.el-bar-track {
  flex: 1; height: 8px;
  background: rgba(26,20,16,0.06);
  border-radius: 4px; overflow: hidden;
}
.el-bar-fill {
  display: block; height: 100%; border-radius: 4px;
  transition: width 1.2s cubic-bezier(0.22,0.61,0.36,1);
}
.el-bar-val {
  font-size: 11px; width: 32px;
  color: var(--ink-faint);
  font-family: 'Noto Sans SC', sans-serif;
}

/* ══════════════════════════════════════════════════════════
   CONTENT CARDS
   ══════════════════════════════════════════════════════════ */
.content-card {
  background: var(--white);
  border-radius: 12px;
  padding: 36px 38px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(26,20,16,0.05);
  margin-bottom: 0;
}
.content-card p {
  font-size: 15px; margin-bottom: 16px;
  line-height: 1.9; color: var(--ink-light);
}
.content-card p:last-child { margin-bottom: 0; }
.content-card p strong, .content-card p b {
  color: var(--ink); font-weight: 700;
}

.content-card.guides {
  border-left: 4px solid var(--gold);
  background: linear-gradient(135deg, var(--white) 0%, #fdf9f0 100%);
}
.content-card.closing-card {
  text-align: center;
  background: linear-gradient(180deg, #fdfaf3 0%, #f8f2e5 100%);
  border: 1px solid var(--gold-light);
}
.content-card.closing-card p {
  font-style: italic; font-size: 17px; line-height: 2;
  color: var(--ink-light);
}

/* ══════════════════════════════════════════════════════════
   PRACTICAL POCKET ITEMS
   ══════════════════════════════════════════════════════════ */
.pocket-list {
  list-style: none; padding: 0;
  display: grid; gap: 14px;
}
.pocket-item {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(201,162,78,0.04) 0%, transparent 100%);
  border-radius: 10px;
  border: 1px solid rgba(26,20,16,0.04);
  animation: pocketIn 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
  font-size: 14px; line-height: 1.75; color: var(--ink-light);
  transition: transform 0.2s, box-shadow 0.2s;
}
.pocket-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(26,20,16,0.05);
}
@keyframes pocketIn {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
.pocket-num {
  flex-shrink: 0;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--cinnabar);
  color: #fff;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Noto Sans SC', sans-serif;
}

/* ══════════════════════════════════════════════════════════
   天机 SCROLLS — Master Annotations
   ══════════════════════════════════════════════════════════ */
.tianji-scroll {
  background: linear-gradient(160deg, #fdfaf3 0%, #f7f1e2 100%);
  border: 1px solid var(--gold-light);
  border-left: 4px solid var(--gold);
  border-radius: 10px;
  padding: 26px 28px;
  margin-bottom: 18px;
  animation: tianjiIn 0.6s cubic-bezier(0.22,0.61,0.36,1) both;
  position: relative;
  overflow: hidden;
}
.tianji-scroll::after {
  content: ''; position: absolute;
  top: -40px; right: -40px;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(201,162,78,0.06) 0%, transparent 70%);
  border-radius: 50%;
}
@keyframes tianjiIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.tianji-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
}
.tianji-seal {
  display: inline-block;
  width: 38px; height: 38px;
  border: 2px solid var(--cinnabar);
  border-radius: 3px;
  color: var(--cinnabar);
  font-size: 10px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  writing-mode: vertical-rl; letter-spacing: 0.08em;
}
.tianji-num {
  font-size: 11px; color: var(--ink-faint);
  letter-spacing: 0.08em;
  font-family: 'Noto Sans SC', sans-serif;
}
.tianji-scroll h3 {
  font-size: 18px; color: var(--cinnabar);
  margin-bottom: 10px; font-weight: 700;
  letter-spacing: 0.03em;
}
.tianji-body {
  font-size: 14px; line-height: 1.85; color: var(--ink-light);
}

/* ══════════════════════════════════════════════════════════
   灵石 CRYSTAL CARDS
   ══════════════════════════════════════════════════════════ */
.crystal-reveal {
  padding: 0;
}
.crystal-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 18px; margin-bottom: 20px;
}
@media(max-width:560px){ .crystal-grid{grid-template-columns:1fr} }
.crystal-card {
  background: var(--white);
  border-radius: 12px; padding: 28px 22px 22px;
  box-shadow: var(--shadow-sm);
  position: relative;
  border: 1px solid rgba(26,20,16,0.05);
  text-align: center;
  transition: transform 0.25s, box-shadow 0.25s;
}
.crystal-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
.crystal-card.primary { border-top: 3px solid var(--cinnabar); }
.crystal-card.secondary { border-top: 3px solid var(--gold); }
.crystal-badge {
  display: inline-block; padding: 5px 16px;
  border-radius: 14px; font-size: 10px; font-weight: 700;
  letter-spacing: 0.08em; margin-bottom: 12px;
  font-family: 'Noto Sans SC', sans-serif;
}
.crystal-badge { background: var(--cinnabar); color: #fff; }
.crystal-badge.sec { background: var(--gold); color: #fff; }
.crystal-stone {
  font-size: 22px; font-weight: 900; color: var(--ink);
  margin-bottom: 6px; letter-spacing: 0.04em;
}
.crystal-element {
  display: inline-block; font-size: 10px; padding: 3px 12px;
  border-radius: 10px; font-weight: 600; margin-bottom: 14px;
  font-family: 'Noto Sans SC', sans-serif;
}
.crystal-element.el { background: var(--gold-faint); color: #8a6d2f; }
.crystal-why {
  font-size: 13.5px; line-height: 1.75; color: var(--ink-light);
  margin-bottom: 12px; text-align: left;
}
.crystal-wear {
  font-size: 12px; line-height: 1.7; color: #315247;
  font-style: italic; text-align: left;
  padding-top: 10px; border-top: 1px solid rgba(26,20,16,0.06);
}
.crystal-master-note {
  background: linear-gradient(160deg, #fdfaf3 0%, #f7f1e2 100%);
  border-radius: 10px; padding: 22px 26px;
  border: 1px solid var(--gold-light);
}
.master-words {
  font-size: 14px; line-height: 1.85; color: var(--ink-light);
  font-style: italic; margin-bottom: 12px;
}
.crystal-avoid {
  font-size: 12px; color: var(--cinnabar);
  font-family: 'Noto Sans SC', sans-serif;
}

/* ══════════════════════════════════════════════════════════
   DIVIDERS
   ══════════════════════════════════════════════════════════ */
.section-divider {
  text-align: center; margin: 36px 0 18px;
  padding: 20px 0;
}
.section-divider .diamond {
  display: inline-block;
  width: 10px; height: 10px;
  background: var(--gold);
  transform: rotate(45deg);
  border-radius: 1px;
  margin: 0 10px;
  opacity: 0.7;
}
.section-divider .line-h {
  display: inline-block;
  width: 50px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  vertical-align: middle;
  margin: 0 6px;
}

/* ══════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════ */
footer {
  text-align: center; padding: 36px 20px 28px;
  font-size: 11.5px; color: var(--ink-faint);
  border-top: 1px solid rgba(26,20,16,0.06);
  margin-top: 32px; line-height: 2;
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  letter-spacing: 0.03em;
}
footer .foot-seal {
  display: inline-block;
  width: 44px; height: 44px;
  border: 2px solid var(--cinnabar);
  border-radius: 3px;
  color: var(--cinnabar);
  font-size: 10px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px;
  writing-mode: vertical-rl;
  opacity: 0.6;
}

@media(max-width:600px){
  .container { padding: 0 14px; }
  .hero-cover { padding: 36px 0 30px; }
  .bazi-table { grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .bazi-stem { font-size: 24px; }
  .bazi-branch { font-size: 18px; }
  .content-card { padding: 26px 20px; }
  .tianji-scroll { padding: 20px 18px; }
  .chapter-marker .title-cn { font-size: 22px; }
  .el-bar-label { width: 56px; font-size: 10px; }
}
</style>
</head>
<body>

<!-- Scroll progress -->
<div class="scroll-track"><div class="fill" id="scrollFill"></div></div>

<div class="container">

<!-- ═══════════════════════════════════════════════════════
     COVER · 封面
     ═══════════════════════════════════════════════════════ -->
<section class="chapter hero-cover">
  <div class="seal-anim">
    <div class="seal-inner">天命</div>
  </div>
  <h1 class="hero-title">
    ${esc(profile.dayMaster)}<span class="em">${esc(profile.dayMasterElement)}</span>命主
  </h1>
  <p class="hero-sub">
    ${esc(profile.pillars.month.branch)}月 · ${esc(profile.season)} · ${esc(sn.pattern)}
  </p>
  <div class="hero-divider"></div>
  <div class="hero-badge">✦ 天命书 · 八字命理解读</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     CHART CARD · 命盘
     ═══════════════════════════════════════════════════════ -->
<section class="chapter">
  <div class="content-card chart-card">
    <div class="chart-title">命盘总览 Chart Overview</div>
    ${pillarsHTML}
    <div class="chip-row">${tagsHTML}</div>
    <div class="shensha-line">
      神煞: ${esc(sn.shenSha)} · 起运: ${esc(sn.qiYun)} · 大运: ${esc(sn.currentDaYun)}
    </div>
    <div class="el-bars">${elBarsHTML}</div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════
     VOL 1 · 命主画像
     ═══════════════════════════════════════════════════════ -->
<section class="chapter">
  <div class="chapter-marker">
    <span class="vol">卷一</span>
    <span class="title-cn">命主画像</span>
    <span class="title-en">Who You Are</span>
  </div>
  <div class="content-card">
    ${paras(basic.opening || basic.report?.opening)}
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════
     VOL 2 · 格局解密
     ═══════════════════════════════════════════════════════ -->
<section class="chapter">
  <div class="chapter-marker">
    <span class="vol">卷二</span>
    <span class="title-cn">格局解密</span>
    <span class="title-en">Your Pattern</span>
  </div>
  <div class="content-card">
    ${paras(basic.yourPattern || basic.report?.yourPattern || basic.report?.thePattern)}
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════
     VOL 3 · 天命所向
     ═══════════════════════════════════════════════════════ -->
<section class="chapter">
  <div class="chapter-marker">
    <span class="vol">卷三</span>
    <span class="title-cn">天命所向</span>
    <span class="title-en">Your Compass</span>
  </div>
  <div class="content-card guides">
    ${paras(basic.whatGuidesYou || basic.report?.whatGuidesYou || basic.report?.whatHelps)}
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════
     VOL 4 · 行事锦囊
     ═══════════════════════════════════════════════════════ -->
<section class="chapter">
  <div class="chapter-marker">
    <span class="vol">卷四</span>
    <span class="title-cn">行事锦囊</span>
    <span class="title-en">In Practice</span>
  </div>
  <div class="content-card">
    <ul class="pocket-list">
      ${items(basic.practicalSteps || basic.report?.practicalSteps || basic.report?.whatToDo)}
    </ul>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════
     VOL 5 · 大师批注
     ═══════════════════════════════════════════════════════ -->
${annotationsHTML ? `
<section class="chapter">
  <div class="chapter-marker">
    <span class="vol">卷五</span>
    <span class="title-cn">大师批注</span>
    <span class="title-en">Master Annotations</span>
  </div>
  ${annotationsHTML}
</section>` : ''}

<!-- ═══════════════════════════════════════════════════════
     VOL 6 · 护身灵石
     ═══════════════════════════════════════════════════════ -->
${jewelryHTML ? `
<section class="chapter">
  <div class="chapter-marker">
    <span class="vol">卷六</span>
    <span class="title-cn">护身灵石</span>
    <span class="title-en">Crystal Guide</span>
  </div>
  <div class="content-card">
    ${jewelryHTML}
  </div>
</section>` : ''}

<!-- ═══════════════════════════════════════════════════════
     CLOSING · 封底
     ═══════════════════════════════════════════════════════ -->
<section class="chapter">
  <div class="content-card closing-card">
    ${paras(basic.closingWords || basic.report?.closingWords || basic.report?.closing)}
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════════════ -->
<footer>
  <div class="foot-seal">天命</div>
  Oriental Destiny · 七层古典子平法命理引擎<br>
  基础命书（即时生成）+ 大师批注 + 灵石指南<br>
  本报告旨在描述命理元素格局与自然趋势——并非未来事件之预言
</footer>

</div>

<!-- Scroll progress script -->
<script>
(function(){
  var fill = document.getElementById('scrollFill');
  function onScroll(){
    var h = document.documentElement;
    var pct = h.scrollHeight > h.clientHeight
      ? Math.round((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100)
      : 0;
    fill.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
</script>
</body>
</html>`;
}

generate().catch(e => { console.error(e); process.exit(1); });
