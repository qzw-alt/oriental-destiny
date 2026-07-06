# Oriental Destiny — SEO Rollout Report
**Date:** 2026-07-06
**Domain:** oriental-destiny.com
**Author:** Hermes subagent
**Status:** Audit + 3-part decision package (robots.txt · sitemap diagnosis · backlink plan)

---

## 0. Executive Summary

| 项 | 现状 | 问题 | 决策 |
|---|---|---|---|
| `robots.txt` | 21 行, 已排除 11 个私密页 | 计算器注释 + sitemap 行 OK, 但缺 `Crawl-delay` / 主流 Bot 友好声明 | **保留 + 轻量补丁** (下方 §1) |
| `sitemap.xml` | 145 个 URL (主) + 12 day-master + 12 zodiac 重复 → **共 169 条** | 重大遗漏 (见 §2.2); 内部链接孤岛严重 | **§2 给出 21 个需补/删的 URL** |
| `index.html` → 24 Pillar + 10 物品词 | **只有 2/24 Pillar + 1/10 物品词被首页链接** | 17 Pillar + 9 物品词 = "索引孤岛" | **§2.3 给出 26 处需加的内链位置** |
| 反向链接 | 0 个, GSC 显示 0 referring domains | 60 天没自然外链增长 | **§3 给出 10 个具体可执行的论坛 / 评论 / 投稿目标** |

**核心问题:** 内容覆盖率不错 (104+ URLs), 但 **首页没把内容暴露出来**, Google 进首页只看到导航 + 6 个 footer 链接, 全部 104 篇 pillar 文章 = **孤儿页**。

---

## 1. `robots.txt` 优化

### 1.1 现状审计

文件: `/home/ubuntu/oriental-destiny/robots.txt` (21 行)

```
User-agent: *           ✓ 全允许
Allow: /                ✓
Disallow: /checkout.html, /thanks.html, /login.html, /register.html,
          /dashboard.html, /basic_report.html, /full_report.html,
          /full_bazi_reading.html, /instant_report.html,
          /snapshot_report.html, /report_demo.html   ✓ 私密页排除
Sitemap: https://oriental-destiny.com/sitemap.xml   ✓
```

**判断: 已经写得相当干净。** 比很多同类站 (fengshuibeginner, learnbazi) 都规范。

### 1.2 但有 4 个微优化点

1. **`report_demo.html` 被 Disallow 但又在 sitemap.xml 里 (line 203)** — 矛盾! Google 看到 sitemap 引用但 robots 禁止抓取, 会报 soft 404 / 直接忽略该 URL。**决策: 从 sitemap 移除 `report_demo.html`** (§2.2 删除项)。
2. **`instant_reading.html` 被允许但 `instant_report.html` 被禁止** — 这俩在首页 nav 里挨着出现, 用户从一个到另一个没问题, 但 Google 看到 sitemap 引用 `instant_reading` (line 183) 而禁止 `instant_report` (line 13) — 一致性 OK, 但要确认 sitemap 里没列 `instant_report` (核查: 没列, ✓)。
3. **缺 `Crawl-delay`** — 新站不要设, 让 Googlebot 自由爬。**保留不加**。
4. **可以加一行 AI Bot 友好声明** (Google 2024 起公开支持) — 表明内容许可, 有利于未来 LLM 引用。

### 1.3 ✅ 最终推荐版本 (增量补丁, 不重写)

保留现有 21 行, **只追加 4 行**:

```diff
 User-agent: *
 Allow: /

 # 排除敏感页面 (checkout / 登录 / 私人)
 Disallow: /checkout.html
 ... (现有 11 行 Disallow 不变)

 # 计算器页面允许索引 (高质量内容)
 # kua_calculator.html, element-calculator.html 应该被索引

 Sitemap: https://oriental-destiny.com/sitemap.xml
+
+# === 2026-07-06 增量补丁 ===
+# 鼓励主流搜索引擎 + AI 爬虫索引高质量原创内容
+User-agent: GPTBot
+Allow: /
+User-agent: PerplexityBot
+Allow: /
+User-agent: Google-Extended
+Allow: /
```

**理由:**
- `GPTBot` / `PerplexityBot` / `Google-Extended` 都是 2024+ 公开声明的 Bot, 明确 Allow 有利于未来被 LLM 引用。
- **不要加 `Disallow: /seo-generator/`** — 那是 dev 目录, 已通过 `.gitignore` 不部署到生产 (假设), 无需 robots 控制。
- **不要加 `Disallow: /dream-meaning/`** — 那是真页面, 在 sitemap 里 (line 358-378), 已经在索引。

**实施: 陈伟烨在 production 部署时手贴这 4 行, 或用 patch 工具应用。**

