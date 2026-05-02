# Oriental Destiny — AI 底层升级技术规格

## 1. 项目目标

将 Oriental Destiny 八字测算引擎从"静态模板填充"升级为"AI 动态推理 + 个性化生成"，面向英语用户。

- **计算层**：DeepSeek V4 做五行复杂推理
- **解读层**：DeepSeek V4 生成英文个性化文案
- **保留**：所有现有 `bazi_engine.js` 确定性计算逻辑

---

## 2. 架构总览

```
用户输入 (birth_date, birth_time, focus)
        │
        ▼
bazi_engine.js          ← 确定性数学计算（现有，保留）
  • 四柱排盘
  • 十神查表
  • 五行强度评分
  • 十二长生
        │
        ▼ JSON chartData
ai_bazi_layer.js        ← 新建：AI 推理 + 生成
  • analyzeChart()       计算层推理
  • generateReading()    解读层生成
        │
        ▼
api_deepseek.js         ← 新建：API 封装
  • chat()               DeepSeek V4 调用
        │
        ▼
DeepSeek API            ← 线上推理
```

---

## 3. 文件结构

```
oriental-destiny/
├── api_deepseek.js          # DeepSeek API 封装（新建）
├── ai_bazi_layer.js         # AI 推理 + 生成层（新建）
├── prompts/
│   ├── system_analyze.txt    # 计算层系统提示词
│   ├── user_analyze.txt      # 计算层用户输入模板
│   ├── system_reading.txt    # 解读层系统提示词
│   └── user_reading.txt     # 解读层用户输入模板
├── bazi_engine.js           # 现有引擎（不修改）
├── instant_reading.html     # 接入 AI 解读
├── full_bazi_reading.html   # 接入 AI 深度分析
└── report_demo.html         # 接入 AI 水晶推荐

```

---

## 4. 数据模型

### 4.1 chartData（bazi_engine.js 输出）

```javascript
{
  yearPillar:   { stem: "Jia", branch: "Zi", element: "Wood", animal: "Rat" },
  monthPillar:  { stem: "Yi", branch: "Mao", element: "Wood", animal: "Rabbit" },
  dayPillar:    { stem: "Gui", branch: "Mao", element: "Water", animal: "Rabbit" },
  hourPillar:   { stem: "Xin", branch: "You", element: "Metal", animal: "Rooster" },
  dayMaster: "Gui",
  dayElement: "Water",
  polarity: "Yang",
  season: "Spring",
  hiddenStems: {
    "Mao": [{ stem: "Yi", element: "Wood", tenGod: "Resource" }],
    "You": [{ stem: "Xin", element: "Metal", tenGod: "Officer" }]
  },
  elementalStrength: {
    Wood: 4.2, Fire: 1.5, Earth: 0.8, Metal: 2.1, Water: 3.0
  },
  dominantElement: "Wood",
  weakestElement: "Earth",
  branchClashes: ["Zi-Wu"],
  branchCombinations: [],
  tenGods: {
    yearStem: "Friend", monthStem: "Resource", dayStem: "DayMaster", hourStem: "Officer"
  },
  lifeStages: [
    { stage: "Chang Sheng", element: "Wood", meaning: "birth and renewal" },
    { stage: "Mu Yu", element: "Wood", meaning: "exposure and sensitivity" }
  ],
  userInput: {
    birthDate: "1990-03-15",
    birthTime: "08:30",
    focus: "career"  // career | wealth | love | protection | balance
  }
}
```

### 4.2 analysisResult（计算层输出）

```javascript
{
  elementalFlow: [
    { from: "Wood", to: "Fire", strength: "strong", meaning: "Wood feeds Fire, creating momentum" },
    { from: "Fire", to: "Earth", strength: "moderate", meaning: "Fire produces Earth, accumulation phase" }
  ],
  flowSummary: "Chart shows Wood-dominant energy with strong resource flow to Fire...",
  strengthAnalysis: {
    dominantReason: "Season is Spring (Wood), Month Pillar is Yi-Mao (Wood-Wood)...",
    weaknessRisk: "Earth is critically weak, may indicate digestion or financial instability..."
  },
  yearlyForecast: {
    year: 2026,
    stemElement: "Bing",
    branchElement: "Wu",
    elementOfYear: "Fire",
    overallAssessment: "Favorable for career visibility...",
    opportunities: ["Public recognition", "Publishing or speaking"],
    challenges: ["Overextension", "Hot temper"]
  },
  recommendedElements: ["Fire", "Metal"],
  contraindicatedElements: ["Wood", "Earth"],
  timingWindows: [
    { period: "Mar-May 2026", element: "Wood", note: "Strong growth energy" },
    { period: "Jul-Sep 2026", element: "Fire", note: "Peak visibility" }
  ]
}
```

### 4.3 readingResult（解读层输出）

