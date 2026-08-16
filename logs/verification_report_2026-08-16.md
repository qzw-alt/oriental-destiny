# 交易流程闭环验证报告

> 验证日期：2026-08-16
> 验证方式：本地模拟客户进站流程（dev server 端口 3000 + 本地 Cloudflare Worker 端口 8787，真实 DeepSeek key）
> 边界：不真支付、不真提交 Formspree、不真登录 Firebase；支付环节验证到「按钮渲染 + 回跳逻辑审查」为止

---

## 一、结论：交易流程「半闭环」

三条变现线**表单流与支付入口完整**，但**核心交付物存在两个严重断点**：

| 交易线 | 表单/支付流 | 核心交付 | 结论 |
|---|---|---|---|
| $29 即时报告 | ✅ 完整 | ❌ 无付费门禁，可免费白嫖 | **严重** |
| $199 匹配宝藏 | ✅ 完整 | ⚠️ AI 报告实际是本地 fallback，DeepSeek 未生效 | **严重** |
| $199 梦境会员 | ✅ 完整 | ✅ 标记传递 + 升级逻辑正确（依赖 Firebase 外部配置） | 可用（待外部配置） |

---

## 二、断点清单（按严重度排序）

### 🔴 断点 1【严重】$29 报告无付费门禁，可免费白嫖

**位置**：
- `instant_report.html:632-643` — 只要有 `hasData` 就显示「Generate My Report from Saved Data」按钮
- `report_viewer.html:488-498` — 无 `reportId` 时，只要有 `state.birth_date` 就免费生成
- `snapshot_report.html:656` — 「Generate My Complete Report Now」免费生成完整报告（疑为遗留代码）

**已实测复现**：路径 A 中，未付费客户点击生成按钮，**真实生成了完整 6 章报告**（走真实 DeepSeek），无任何付费校验。

**影响**：任何访客填出生信息即可免费拿到 $29 报告，变现漏斗第一环被绕过。

**修复**：见下方「修复方案」。

---

### 🔴 断点 2【严重】$199 交付的 AI 生成全部失效（DeepSeek 未生效）

**位置**：
- `workers/deepseek-proxy/index.js:57` — `MAX_MESSAGE_LENGTH = 8000`
- `api_deepseek.js:256-268`（`_buildOverviewUserPrompt`）、`:74-100`（`analyzeChart`）等 — 把 `JSON.stringify(chartData, null, 2)` 完整塞进 prompt

**已实测复现**：`snapshot_report.html` 的 AI overview 与完整报告（`ReportEngine.generateFullReport`）全部 4 步 + overview **全部返回 400**：

```
[warn] basicOverview API error: DeepSeek API error 400: {"error":"Bad request: Message too long (max 8000 chars)"}
[warn] ReportEngine: analyzeChart failed, using fallback ...
[warn] AIBaziLayer generateOutline error: ... too long
[warn] AIBaziLayer generateNarrative error: ... too long
[warn] AIBaziLayer reviewQuality error: ... too long
```

**根因**：旧引擎（`report_engine.js` + `ai_bazi_layer.js` + `api_deepseek.js`）把完整 `chartData`（八字排盘全量数据，序列化后 > 8000 字符）塞进 prompt，被 Worker 的 8000 字符上限拒绝。**所有步骤回退到本地静态 fallback 模板**。

**影响**：$199 客户看到的「AI 预览 overview」和「AI 完整报告」**实际是本地模板拼接，不是 DeepSeek 生成**。而 $29 报告用的新引擎（`ReportEngineV2` + `buildCompactBrief`）prompt 短，正常生效——两条线质量不一致。

**修复**（二选一）：
1. 提高 Worker `MAX_MESSAGE_LENGTH` 到 32000（DeepSeek 支持长输入，8000 是我方过度保守）
2. 或让旧引擎 `analyzeChart`/`generateOverview` 等改用 `buildCompactBrief` 紧凑 brief

> 注：本次报告样本（$29）走的是新引擎，真实 DeepSeek 生成，质量正常。$199 侧的 fallback 质量未达「真实 AI 生成」承诺。

---

### 🟡 断点 3【中】$199 支付回跳依赖 PayPal 后台配置

`checkout.html` 的 PayPal HostedButtons 回跳 `thanks.html` 需 PayPal 卖家中心配置 return URL，代码不可见。`thanks.html` 以 `tx`/`paymentId`/`token` 判断支付成功，已内置 `manualConfirm` 手动确认兜底按钮。

**状态**：代码侧兜底完善，但真正的自动回跳需外部配置 PayPal 后台。

---

### 🟡 断点 4【中】订单（Formspree）与支付（PayPal）数据脱节

`checkout.html` 提交 Formspree 保存订单详情，与 PayPal 支付是两个独立动作，无关联 ID，靠人工对账。`_next` 字段仅控制 Formspree 提交后的跳转，与 PayPal 支付状态无关。

---

### 🟡 断点 5【中】Firebase 配置为占位符

