# Cloudflare Worker 代理部署指南

此 Worker 作为 Oriental Destiny 网站与 DeepSeek API 之间的安全代理，
确保 API Key 不会暴露在浏览器端。

---

## 部署步骤

### 1. 登录 Cloudflare Dashboard

访问 https://dash.cloudflare.com 并登录。

### 2. 创建 Worker

1. 左侧导航 → **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Create Worker**
4. 给 Worker 命名，例如：`oriental-destiny-api-proxy`
5. 点击 **Deploy**（先部署默认代码）

### 3. 编辑 Worker 代码

1. 进入刚创建的 Worker 详情页
2. 点击 **Edit code**
3. 删除默认代码，将 `worker/index.js` 中的内容完整粘贴进去
4. 点击 **Save and deploy**

### 4. 设置环境变量（关键步骤）

1. 在 Worker 详情页，点击 **Settings** → **Variables**
2. 添加一个 **Environment Variable**：
   - 名称：`DEEPSEEK_API_KEY`
   - 值：你的真实 DeepSeek API Key（以 `sk-` 开头）
3. 点击 **Save**

### 5. 绑定自定义域名（推荐）

1. Worker 详情页 → **Triggers** → **Custom Domains**
2. 点击 **Add Custom Domain**
3. 输入子域名，例如：`api-proxy.oriental-destiny.com`
4. 按提示完成 DNS 验证

如果不绑定自定义域名，也可以使用 Cloudflare 自动分配的 `*.workers.dev` 域名。

### 6. 更新网站配置

1. 打开网站代码中的 `config.js`
2. 将 `window.API_BASE_URL` 替换为你的 Worker URL：

```javascript
window.API_BASE_URL = "https://api-proxy.oriental-destiny.com";
// 或使用 workers.dev 域名：
// window.API_BASE_URL = "https://oriental-destiny-api-proxy.your-account.workers.dev";
```

3. 提交并推送代码到 GitHub（GitHub Pages 会自动更新）

---

## 验证部署

1. 打开浏览器开发者工具 → Network 面板
2. 访问网站的 **Free Instant Reading** 页面
3. 提交一个出生日期进行测试
4. 观察 Network 面板中的请求：
   - ✅ 应该看到你的 Worker URL（而不是 `api.deepseek.com`）
   - ✅ 请求头中不应包含 `Authorization: Bearer sk-...`
   - ✅ 响应应正常返回 AI 解读内容

---

## 安全特性

| 特性 | 说明 |
|------|------|
| **Key 隔离** | API Key 只存在于 Cloudflare 服务端环境变量中 |
| **来源校验** | Worker 内置 `ALLOWED_ORIGINS` 白名单（生产环境建议启用严格校验） |
| **CORS 控制** | Worker 处理跨域预检，仅允许指定来源访问 |
| **端点过滤** | Worker 仅允许 `chat/completions` 端点，防止滥用 |

---

## 故障排查

| 问题 | 排查方向 |
|------|----------|
| 网站显示 "API error" | 检查 `config.js` 中的 URL 是否正确；检查 Worker 是否部署成功 |
| Worker 返回 500 | 检查 Cloudflare 中是否设置了 `DEEPSEEK_API_KEY` 环境变量 |
| CORS 错误 | 检查 `ALLOWED_ORIGINS` 中是否包含你的网站域名 |
| 本地开发测试失败 | `ALLOWED_ORIGINS` 中需包含 `http://localhost:8080` 或你的本地服务器地址 |

---

## 费用说明

- Cloudflare Worker 免费额度：**10万次请求/天**
- Oriental Destiny 的流量完全在免费额度内
- DeepSeek API 费用不变（由 Worker 代理调用，计费方式与直接调用相同）
