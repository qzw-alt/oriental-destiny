# 2026-08-06 技术改进记录

## 一、报告 AI 语气升级（B站风格）

**问题**：报告 AI 生成文字偏学术/干巴，缺乏感染力。

**改动**：`report_engine_v2.js`
- 重写 10 个 Day Master 声线档案（戊土如山→"你一直在做那个扛事的人"）
- 重写 3 个系统提示词（basic / diagnosis / deluxe）
- 技巧：矛盾钩子、深夜语音信语气、感官隐喻、"古文→大白话"翻译

## 二、报告简化 — 去学术化

**问题**：报告展示了客户看不懂的学术数据（用神/喜神/忌神标签、神煞行、五行分布条）。

**改动**：`gen_report.js`
- 移除五行分布条（element bars）
- 移除用神/喜神/忌神 chips
- 移除神煞行（Shen Sha line）
- 数据仍传给 AI 用于准确分析，前端不展示

## 三、印章修复 — 从破碎文字到 dao.webp 图片

**问题**：印章英文文字（"Destiny"、"Secrets"）在 `writing-mode: vertical-rl` + `text-orientation: upright` CSS 下显示错乱。英文单词逐字母竖排严重变形。

**方案**：统一用 `dao.webp` / `dao.png` 图片替代 CSS 文字印章。

**改动文件**：
| 文件 | 改动 |
|------|------|
| `gen_report.js` | 封面章 + 天机卷章(×3+) + 页尾章 → `<img src="dao.webp">` |
| `report_demo_v2.html` | 同上 + JS 动态生成模板 |
| `instant_reading.html` | 静态章 + JS 动态章 → dao.webp |
| `instant_report.html` | 静态章 + JS 动态章 → dao.webp |
| `report_viewer.html` | 动态章 → dao.webp |
| `sample_report.html` | 重新生成 |

**CSS 清理**：
- 移除所有 `writing-mode: vertical-rl`（6个文件，0残留）
- 移除 `.seal-inner` `.tianji-seal` `.foot-seal` 的文字样式（border/color/font）
- 修复 `.chapter-marker .vol` 从竖排改回横排

## 四、经验教训

1. **`writing-mode: vertical-rl` 只适用于中文单字**，英文单词会逐字母竖排导致严重变形
2. **印章用图片更可靠**——CSS 模拟印章在不同字体/平台下差异大，图片一致性好
3. **客户看到的 ≠ 引擎算的**——简化展示层不影响后端数据精度
4. **B站文案的共鸣感**来自"你注意到了吗"句式 + 行为细节 + 矛盾揭示