`config.js` 的 `FIREBASE_CONFIG` 均为 `YOUR_API_KEY` 占位（真实配置在 `config.real.js`，被 gitignore）。未配置时登录/会员/dashboard 链路断。$29 报告核心交付（`report_viewer` 无 `reportId`）不依赖登录，但会员升级（`upgradeToPaid`）依赖。

**状态**：需外部填入真实 Firebase 密钥。

---

### 🟢 断点 6【低】客户端 secret 硬编码

`config.js:5` 的 `DEEPSEEK_CLIENT_SECRET = "oriental-destiny-2026"` 暴露在浏览器，Worker fallback 同值。功能通但非强安全（可被 curl 直接调用 proxy）。强安全需 Worker 侧校验 PayPal 交易，属较大改动，列后续建议。

---

## 三、已验证走通的部分（证据）

### 路径 A（$29）
- ✅ 免费诊断 → `instant_report.html` → 点击生成 → **真实 DeepSeek 生成完整 6 章报告**（封面 + Vol.1-6 + 升级 CTA）
- ✅ PayPal 按钮渲染（`V5KL7YYCASY34`）
- ✅ 真实报告样本已导出：`logs/report_sample_29dollar_1990-06-15.md`

### 路径 B（$199）
- ✅ 3 步表单流：选 plan/carrier → 出生信息 → review&pay
- ✅ 预填映射：`focus=career` → `planKey=career` / `planName="Career & Allies"`
- ✅ email 一致性校验（不一致时正确报错 `The two email entries do not match`）
- ✅ 必填项校验（`reportValidity()` 空 `birthLocation` 时返回 false）
- ✅ `persistReadingState()` 正确保存 `focus/plan_key/carrier/birth_location` 到 localStorage
- ✅ `formNext = http://localhost:3000/thanks.html`、`formAction = formspree.io/f/xwvavoqz`
- ✅ PayPal 按钮渲染（`HLSEQWZLQCNVC` iframe 存在）
- ❌ snapshot AI overview：走 DeepSeek 但 400 失败回退（断点 2）

### 路径 C（会员）
- ✅ `checkout?product=destiny_membership` → `persistReadingState` 保存 `pendingProduct=destiny_membership`
- ✅ `thanks?tx=test&product=destiny_membership` → `dreamUpgradeCard` 显示 + 未登录时保存 `pendingUpgrade/upgradeTx` + 跳 register
- ✅ $199 解锁快照跳转参数拼接：`snapshot_report.html?birth_date=...&focus=love...`

---

## 四、修复方案（下一步执行）

**核心修复（断点 1 + 断点 2）**：

1. **$29 报告付费门禁**（断点 1）：
   - `thanks.html`（`isInstantReport && paid` 分支）：跳 `report_viewer.html` 前写 `localStorage.setItem('od_paid_instant_report', txId)`
   - `report_viewer.html`（无 `reportId` 分支）：生成前校验付费标记，无标记则显示付费墙（跳 `instant_report.html`）
   - `instant_report.html`：移除 `hasData` 即显示的免费 Generate 按钮，让 PayPal 支付成为完整报告唯一入口
   - `snapshot_report.html`：评估「Generate Complete Report Now」是否需门禁（属 $199 交付，优先级低于 $29）

2. **$199 AI 生成失效**（断点 2）：
   - 提高 Worker `MAX_MESSAGE_LENGTH`（8000 → 60000）。实测旧引擎 `JSON.stringify(chartData, null, 2)` 达 **43907 字符**，32000 不够，故提到 60000。

> 边界：前端门禁能堵普通白嫖（目标受众为占卜客户），非强安全（可改 localStorage）。强安全需 Worker 侧校验 PayPal 交易，属较大改动，列后续建议，本次不实施。

---

## 五、修复验证结果（已回归）

| 断点 | 修复 | 回归验证 | 结果 |
|---|---|---|---|
| 断点 1（$29 白嫖） | `thanks.html` 写 `od_paid_instant_report`；`report_viewer.html` 校验付费标记；`instant_report.html` 移除免费 Generate | 未付费访问 `report_viewer.html` → 显示付费墙；写入付费标记后 → 真实生成报告（Worker 200 OK，16270ms） | ✅ 通过 |
| 断点 2（$199 AI 失效） | Worker `MAX_MESSAGE_LENGTH` 8000 → 60000 | `snapshot_report.html` AI overview 走通 DeepSeek（Worker 200 OK，2465ms），`fallbackNotice` 不再显示 | ✅ 通过 |

**修复后代码改动清单**：
- `instant_report.html`：移除 `hasData` 即显示的免费 Generate 按钮（-16 行）
- `report_viewer.html`：新增 `showPaywall()` + `init()` 付费门禁（+17 行）
- `thanks.html`：支付成功写 `od_paid_instant_report` 标记（+2 行）
- `workers/deepseek-proxy/index.js`：`MAX_MESSAGE_LENGTH` 8000 → 60000

**已验证还原的临时改动**：
- `config.js` 的 `DEEPSEEK_PROXY_URL` 已还原为 `https://oriental-destiny.com/api`（git status 确认无 diff）
- 本地 Worker 已停止