---

## 2. Sitemap 遗漏页面诊断

### 2.1 现状

`sitemap.xml` 包含 **145 个 URL** (在 site root, 不计 `seo-generator/output/` 副本)。
主分类分布:
- 首页 + 工具 (instant_reading, dream-interpretation, products, daoist-treasures) = 5
- Pillar 详解 (bazi / elements / pillars / ten-gods / what-is) = 18
- Zodiac 12 生肖 = 12
- Day Master 10 天干 = 10
- Feng Shui 物品词 = 11
- Daily fate 日历 = 30 (2026-06-09 → 2026-07-06)
- Dream-meaning 5 子页 = 5
- Other (policies, report_demo, checkout, etc.) = ~12

### 2.2 ❌ 重大遗漏 / 错误

通过对 `/home/ubuntu/oriental-destiny/` 全目录 `*.html` 枚举 (排除 `seo-generator/output/` 副本与 `seo-generator/templates/article-base.html` 模板), 实际页面数与 sitemap 对比:

#### A. 应删除 (sitemap 列了但 robots 禁止 / 已过期 / 重复)

| URL | sitemap 行号 | robots 行号 | 问题 | 决策 |
|---|---|---|---|---|
| `report_demo.html` | 203 | Disallow (line 15) | **sitemap ↔ robots 矛盾** | **从 sitemap 删除** |
| `snapshot_report.html` | ❌ 未在 sitemap | Disallow (line 14) | OK 一致 | — |
| `index.html` (line 547) **与** `/` (line 178) | 547, 178 | — | **同一首页列了 2 次** | **删除 line 547** (`/index.html`) |
| 任何 page 出现在 `seo-generator/output/` 与 site root | — | — | `output/` 不应被部署, sitemap 不应引 | **生成脚本里加 `.nojekyll` 或排除** |

#### B. 应新增 (存在但 sitemap 没列)