```javascript
{
  focus: "career",
  personality: "Your Gui Water Day Master gives you a natural sensitivity to...",
  currentYearAnalysis: "2026 carries Fire Horse energy. Your chart's dominant Wood...",
  tailoredAdvice: [
    "Step into visible roles between July and September when Fire peaks...",
    "Wear Fire-element colors (red, amber) to reinforce your career momentum...",
    "Avoid major decisions in February when Metal conflicts with your chart..."
  ],
  productRecommendation: {
    focus: "career",
    elements: ["Fire", "Metal"],
    material: "Tiger eye, citrine, warm-toned stone",
    reason: "Your chart has strong Wood resource but lacks Fire output. These stones..."
  }
}
```

---

## 5. API 设计

### 5.1 api_deepseek.js

```javascript
class DeepSeekAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = "https://api.deepseek.com/v1";
    this.model = "deepseek-chat";
  }

  // 通用聊天接口
  async chat(messages, options = {}) {
    // messages: [{role, content}, ...]
    // options: { temperature, max_tokens, system }
  }

  // 计算层：五行推理
  async analyzeChart(chartData) {
    // 调用一次，返回 analysisResult
  }

  // 解读层：英文文案生成
  async generateReading(chartData, analysisResult, focus) {
    // 调用一次，返回 readingResult
  }
}
```

### 5.2 ai_bazi_layer.js

```javascript
window.AIBaziLayer = {
  api: null,

  init(apiKey) {
    this.api = new DeepSeekAPI(apiKey);
  },

  // 计算层：复杂五行推理
  async analyzeChart(chartData) {
    // Step 1: 五行流分析
    // Step 2: 流年预测
    // Step 3: 时机窗口计算
  },

  // 解读层：个性化英文生成
  async generateReading(chartData, analysisResult, focus) {
    // Step 1: 性格描述生成
    // Step 2: 流年分析生成
    // Step 3: 建议 + 产品推荐理由生成
  },

  // 完整流程
  async fullReading(userInput) {
    // 1. bazi_engine.js 排盘
    // 2. analyzeChart() 计算层
    // 3. generateReading() 解读层
    // 4. 合并结果
  }
};
```

---

## 6. Prompt 策略

### 6.1 计算层 Prompt 原则

```
角色：你是八字五行分析专家，精确、严谨，不编造信息。
输入：chartData JSON
任务：
  1. 分析五行流（生克传导链）
  2. 评估 2026 流年影响
  3. 输出时机窗口
约束：
  - 只基于给定数据推理
  - 不确定时明确说"无法确定"
  - 使用英文输出
```

### 6.2 解读层 Prompt 原则

```
角色：你是玄学英文内容写作专家，为英语用户写有深度的八字解读。
语气：专业但不冷漠，像一个有智慧的老师在解释
风格：Narrative, not templated. 每个句子都是独特的
禁止：
  - 不写"According to your chart..."（太模板）
  - 不写"your chart indicates..."（太机械）
  - 不重复系统化的列表格式
```

---

## 7. 接入现有页面

### 7.1 instant_reading.html 改动点

```javascript
// 原来：静态文案 from report_focus.js
// 改为：
const result = await AIBaziLayer.fullReading({
  birthDate, birthTime, focus
});
// result.personality → 显示在页面
// result.currentYearAnalysis → 显示在页面
// result.taioredAdvice → 显示在页面
```

### 7.2 错误处理

```javascript
// 网络失败 → 回退到现有静态文案
// API 超时 → 回退到现有静态文案
// LLM 输出格式错误 → 回退到现有静态文案
```

---

## 8. 性能与成本优化

### 8.1 缓存策略

```javascript
// 相同 birthDate + birthTime + focus 的请求
// 缓存分析结果 24 小时（八字数据不变）
// 缓存 key: SHA256(birthDate + birthTime + focus)
```

### 8.2 调用次数控制

| 页面 | API 调用次数 | 说明 |
|---|---|---|
| instant_reading.html | 1次 | 只做解读层 |
| full_bazi_reading.html | 2次 | 计算层 + 解读层 |
| report_demo.html | 1次 | 只生成水晶推荐理由 |

### 8.3 成本估算

- DeepSeek V4：`$0.001~0.01 / 1K tokens`
- 每次解读约 500-800 tokens 输出
- 单次用户请求成本：`< $0.01`

---

## 9. 实现顺序

```
Phase 1: 基础设施
  1. api_deepseek.js — API 封装
  2. prompts/system_analyze.txt
  3. prompts/user_analyze.txt
  4. prompts/system_reading.txt
  5. prompts/user_reading.txt

Phase 2: 计算层
  6. ai_bazi_layer.js — analyzeChart() 实现
  7. 单元测试：验证推理结果一致性

Phase 3: 解读层
  8. ai_bazi_layer.js — generateReading() 实现
  9. 人工审核：抽检输出文案质量

Phase 4: 接入
  10. instant_reading.html 接入
  11. full_bazi_reading.html 接入
  12. report_demo.html 接入（水晶推荐理由）
```

---

## 10. 质量门槛

- [ ] 计算层：相同输入必须产生相同输出（确定性）
- [ ] 解读层：英文可读性评分 ≥ 60（Flesch Reading Ease）
- [ ] 错误时：静默回退静态文案，用户无感知
- [ ] 响应时间：API 调用 ≤ 3 秒（超时处理）
