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
const engine = new window.ReportEngineV2({ apiKey: 'sk-354f5dc8aace46c2a8c29c0d1771297f' });

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
  const paras = text => String(text||'').split(/\n\n/).filter(Boolean).map(pp => '<p>'+esc(pp).replace(/\n/g,'<br>')+'</p>').join('\n');
  const items = arr => (arr||[]).map(a => '<li>'+esc(a)+'</li>').join('\n');

  const annotationsHTML = (deluxe.masterAnnotations||[]).map(a => `
    <div class="master-note">
      <div class="master-label">✦ Master's Note</div>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.insight)}</p>
    </div>
  `).join('\n');

  const jg = deluxe.jewelryGuide;
  const jewelryHTML = jg ? `
    <div class="jewelry-section">
      <div class="master-label">✦ Curated for Your Elements</div>
      <div class="jewelry-grid">
        <div class="jewelry-card">
          <div class="jewelry-badge primary">Primary</div>
          <h4>${esc(jg.primaryCrystal?.name || '')}</h4>
          <span class="tag el">${esc(jg.primaryCrystal?.element || '')}</span>
          <p>${esc(jg.primaryCrystal?.whyForThisChart || '')}</p>
          <p class="wear-note">${esc(jg.primaryCrystal?.wearingGuidance || '')}</p>
        </div>
        <div class="jewelry-card">
          <div class="jewelry-badge secondary">Secondary</div>
          <h4>${esc(jg.secondaryCrystal?.name || '')}</h4>
          <span class="tag el">${esc(jg.secondaryCrystal?.element || '')}</span>
          <p>${esc(jg.secondaryCrystal?.whyForThisChart || '')}</p>
          <p class="wear-note">${esc(jg.secondaryCrystal?.wearingGuidance || '')}</p>
        </div>
      </div>
      <div class="master-note">
        <p><em>${esc(jg.masterNote || '')}</em></p>
        <p class="avoid-note">${esc(jg.whatToAvoid || '')}</p>
      </div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Deluxe BaZi Reading — ${profile.dayMaster} ${profile.dayMasterElement} Day Master</title>
<style>
:root{--ink:#241915;--paper:#f8f1e7;--cinnabar:#a63a2c;--gold:#b78a42;--pine:#315247;--line:rgba(36,25,21,0.1);--shadow:0 18px 48px rgba(70,41,24,0.12)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,"Times New Roman",serif;color:var(--ink);background:radial-gradient(circle at top,rgba(183,138,66,0.14),transparent 34%),linear-gradient(180deg,#f5e7d6 0%,var(--paper) 42%,#fbf7f1 100%);line-height:1.72;min-height:100vh}
.container{max-width:800px;margin:0 auto;padding:40px 20px}
.header{text-align:center;margin-bottom:40px;padding-top:20px}
.header .brand{font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:var(--cinnabar);margin-bottom:8px}
.header h1{font-size:clamp(28px,5vw,42px);font-weight:700;line-height:1.2}
.header h1 span{color:var(--cinnabar)}
.header .sub{font-size:15px;color:rgba(36,25,21,0.5);margin-top:8px}
.header .tier-badge{display:inline-block;margin-top:12px;padding:6px 18px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.08em;background:linear-gradient(135deg,var(--gold),#c99a52);color:#fff}

.hdata{background:#fff;border-radius:12px;padding:32px 36px;box-shadow:0 8px 24px rgba(70,41,24,0.06);margin-bottom:30px}
.hdata h2{font-size:14px;margin-bottom:16px;color:var(--cinnabar);letter-spacing:0.08em;text-transform:uppercase}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:16px}
.metric{background:var(--paper);border-radius:8px;padding:14px;text-align:center}
.metric .val{font-size:24px;font-weight:700;color:var(--pine)}
.metric .lbl{font-size:10px;color:rgba(36,25,21,0.45);margin-top:2px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.tag{display:inline-block;font-size:11px;padding:4px 12px;border-radius:12px;font-weight:600;letter-spacing:0.03em}
.tag.el{background:rgba(183,138,66,0.1);color:var(--gold)}
.tag.wa{background:rgba(166,58,44,0.08);color:var(--cinnabar)}
.tag.ok{background:rgba(49,82,71,0.08);color:var(--pine)}
.shensha{font-size:11px;color:rgba(36,25,21,0.35);margin-top:6px}

.section-divider{text-align:center;margin:40px 0 24px}
.section-divider .line{width:60px;height:3px;background:var(--gold);margin:0 auto 12px;border-radius:2px}
.section-divider .title{font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:var(--gold);font-weight:600}

.card{background:#fff;border-radius:12px;padding:36px;box-shadow:var(--shadow);margin-bottom:24px}
.card h2{font-size:20px;margin-bottom:18px}
.card p{font-size:15px;margin-bottom:14px;line-height:1.85;color:rgba(36,25,21,0.82)}
.card ul{list-style:none;padding:0}
.card li{margin-bottom:12px;padding-left:20px;position:relative;font-size:15px;line-height:1.7;color:rgba(36,25,21,0.82)}
.card li::before{content:'•';position:absolute;left:0;color:var(--gold);font-weight:bold}
.helps{border-left:4px solid var(--pine)}
.closing{text-align:center;background:linear-gradient(135deg,#faf5ed 0%,#f5ede0 100%)}

.master-note{background:linear-gradient(135deg,#fdfaf5 0%,#f7efe0 100%);border-radius:10px;padding:24px 28px;margin-bottom:18px;border-left:3px solid var(--gold)}
.master-label{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:8px}
.master-note h3{font-size:17px;color:var(--cinnabar);margin-bottom:10px}
.master-note p{font-size:14px;line-height:1.8;color:rgba(36,25,21,0.78);margin-bottom:0}

.jewelry-section{margin-top:24px}
.jewelry-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
@media(max-width:600px){.jewelry-grid{grid-template-columns:1fr}}
.jewelry-card{background:#fff;border-radius:10px;padding:24px;box-shadow:0 4px 16px rgba(70,41,24,0.06);position:relative}
.jewelry-badge{position:absolute;top:-8px;right:16px;padding:4px 14px;border-radius:12px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase}
.jewelry-badge.primary{background:var(--cinnabar);color:#fff}
.jewelry-badge.secondary{background:var(--pine);color:#fff}
.jewelry-card h4{font-size:17px;margin:8px 0 10px}
.jewelry-card p{font-size:13px;color:rgba(36,25,21,0.7);line-height:1.7;margin-bottom:10px}
.wear-note{font-size:12px!important;color:var(--pine)!important;font-style:italic}
.avoid-note{font-size:12px;color:var(--cinnabar);margin-top:8px}

.report-label{display:inline-block;margin-bottom:8px;padding:3px 14px;border-radius:12px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700}
.report-label.basic{background:rgba(49,82,71,0.1);color:var(--pine)}
.report-label.deluxe{background:rgba(183,138,66,0.12);color:var(--gold)}

footer{text-align:center;padding:40px 20px;font-size:12px;color:rgba(36,25,21,0.4);border-top:1px solid var(--line);margin-top:20px;line-height:1.8}
</style>
</head>
<body>
<div class="container">

<div class="header">
<div class="brand">Oriental Destiny · Deluxe BaZi Reading</div>
<h1>Your <span>Elemental</span> Blueprint</h1>
<div class="sub">${profile.dayMaster} ${profile.dayMasterElement} Day Master · ${profile.pillars.month.branch} Month · ${profile.season}</div>
<div class="tier-badge">✦ DELUXE REPORT</div>
</div>

<div class="hdata">
<h2>Your Chart at a Glance</h2>
<div class="metrics">
<div class="metric"><div class="val">${sn.fourPillars.year.split(' · ')[0]}</div><div class="lbl">Year · ${sn.fourPillars.year.split(' · ')[1]}</div></div>
<div class="metric"><div class="val">${sn.fourPillars.month.split(' · ')[0]}</div><div class="lbl">Month · ${sn.fourPillars.month.split(' · ')[2]}</div></div>
<div class="metric"><div class="val">${sn.fourPillars.day.split(' · ')[0]}</div><div class="lbl">Day · Day Master</div></div>
<div class="metric"><div class="val">${sn.fourPillars.hour.split(' · ')[0]}</div><div class="lbl">Hour</div></div>
</div>
<div class="tags">
<span class="tag el">${sn.pattern}</span>
<span class="tag el">Yong Shen: ${sn.yongShen}</span>
<span class="tag el">Xi Shen: ${sn.xiShen}</span>
<span class="tag wa">Ji Shen: ${sn.jiShen}</span>
<span class="tag ok">${sn.strength}</span>
</div>
<div class="shensha">${sn.shenSha} · Qi Yun: age ${sn.qiYun} · Current Da Yun: ${sn.currentDaYun}</div>
</div>

<!-- ═══ BASIC REPORT ═══ -->
<div class="card"><span class="report-label basic">Your Reading</span><h2>🔮 Who You Are</h2>${paras(basic.opening)}</div>
<div class="card"><h2>🌿 Your Elemental Pattern</h2>${paras(basic.yourPattern)}</div>
<div class="card helps"><h2>✨ What Guides You</h2>${paras(basic.whatGuidesYou)}</div>
<div class="card"><h2>🎯 In Practice</h2><ul>${items(basic.practicalSteps)}</ul></div>
<div class="card closing"><p style="font-style:italic;font-size:16px;line-height:1.9">${esc(basic.closingWords).replace(/\n/g,'<br>')}</p></div>

<!-- ═══ DELUXE: MASTER ANNOTATIONS ═══ -->
<div class="section-divider"><div class="line"></div><div class="title">✦ Master Annotations</div></div>
${annotationsHTML}

<!-- ═══ DELUXE: JEWELRY GUIDE ═══ -->
${jewelryHTML ? `<div class="section-divider"><div class="line"></div><div class="title">✦ Crystal & Jewelry Guide</div></div><div class="card">${jewelryHTML}</div>` : ''}

<footer>
Generated by Oriental Destiny · Seven-Layer Classical Zi Ping Engine<br>
Basic Report (instant) + Master Annotations + Crystal Guide (deluxe)<br>
This report describes elemental patterns and tendencies — it is not a prediction of future events.
</footer>

</div>
</body>
</html>`;
}

generate().catch(e => { console.error(e); process.exit(1); });