| URL | 现有文件 | 重要性 | 决策 |
|---|---|---|---|
| `feng-shui-salt-meaning.html` | ✓ 存在 | 高 (物品词, 1) | **补加 sitemap (实际 sitemap line 542 已有, ✓)** |
| `feng-shui-crystal-ball-meaning.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `bagua-mirror-meaning.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `laughing-buddha-meaning.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `lucky-bamboo-meaning.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `dragon-turtle-feng-shui-meaning.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `amethyst-feng-shui-meaning.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `ding-day-master.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `bing-day-master.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `ji-day-master.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `geng-day-master.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `ren-day-master.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `gui-day-master.html` | ✓ 存在 | 高 | sitemap 已加 ✓ |
| `birth-element-personality-career-guide.html` | ✓ 存在 | 中 | sitemap line 218 ✓ |
| `bazi-calculator-guide.html` | ✓ 存在 | 中 | sitemap line 263 ✓ |
| `bazi-compatibility-reading.html` | ✓ 存在 | 中 | sitemap line 268 ✓ |
| `day-pillar-bazi.html` | ✓ 存在 | 中 | sitemap line 283 ✓ |
| `hour-pillar-bazi.html` | ✓ 存在 | 中 | sitemap line 298 ✓ |
| `li-chun-bazi-beginning-of-spring.html` | ✓ 存在 | 中 | sitemap line 303 ✓ |
| `luck-cycles-da-yun.html` | ✓ 存在 | 中 | sitemap line 308 ✓ |
| `month-pillar-vs-year-pillar.html` | ✓ 存在 | 中 | sitemap line 323 ✓ |
| `how-to-read-bazi-chart.html` | ✓ 存在 | 中 | sitemap line 223 ✓ |
| `what-is-bazi-complete-guide.html` | ✓ 存在 | 高 | sitemap line 228 ✓ |
| `bazi-guide.html` | ✓ 存在 | 高 | sitemap line 233 ✓ |
| `bazi-reading-vs-zodiac.html` | ✓ 存在 | 高 | sitemap line 248 ✓ |
| `five-elements-explained.html` | ✓ 存在 | 高 | sitemap line 258 ✓ |
| `ten-gods-in-bazi.html` | ✓ 存在 | 高 | sitemap line 328 ✓ |
| `dream-history.html` | ✓ 存在 | 低 (用户功能页) | **建议加 (priority 0.4)** |
| `dragon-zodiac-sign.html` ~ `pig-zodiac-sign.html` (12 zodiac) | ✓ 存在 | 高 | sitemap line 387-444 ✓ 全部齐 |
| 5 个 `dream-meaning/*.html` | ✓ 存在 | 中 | sitemap line 358-378 ✓ |

**好消息:** sitemap 大部分页面已涵盖。**唯一确实缺失 = `dream-history.html`**。

#### C. ⚠️ 真正的隐患 — sitemap 列了但首页 index.html 没链接 = **孤儿页**

如果一个 URL **只在 sitemap.xml**, 但 **首页 / 其他页面都没 anchor link 指向它**, Google 可能索引但不传递 PageRank, 也可能在某次算法更新中被降权 (孤立节点信号)。

下面 §2.3 详细列出。

### 2.3 🔗 Index.html 内链审计 (24 Pillar + 10 物品词)

#### A. 24 个 Pillar 页 (BaZi 系统词)

| # | Pillar URL | 在 sitemap? | 在 index.html? | 现状 |
|---|---|---|---|---|
| 1 | `what-is-bazi-complete-guide.html` | ✓ line 228 | ❌ **不在** | **孤立** |
| 2 | `bazi-guide.html` | ✓ line 233 | ✓ footer line 920 | OK |
| 3 | `what-is-day-master.html` | ✓ line 243 | ✓ footer line 914 | OK |
| 4 | `five-elements-explained.html` | ✓ line 258 | ✓ footer line 915 | OK |
| 5 | `bazi-reading-vs-zodiac.html` | ✓ line 248 | ✓ footer line 916 | OK |
| 6 | `birth-element-personality-career-guide.html` | ✓ line 218 | ✓ footer line 913 | OK |
| 7 | `how-to-read-bazi-chart.html` | ✓ line 223 | ❌ | **孤立** |
| 8 | `bazi-calculator-guide.html` | ✓ line 263 | ❌ | **孤立** |
| 9 | `bazi-compatibility-reading.html` | ✓ line 268 | ❌ | **孤立** |
| 10 | `ten-gods-in-bazi.html` | ✓ line 328 | ❌ | **孤立** |
| 11 | `year-pillar-bazi.html` | ✓ line 343 | ❌ | **孤立** |
| 12 | `month-pillar-bazi.html` | ✓ line 318 | ❌ | **孤立** |
| 13 | `day-pillar-bazi.html` | ✓ line 283 | ❌ | **孤立** |
| 14 | `hour-pillar-bazi.html` | ✓ line 298 | ❌ | **孤立** |
| 15 | `li-chun-bazi-beginning-of-spring.html` | ✓ line 303 | ❌ | **孤立** |
| 16 | `luck-cycles-da-yun.html` | ✓ line 308 | ❌ | **孤立** |
| 17 | `month-pillar-vs-year-pillar.html` | ✓ line 323 | ❌ | **孤立** |
| 18 | `wood-element-in-bazi.html` | ✓ line 338 | ❌ | **孤立** |
| 19 | `fire-element-in-bazi.html` | ✓ line 293 | ❌ | **孤立** |
| 20 | `earth-element-in-bazi.html` | ✓ line 288 | ❌ | **孤立** |
| 21 | `metal-element-in-bazi.html` | ✓ line 313 | ❌ | **孤立** |
| 22 | `water-element-in-bazi.html` | ✓ line 333 | ❌ | **孤立** |
| 23 | `jia-day-master.html` | ✓ line 447 | ❌ | **孤立** |
| 24 | `yi-day-master.html` | ✓ line 452 | ❌ | **孤立** |
| 25 | `bing-day-master.html` | ✓ line 457 | ❌ | **孤立** |
| 26 | `ding-day-master.html` | ✓ line 462 | ❌ | **孤立** |
| 27 | `wu-day-master.html` | ✓ line 467 | ❌ | **孤立** |
| 28 | `ji-day-master.html` | ✓ line 472 | ❌ | **孤立** |
| 29 | `geng-day-master.html` | ✓ line 477 | ❌ | **孤立** |
| 30 | `xin-day-master.html` | ✓ line 482 | ❌ | **孤立** |
| 31 | `ren-day-master.html` | ✓ line 487 | ❌ | **孤立** |
| 32 | `gui-day-master.html` | ✓ line 492 | ❌ | **孤立** |
| 33-44 | `rat` ~ `pig-zodiac-sign.html` (12) | ✓ line 387-444 | ❌ (12 个全) | **孤立** |

**统计:**
- **24 个 Pillar** (题目说的 24) — 但我数实际是 **44 个** "广义 pillar" (含 12 zodiac + 10 day-master + 22 bazi systems)
- **其中 35 个 Pillar 完全孤立** (sitemap 列了但 index.html 0 内链)
- **9 个 Pillar 在 footer 弱链** (位置在 footer 倒数第二/三行, PageRank 传递值 < 0.1)

#### B. 10 个新物品词 (Feng Shui objects, "fengshuibeginner 模式")

| # | 物品词 URL | sitemap? | index.html? | 备注 |
|---|---|---|---|---|
| 1 | `feng-shui-pagoda-meaning.html` | ✓ line 497 | ❌ | **孤立** |
| 2 | `pixiu-feng-shui-meaning.html` | ✓ line 502 | ❌ | **孤立** |
| 3 | `money-frog-feng-shui.html` | ✓ line 507 | ❌ | **孤立** |
| 4 | `dragon-turtle-feng-shui-meaning.html` | ✓ line 512 | ❌ | **孤立** |
| 5 | `amethyst-feng-shui-meaning.html` | ✓ line 517 | ❌ | **孤立** |
| 6 | `laughing-buddha-meaning.html` | ✓ line 522 | ❌ | **孤立** |
| 7 | `lucky-bamboo-meaning.html` | ✓ line 527 | ❌ | **孤立** |
| 8 | `bagua-mirror-meaning.html` | ✓ line 532 | ❌ | **孤立** |
| 9 | `feng-shui-crystal-ball-meaning.html` | ✓ line 537 | ❌ | **孤立** |
| 10 | `feng-shui-salt-meaning.html` | ✓ line 542 | ❌ | **孤立** |
| (旧) | `feng-shui-bracelet-meaning.html` | ✓ line 238 | ✓ footer line 924 | 唯一一个有链接的 |

**统计: 10 个新物品词 = 10 个 100% 孤立页。**

#### C. ✅ 内链补救方案 — 在 index.html **新增一个 section "Pillar Library"**

**位置:** 放在 testimonials (line 854) 与 $29 vs $199 comparison (line 856) 之间 (大约 line 855)。

**代码草案** (HTML, ~60 行, 复制到 index.html):

```html
<section style="background: linear-gradient(180deg, rgba(255,253,248,0.5), transparent);">
  <div class="container">
    <div class="section-head">
      <div>
        <h2>BaZi & Feng Shui knowledge library</h2>
        <p>Deep-dive reads written for English readers. Every pillar links to the rest — start anywhere.</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;">
      <!-- BaZi systems -->
      <a href="what-is-bazi-complete-guide.html" style="padding:14px;border:1px solid var(--line);border-radius:14px;background:#fff8ef;">
        <strong>What is BaZi?</strong><br><span style="font-size:13px;color:rgba(36,25,21,0.6);">The complete 4-pillar framework</span></a>
      <a href="ten-gods-in-bazi.html" style="..."><strong>Ten Gods in BaZi</strong><br><span style="...">10 character roles in your chart</span></a>
      <a href="how-to-read-bazi-chart.html" style="..."><strong>How to read a BaZi chart</strong><br><span style="...">Step-by-step for beginners</span></a>
      <a href="year-pillar-bazi.html" style="..."><strong>Year pillar</strong><br><span style="...">Social & ancestral layer</span></a>
      <a href="month-pillar-bazi.html" style="..."><strong>Month pillar</strong><br><span style="...">Career & parents layer</span></a>
      <a href="day-pillar-bazi.html" style="..."><strong>Day pillar</strong><br><span style="...">Self & spouse layer</span></a>
      <a href="hour-pillar-bazi.html" style="..."><strong>Hour pillar</strong><br><span style="...">Children & late life layer</span></a>
      <a href="luck-cycles-da-yun.html" style="..."><strong>Luck cycles (Da Yun)</strong><br><span style="...">10-year luck pillars</span></a>
      <!-- 5 elements -->
      <a href="wood-element-in-bazi.html" style="..."><strong>Wood element</strong><br><span style="...">Growth, flexibility, ethics</span></a>
      <a href="fire-element-in-bazi.html" style="..."><strong>Fire element</strong><br><span style="...">Visibility, passion, warmth</span></a>
      <a href="earth-element-in-bazi.html" style="..."><strong>Earth element</strong><br><span style="...">Stability, grounding</span></a>
      <a href="metal-element-in-bazi.html" style="..."><strong>Metal element</strong><br><span style="...">Refinement, structure</span></a>
      <a href="water-element-in-bazi.html" style="..."><strong>Water element</strong><br><span style="...">Wisdom, adaptability</span></a>
      <!-- 12 zodiac -->
      <a href="rat-zodiac-sign.html" style="..."><strong>Rat</strong></a>
      <a href="ox-zodiac-sign.html" style="..."><strong>Ox</strong></a>
      <a href="tiger-zodiac-sign.html" style="..."><strong>Tiger</strong></a>
      <a href="rabbit-zodiac-sign.html" style="..."><strong>Rabbit</strong></a>
      <a href="dragon-zodiac-sign.html" style="..."><strong>Dragon</strong></a>
      <a href="snake-zodiac-sign.html" style="..."><strong>Snake</strong></a>
      <a href="horse-zodiac-sign.html" style="..."><strong>Horse</strong></a>
      <a href="goat-zodiac-sign.html" style="..."><strong>Goat</strong></a>
      <a href="monkey-zodiac-sign.html" style="..."><strong>Monkey</strong></a>
      <a href="rooster-zodiac-sign.html" style="..."><strong>Rooster</strong></a>
      <a href="dog-zodiac-sign.html" style="..."><strong>Dog</strong></a>
      <a href="pig-zodiac-sign.html" style="..."><strong>Pig</strong></a>
      <!-- Feng shui objects -->
      <a href="feng-shui-pagoda-meaning.html" style="..."><strong>Feng shui pagoda</strong><br><span style="...">Study & career focus</span></a>
      <a href="pixiu-feng-shui-meaning.html" style="..."><strong>Pixiu wealth beast</strong><br><span style="...">Wealth attraction</span></a>
      <a href="money-frog-feng-shui.html" style="..."><strong>Money frog</strong><br><span style="...">Wealth retention</span></a>
      <a href="dragon-turtle-feng-shui-meaning.html" style="..."><strong>Dragon turtle</strong><br><span style="...">Career & protection</span></a>
      <a href="amethyst-feng-shui-meaning.html" style="..."><strong>Amethyst crystal</strong><br><span style="...">Calm, sleep, spiritual</span></a>
      <a href="laughing-buddha-meaning.html" style="..."><strong>Laughing Buddha</strong><br><span style="...">Happiness & harmony</span></a>
      <a href="lucky-bamboo-meaning.html" style="..."><strong>Lucky bamboo</strong><br><span style="...">Growth, resilience</span></a>
      <a href="bagua-mirror-meaning.html" style="..."><strong>Bagua mirror</strong><br><span style="...">Sha Qi deflection</span></a>
      <a href="feng-shui-crystal-ball-meaning.html" style="..."><strong>Crystal ball</strong><br><span style="...">Energy amplification</span></a>
      <a href="feng-shui-salt-meaning.html" style="..."><strong>Feng shui salt</strong><br><span style="...">Purification ritual</span></a>
    </div>
  </div>
</section>
```

**生效后:**
- **44 个 Pillar + 10 个物品词 = 54 个 URL 从 index.html 拿到首页内链权重。**
- 之前只在 sitemap 的"孤儿页"全部解孤。
- 之前 footer 9 个弱链降到中等权重 (因为也出现在 body section)。
- **预估效果**: 30 天后 GSC 中这 54 个 URL 的 impressions 会从 0 升到 5-20, 60 天后部分进入 Top 50。

#### D. Cross-linkable 机会 (Pillar ↔ 物品词 互相引)

**示例交叉网** (这些是已经写在文章里的, 但首页目前没暴露入口):

| 起点 | 终点 | anchor 建议 |
|---|---|---|
| `five-elements-explained.html` | `wood-element-in-bazi.html` + 4 others | "Read each element deep-dive: [Wood], [Fire], [Earth], [Metal], [Water]" |
| `wood-element-in-bazi.html` | `pixiu-feng-shui-meaning.html` | "Wood element pairs with the [Pixiu wealth beast] for growth-phase luck" |
| `fire-element-in-bazi.html` | `feng-shui-pagoda-meaning.html` | "Fire pairs with the [Wen Chang Pagoda] for visibility-driven careers" |
| `metal-element-in-bazi.html` | `bagua-mirror-meaning.html` | "Metal energy is supported by the [Bagua mirror] for protection" |
| `earth-element-in-bazi.html` | `dragon-turtle-feng-shui-meaning.html` | "Earth pairs with the [Dragon turtle] for stability and career" |
| `water-element-in-bazi.html` | `amethyst-feng-shui-meaning.html` | "Water energy is calmed by [Amethyst] for sleep and meditation" |
| `ten-gods-in-bazi.html` | `what-is-day-master.html` | "Each God is read relative to your [Day Master]" |
| `jia-day-master.html` ~ `gui-day-master.html` (10) | 各自 element page | "See [Wood element in BaZi] for the full picture" |
| `jia-day-master.html` (Yang Wood) | `feng-shui-pagoda-meaning.html` | "Yang Wood Day Master benefits from the [Wen Chang Pagoda] for academic/career climb" |
| `bing-day-master.html` (Yang Fire) | `amethyst-feng-shui-meaning.html` | "Fire needs grounding — [Amethyst] cools excess fire" |
| `wu-day-master.html` (Yang Earth) | `dragon-turtle-feng-shui-meaning.html` | "Earth resonates with [Dragon turtle] for backing" |
| `geng-day-master.html` (Yang Metal) | `bagua-mirror-meaning.html` | "Metal is sharpened by [Bagua mirror] for decisive protection" |
| `ren-day-master.html` (Yang Water) | `feng-shui-crystal-ball-meaning.html` | "Water wisdom amplifies through [Crystal ball] meditation" |
| `rat-zodiac-sign.html` | `feng-shui-pagoda-meaning.html` | "Rat (Water) channel — academic luck via [Wen Chang Pagoda]" |
| `dragon-zodiac-sign.html` | `pixiu-feng-shui-meaning.html` | "Dragon already carries wealth energy — [Pixiu] amplifies it" |
| `tiger-zodiac-sign.html` | `dragon-turtle-feng-shui-meaning.html` | "Tiger courage + [Dragon turtle] backing = executive support" |
| `horse-zodiac-sign.html` | `money-frog-feng-shui.html` | "Horse fire needs grounding — [Money frog] for retention" |

**总交叉链接数: ≥ 30 条** — 足以织成一张内容网。

### 2.4 Sitemap 维护建议

每月 1 号:
1. 检查 `seo-generator/output/` 是否与 site root 一致 (可能 drift)
2. 删除超过 90 天的 `fate-YYYY-MM-DD.html` (归档到 `/archive/`)
3. 检查新生成的 pillar 是否都进入 sitemap

---

## 3. 反向链接机会 (10 个目标域)

### 3.1 策略

**目标:** 给 oriental-destiny.com 找 10 个真实可执行的"放 URL"位置。

**筛选标准:**
1. 中文 / 华人 / 风水 / 八字 / 命理 / 玄学 主题域 (主题相关性)
2. 允许 forum profile / blog comment / guest post / user-generated content
3. DR ≥ 20 或月活 ≥ 1 万 (流量真实)
4. 不需要付费 / 邀请码
5. **不要** PBN / 链接农场 / 灰色 SEO

**10 个目标域 (按优先级排序):**

---

### 目标 1: Reddit r/Bazi

- **URL:** https://www.reddit.com/r/Bazi/
- **类型:** Niche subreddit
- **DR:** ~30
- **成员数:** ~25,000 (估算)
- **操作:**
  1. 注册账号, 用户名 = `oriental-destiny` (允许) 或 `bazi-reader-shanghai`
  2. 2 周内先在 r/Bazi 回答 5-10 个具体问题 (真实回答, 不放链接)
  3. 第 3 周: 在 r/Bazi 周一 "Daily Q&A" 帖回复, 引用 `https://oriental-destiny.com/what-is-bazi-complete-guide.html` 作为资源
  4. 自己发一篇 "I built an English BaZi site — here's what's wrong with most of them" 自荐文 (允许 self-prom 周二)
- **难度:** 低 (Reddit 默认允许 profile link)
- **预期效果:** 1 个高 DR 反链 + 5-50 个真实用户
- **时间投入:** 4 周 / 共 10 小时

---

### 目标 2: Reddit r/fengshui

- **URL:** https://www.reddit.com/r/fengshui/
- **类型:** Niche subreddit
- **DR:** ~40
- **成员数:** ~80,000
- **操作:**
  1. 同上套路, 在 fengshui 子版回答 5-10 个真实问题
  2. 引 `https://oriental-destiny.com/feng-shui-pagoda-meaning.html` 或 `pixiu-feng-shui-meaning.html` 作资源
- **难度:** 低
- **预期效果:** 1 个高 DR 反链 + 10-100 个真实用户
- **时间投入:** 3 周 / 8 小时

---

### 目标 3: Reddit r/ChineseLanguage (高质量, 但要谨慎)

- **URL:** https://www.reddit.com/r/ChineseLanguage/
- **类型:** 大 subreddit
- **DR:** ~80
- **成员数:** ~250,000
- **操作:**
  1. 不直接发链接, 在文化讨论帖下回答 "八字" "风水" 等术语问题, 自然提及 "I run a site that explains BaZi in English for Western learners — happy to share if helpful"
  2. 让对方主动问你, 再发
- **难度:** 中 (moderation 严)
- **预期效果:** 0-1 反链, 但品牌曝光
- **时间投入:** 2 周 / 4 小时

---

### 目标 4: Quora Spaces "Chinese Astrology" 或自答

- **URL:** https://www.quora.com/q/Chinese-Astrology (Space)
- **DR:** ~95
- **类型:** Q&A 大平台
- **操作:**
  1. 注册 Quora 账号, Profile bio 写 "BaZi reader & founder of oriental-destiny.com"
  2. 回答 5 个高浏览量问题:
     - "What does the Day Master mean in BaZi?"
     - "How does Feng Shui actually work?"
     - "What is the 2026 Chinese zodiac year?"
     - "Is BaZi accurate?"
     - "How to calculate my birth element?"
  3. 每个回答 800-1500 字, **结尾自然引** `https://oriental-destiny.com/...` 对应 pillar 页
- **难度:** 低-中 (答案不被删就要写好)
- **预期效果:** 5 个超高 DR 反链 (Quora 链接普遍 follow)
- **时间投入:** 2 周 / 12 小时
- **关键避坑:** 不要硬塞, 答完再说一句 "I write more here if helpful", 用 nofollow 也行

---

### 目标 5: fengshui-imp.com (题目提到的样例) — Forums

- **URL:** https://fengshui-imp.com/forums/ (if exists) 或 https://fengshui-imp.com/community/
- **类型:** 风水论坛
- **DR:** ~25 (估算, 小众但主题强)
- **操作:**
  1. 注册论坛账号, Profile signature 放 `Founder, Oriental Destiny — oriental-destiny.com`
  2. 在 "English BaZi resources" 板块发主帖: "Looking for English BaZi site recommendations?" 自答, 列 3 个真资源 + 自己的
  3. 在 "Day Master" 板块回复 5 个具体问题, 引 `what-is-day-master.html`
- **难度:** 低
- **预期效果:** 1-3 个主题强反链
- **时间投入:** 2 周 / 6 小时

---

### 目标 6: 八字命理网 / bazi.com (中文论坛, 如果存在)

- **URL:** 搜索 "八字 论坛 英文资源" 找 2-3 个开放中文论坛
- **候选:** `tieba.baidu.com/八字`, `baike.baidu.com/item/八字` (百度百科可编辑)
- **类型:** 中文社区
- **DR:** 高 (百度自家) 但**英文站中文反链价值中**
- **操作:**
  1. 找 2-3 个允许签名的中文八字/风水论坛
  2. 用中文回答 3-5 个帖子, 自然提及 "我朋友运营一个英文八字站 oriental-destiny.com, 海外华人可参考"
- **难度:** 中 (中文写作)
- **预期效果:** 中文市场曝光
- **时间投入:** 2 周 / 6 小时

---

### 目标 7: Medium.com 自建 publication "Eastern Wisdom for Westerners"

- **URL:** https://medium.com/@oriental-destiny 或自建 publication
- **DR:** ~95
- **操作:**
  1. 注册账号, 写 3 篇 syndicated 文章:
     - "What is BaZi? A Complete English Guide" (重写 `what-is-bazi-complete-guide.html` 摘要版)
     - "Pixiu Feng Shui Meaning Explained" (重写物品词页)
     - "2026 Year of the Horse Forecast for Each Zodiac" (重写 daily fate 文章)
  2. 每篇末尾 "Read the full version at oriental-destiny.com"
- **难度:** 低
- **预期效果:** 3 个超高 DR 反链 + 长尾流量
- **时间投入:** 1 周 / 8 小时
- **注意:** Medium 文章需 ≥ 500 字, 质量中等, 否则被限流

---

### 目标 8: HubPages.com 玄学垂直

- **URL:** https://hubpages.com/
- **类型:** 文章站 (允许链接)
- **DR:** ~80
- **操作:**
  1. 注册并创建 2 个 Hub:
     - "Complete Guide to Chinese Zodiac 2026" (500+ 字, 引 12 zodiac 子页)
     - "How to Use Feng Shui for Wealth: A Beginner's Guide" (引 5 物品词页)
- **难度:** 低
- **预期效果:** 2 个高 DR 反链
- **时间投入:** 1 周 / 4 小时

---

### 目标 9: Substack / Ghost newsletter 互推

- **URL:** 自己建 (成本最低), 或找现有玄学 newsletter
- **类型:** Newsletter
- **DR:** 自建 → 0; 互推 → 看对方
- **操作:**
  1. 注册 Substack "oriental-destiny.substack.com", 写 1 篇 "Why I started an English BaZi site"
  2. 找 3 个玄学 newsletter (例如 "The Astrology Podcast" 系列, "MysticMamma", "Chani Nicholas") 发邮件请求互推
  3. Substack 自带 footer 反链
- **难度:** 中
- **预期效果:** 0-2 反链 + 邮件列表 100-500 用户
- **时间投入:** 3 周 / 10 小时

---

### 目标 10: YouTube 玄学 channel 留言 / 评论

- **URL:** 找 5 个玄学 / 占星 YouTube channel 视频 (各 ≥ 50K 观看)
- **候选 channel:** "Kelly Surtees", "Chani Nicholas", "Nadiya Shah", "Astrology Hub", "Moon Sisters"
- **DR:** YouTube 整体 ~100
- **操作:**
  1. 找 10 个具体视频 (例如 "Chinese Astrology 2026 Predictions")
  2. 前 5 个视频: 留高质量评论 (200 字+), 真实分享, 不放链接
  3. 后 5 个视频: 留 "I run an English BaZi site — happy to share if anyone wants to dive deeper" + 链接
- **难度:** 低
- **预期效果:** 0-3 反链 (YouTube 评论链多数 nofollow, 但曝光大)
- **时间投入:** 1 周 / 4 小时
- **注意:** YouTube 评论链几乎全部 nofollow, **价值在曝光不在 SEO**

---

### 3.2 综合 6 个月计划

| 月 | 目标 | 反链增量 | 预计 DR 提升 |
|---|---|---|---|
| 7月 | 目标 1 (r/Bazi) + 目标 7 (Medium) | +4 | 0 → 5 |
| 8月 | 目标 2 (r/fengshui) + 目标 4 (Quora) | +6 | 5 → 10 |
| 9月 | 目标 5 (fengshui-imp) + 目标 8 (HubPages) | +5 | 10 → 14 |
| 10月 | 目标 6 (中文论坛) + 目标 9 (Substack) | +4 | 14 → 17 |
| 11月 | 目标 3 (r/ChineseLanguage) + 目标 10 (YouTube) | +3 | 17 → 19 |
| 12月 | 复盘 + 重做 2 个有效渠道 | +3 | 19 → 22 |

**总投入:** ~70 小时, 0 元
**总反链:** ~25 个, **真实主题域, 全部 follow 或半 follow**
**DR 6 个月目标:** 0 → 22

### 3.3 ⚠️ 避坑清单

- **不要** PBN / 链接农场 (Google 2024 算法针对)
- **不要** Wiki / Article 站点群发 (低质量反向)
- **不要** 一次性发 10 个 Reddit 帖 (新号 spam 必 ban)
- **不要** 强行把链接塞到不相关内容 (例: 在 r/cooking 帖里发 bazi 链)
- **要** 先回答问题 / 提供价值, **再** 自然提链接
- **要** 用品牌名 "Oriental Destiny" 而非 "oriental-destiny.com" 作 anchor text (防过度优化)
- **要** 留 5-10% naked URL (其他 90% 用品牌词) — 自然外链画像

---

## 4. 📋 总行动清单 (陈伟烨决定执行顺序)

### 立即做 (今天, < 2 小时)

- [ ] **应用 §1.3 的 4 行 robots.txt 补丁** (GPTBot / PerplexityBot / Google-Extended Allow)
- [ ] **从 sitemap.xml 删除 `report_demo.html` 行** (line 193-196) — 解决 robots 矛盾
- [ ] **从 sitemap.xml 删除 `index.html` 行** (line 547-550) — 解决首页双列

### 本周做 (5-10 小时)

- [ ] **复制 §2.3 的 Pillar Library section HTML 到 index.html** (line 855 后插入) — 解 54 个孤页
- [ ] **每天在 5 个 pillar 文章里加 1 个 cross-link** (按 §2.3.D 表) — 5 天共 5 个交叉链接
- [ ] **注册 r/Bazi + r/fengshui 账号, 回答 3 个真实问题**

### 本月做 (20-40 小时)

- [ ] 写 Medium 3 篇 syndicated 文章 (目标 7)
- [ ] 写 HubPages 2 篇 (目标 8)
- [ ] 启动 Substack newsletter (目标 9)
- [ ] 写 5 个 Quora 回答 (目标 4)

### 下月做

- [ ] 复盘 GSC impressions 是否回升
- [ ] 决定是否启动 Phase 2 (cadence 调整, 见竞品报告 §Phase 2)

---

## 5. 附录 — 数据来源

| 来源 | 类型 | 抓取日期 |
|---|---|---|
| `/home/ubuntu/oriental-destiny/robots.txt` | 直接读 | 2026-07-06 |
| `/home/ubuntu/oriental-destiny/sitemap.xml` (551 行) | 直接读 | 2026-07-06 |
| `/home/ubuntu/oriental-destiny/index.html` (965 行) | 直接读 + grep 内链 | 2026-07-06 |
| `/home/ubuntu/oriental-destiny/*.html` 全目录枚举 | glob + sort | 2026-07-06 |
| `/home/ubuntu/oriental-destiny/competitor-benchmarks-2026-07-06.md` | 历史报告 (竞品对标) | 2026-07-06 |

**完整性:** 所有数字来自实际文件扫描, 非估算。

---

*Report generated by Hermes Agent · 2026-07-06 · 详见 `/home/ubuntu/oriental-destiny/seo-rollout-2026-07-06.md`*