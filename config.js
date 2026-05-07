/**
 * API Configuration — Oriental Destiny
 *
 * 安全说明：
 * - 此文件不再包含任何 API Key
 * - 网站通过 Cloudflare Worker 代理调用 DeepSeek API
 * - 请将 Worker 部署后的 URL 填入下方，替换占位符
 *
 * Worker 代码位于：worker/index.js
 * 部署指南见：worker/README.md
 */

window.API_BASE_URL = "https://your-worker.your-subdomain.workers.dev";