**后续建议（本次未实施）**：
1. 旧引擎（`report_engine.js`/`ai_bazi_layer.js`/`api_deepseek.js`）把完整 chartData JSON（44K 字符）塞进 prompt，每次调用耗 token 且慢。建议重构为紧凑 brief（对齐新引擎 `ReportEngineV2` 的 `buildCompactBrief` 做法）。
2. `snapshot_report.html` 的「Generate My Complete Report Now」仍无付费门禁（属 $199 交付，完整报告本应邮件人工发送，疑为遗留代码），建议后续评估。
3. 前端付费门禁非强安全（可改 localStorage）；强安全需 Worker 侧校验 PayPal 交易。

---

## 六、架构统一：$199 切换到新引擎（方案 B，治本）

> 用户方向：「$29 报告用的什么 prompt，$199 也可以沿用，只是 $199 输出更多话术，不是吗？」
> 结论正确。第五节断点 2 的修复（提高字符上限 + 紧凑化 + 超时）是「治标」——让旧引擎勉强跑通，但保留两套引擎、4 步生成慢、报告风格与 $29 不一致。正确做法是让 $199 复用 `ReportEngineV2`（$29 同款 prompt），仅新增「大师批注 + 珠宝指南」两层内容，即 `generateFullDeluxe`。

### 改动清单

| 文件 | 改动 |
|---|---|
| `snapshot_report.html` | 脚本从旧引擎 5 个（`bazi_engine.min.js`/`api_deepseek.js`/`ai_bazi_layer.js`/`bazi_translator.js`/`report_engine.js`）换成 `bazi_engine_v2.js` + `report_engine_v2.js`；`profile` 用 `BaziEngineV2.calculateProfile`；渲染改 v2 字段（`yongShen`/`elementCounts` 替代 `usefulGodAnalysis`/`advancedAnalysis`）；AI overview 用 `generateDiagnosisReport`（诊断预告）；`generateFullBtn` 用 `generateFullDeluxe`；进度 4 步 → 3 步 |
| `full_report.html` | 渲染结构从旧 8 章改为 deluxe：basic 5 章（Opening / Your Pattern / What Guides You / In Practice / Closing Words）+ 大师批注（Master's Annotations）+ 珠宝指南（Jewelry Guide）+ 技术附录（Chart Snapshot）；新增 `esc()`/`paras()` 段落处理（与 $29 一致） |
| `report_engine_v2.js` | 修复 deluxe JSON 偶发解析失败：`_call` 加 `response_format: {type:"json_object"}`；`generateDeluxeReport` 失败重试 1 次 + `maxTokens` 2000 → 4000 |

### 发现并修复的新问题

**Deluxe parse failed（DeepSeek 偶发 JSON 语法错误）**：首次生成时 `fallback: true`，抓取 Worker 返回体发现 DeepSeek 在第三个批注对象开头多打了一个 `{`（`{ { "title": ...`），导致 `JSON.parse` 失败。非截断（`completion_tokens=1036`）。修复：强制 `json_object` 输出格式 + 失败重试。

### 回归验证结果

| 项 | 结果 |
|---|---|
| 快照页静态渲染（核心句/关键词/四柱/五行） | ✅ v2 字段正确映射（Metal/Wood/Wood） |
| AI overview | ✅ 真实走 `generateDiagnosisReport`（DeepSeek 200 OK） |
| 完整报告生成 | ✅ `generateFullDeluxe` 真实走 DeepSeek，`fallback: false`，tier=deluxe |
| 输出结构 | ✅ basic 5 章 + 3 条大师批注 + 珠宝指南（Green Tourmaline / Blue Lace Agate）+ 附录 |
| `full_report.html` 渲染 | ✅ 7 章 + 附录全部正确渲染，无 empty state |

**真实报告样本已导出**：`logs/report_sample_199dollar_deluxe_1990-06-15.md`

**已还原的临时改动**：`config.js` 的 `DEEPSEEK_PROXY_URL` 已还原为 `https://oriental-destiny.com/api`；本地 Worker 已停止（8787 端口已释放）。

### 遗留（可后续清理，不影响功能）

$199 链路切换新引擎后，旧引擎 `report_engine.js`（旧 `ReportEngine.generateFullReport`）已无任何页面/脚本引用，属死代码，已于本次清理删除。

其余 4 个旧引擎文件（`bazi_engine.min.js`/`api_deepseek.js`/`ai_bazi_layer.js`/`bazi_translator.js`）**并非死代码**——仍被 `basic_report.html`（基础报告页）与 `full_bazi_reading.html`（完整八字解读页）两个独立产品线页面使用（旧 `BaziEngine.calculateProfile` + `AIBaziLayer` + `BaziTranslator`）。`full_bazi_reading.html` 还被 footer 链接（knowledge/policies/products），两页均在 robots.txt 中被 Disallow（属真实部署页面）。因此这 4 个文件保留，若需彻底下线旧引擎，须先迁移这两个页面到新引擎（较大工程，本次未实施）。

`snapshot_report.html` 生成按钮仍依赖 `od_paid_reading` 前端标记（非强安全，同第五节边界说明）。
