# 现有模块维护与更新规范

> 本文档说明 CyberSheep33.github.io **各已有模块**的日常维护方法。
> 新增模块的开发规范见 [`module-guide.md`](module-guide.md)；首页维护见 [`homepage-guide.md`](homepage-guide.md)。

当前已实现模块：

- **模型广场** `models/`
- **公告中心** `announcements/`
- **快速开始 / 教程中心** `guide/`
- **配置工具** `tools/`

每个模块都遵循统一骨架：页面只写 `<main>` 内容，Header/Footer/Toast 由 `js/site.js` 注入。

---

## 1. 公告模块 `announcements/`

### 结构

```
announcements/
  index.html                  # 公告中心（列表，自动渲染全部）
  _template-embed.html        # 嵌入型公告模板（以 _ 开头，不会被 Jekyll 发布）
  *.html                      # 每条公告一个独立页
```

### 新增一条公告

1. **建公告页**：复制任意现有公告页（或 `_template-embed.html`），改为新 slug，如 `announcements/new-feature.html`；
2. **登记数据**：在 `js/announcements.js` 的 `ANNOUNCEMENTS` 数组**最前面**加一条：

```js
{
  date: '2026-08-24',
  title: '公告标题',
  excerpt: '一句话摘要',
  slug: 'new-feature'   // 对应 announcements/new-feature.html
}
```

首页（自动取最新 3 条）与公告中心（全部）都会自动更新。

### 嵌入型公告（风格独立的自定义 HTML）

- 复制 `_template-embed.html`，把内容粘贴到 `.announce-embed` 内；
- 样式选择器加 `.announce-embed` 前缀做作用域隔离；
- 示例见 `announcements/billing-comparison.html`。

### 注意事项

- 日期格式 `YYYY-MM-DD`；
- 外链 `target="_blank" rel="noopener"`；
- 不要修改 `announcements/index.html` 的列表 HTML（由 JS 渲染）。

---

## 2. 快速开始 / 教程模块 `guide/`

### 结构

```
guide/
  index.html               # 快速开始中心（卡片网格）
  codex-cli.html           # Codex CLI 教程
  codex-desktop.html       # Codex Desktop 教程
  claude-code.html         # Claude Code 教程
  claude-desktop.html      # Claude Desktop 教程
  claude-code-deepseek.html# Claude Code × DeepSeek（本地路由）
  codex-deepseek.html      # Codex × DeepSeek（本地路由）
  network-tools.html       # 网络加速教程（FLClash + 机场）
```

### 新增一篇教程

1. **建页面**：在 `guide/` 复制一个现有教程页（如 `claude-code.html`），改标题、副标题、步骤内容；
2. **登记卡片**：在 `guide/index.html` 的 `.guide-grid` 复制一张 `.guide-card` 指向新页面；
3. **（可选）首页入口**：如需在首页「快速开始」区块加入口，复制 `index.html` 里 `.quickstart-card` 一条。

### 教程页统一结构

教程页遵循「步骤卡片」结构：`.guide-step` + `.guide-step-head` + `.guide-para` + `.guide-step-actions`。

通用步骤：① 安装环境（Node.js/Git）→ ② 安装工具 → ③ 安装 CC Switch → ④ 注册 Sheep AI Plus → ⑤ 创建 API Key → ⑥ 配置 CC Switch / 一键导入 → ⑦ 启动验证。

### 涉及 CC Switch 配置时

- 支持一键导入的工具：页面内嵌 `<div class="ccswitch-widget" data-preset="xxx"></div>`；
- 需要新增 preset：改 `js/ccswitch-presets.js`（见下）；
- **上游协议 / 本地路由类**（如 DeepSeek）：页面写手动配置步骤，并注明「上游格式」与「开启本地路由」的路径（设置 → 路由 → 本地路由总开关 → 对应应用路由开关）。

### 网络加速教程（network-tools.html）

- 机场推荐与链接维护在该页面；
- FLClash 下载指向官方站 `https://flclash.dev/#download`；
- CC Switch 等下载页需提示「跳转 GitHub，建议开启加速」。

---

## 3. 配置工具模块 `tools/`

### 结构

```
tools/
  ccswitch.html            # CC Switch 一键配置生成器
css/tools.css              # 工具页私有样式
js/ccswitch-presets.js     # CC Switch 配置预设（数据）
js/ccswitch-core.js        # Deep Link 生成核心（唯一一份逻辑）
js/ccswitch-widget.js      # 页面内嵌配置组件
```

### 新增 / 修改 CC Switch 预设

打开 `js/ccswitch-presets.js`，在 `CCSWITCH_PRESETS` 加一条对象：

```js
'preset-id': {
  id: 'preset-id',
  title: '显示名称',
  app: 'claude',            // app 类型：claude / claude-desktop / codex / gemini / opencode / openclaw
  name: 'sheepaiplus',
  providerName: 'Sheep AI Plus',
  endpoint: 'https://...',
  homepage: 'https://...',
  model: 'gpt-5.6-luna',    // 默认模型（可选）
  deeplinkSupported: true,  // false 时页面自动展示手动配置步骤
  enabled: true,
  tag: '类型标签',
  desc: '一句话介绍'
}
```

- 工具页通过 `?preset=xxx` 自动选中；教程页通过 widget 的 `data-preset` 引用。
- 修改预设只需改这一个文件，无需改页面。
- Deep Link 协议以 CC Switch 官方 V1 为准，不要凭印象编造 `app` 值。

### 安全红线

- API Key 永远只在浏览器内存中用于生成 Deep Link；
- 禁止写入 preset、localStorage / Cookie，禁止上传、禁止打印到 console；
- 工具页 Deep Link 预览必须打码 API Key。

---

## 4. 模型广场模块 `models/`

### 结构

```
models/
  index.html             # 模型广场（搜索 / 筛选 / 排序 / 各分组价格）
css/models.css           # 模型广场私有样式
js/models.js             # 渲染逻辑（搜索、筛选、价格计算、分组展开）
assets/models-data.js    # 模型数据快照（script 注入为 window.MODELS_DATA）
```

### 数据来源与更新

模型广场为**纯静态**：数据来自 `assets/models-data.js`（通过 `<script>` 注入），
**不实时请求上游**（`/api/pricing` 无 CORS 头，且本地 file:// 下 fetch 本地文件会被拦截，
所以用 script 注入而不是 fetch）。

**更新数据 = 重新生成 `assets/models-data.js`**。完整步骤见 [`docs/models-update-guide.md`](models-update-guide.md)。

快照结构（由上游 `/api/pricing` 精简而来）：

```js
window.MODELS_DATA = {
  "data": [ /* 模型数组 */ ],
  "group_ratio": { "AWS-Bedrock-1": 0.44118, ... },   // 分组倍率
  "usable_group": { "AWS-Bedrock-1": "AWS Bedrock Resources" }, // 分组描述
  "vendors": [ { "id": 55, "name": "Anthropic", "icon": "Claude.Color" } ],
  "supported_endpoint": { "openai": { "path": "...", "method": "POST" } }, // 端点路径
  "fetched_at": "2026-08-24"
};
```

模型对象保留字段：`model_name, description, tags, model_type, model_ratio, completion_ratio,
cache_ratio, cache_creation_5m_ratio, cache_creation_1h_ratio, enable_groups,
supported_endpoint_types, quota_type, model_price, usage_count, available, icon, type, vendor_id`。

### 价格计算（已按真实计费日志校验）

基础价（$/1M tokens）：

- 基础输入 = `model_ratio × 2`
- 补全 = 输入 × `completion_ratio`
- 缓存命中 = 输入 × `cache_ratio`
- 5m 缓存创建 = 输入 × `cache_creation_5m_ratio`
- 1h 缓存创建 = 输入 × `cache_creation_1h_ratio`

**某分组下最终价 = 基础价 × (group_ratio[分组] × 1.4)**。

校验锚点：

- gpt-5.6-sol（model_ratio=2.5）：基础输入 $5；Codex-Gpt-2（group_ratio 0.05883）分组倍率
  0.05883×1.4=0.08236，与真实计费日志一致 ✓
- claude-opus-5 在 AWS-Bedrock-1（group_ratio 0.44118）：输入 = 5 × 0.44118 × 1.4 = 3.088 ✓

> 分组倍率 `group_ratio` 直接来自上游数据，更新快照时一并更新，无需单独维护。
> 非 Token 模型（quota_type ≠ 0）直接展示 `model_price`（如按张/按秒计费）。

### 注意事项

- 价格仅为估算（按上述公式），页面已注明「以平台实际扣费为准」；
- 快照文件约 280KB，字段已精简；
- **可用分组白名单**：`js/models.js` 顶部的 `AVAILABLE_GROUPS`（来自「Sheep AI 与 Sheep AI Plus 分组对照」CSV）。
  分组筛选与详情页计价只展示白名单内的分组，自动剔除 API 里的内部测试 / 特供 / 专线等不开放分组。
  若上游新增开放分组，需同步把分组名加进 `AVAILABLE_GROUPS`；
- **品牌归属修正**：`js/models.js` 顶部的 `BRAND_OVERRIDES` 用于纠正上游 `/api/pricing`
  中个别模型 vendor 标错的问题（如 `aigc-image-kling` 被误标为腾讯，已改归 Kling）。
  新增错放时，把「模型名 → 正确 vendor_id」加进该映射即可，无需改数据文件；
- 本地调试请直接双击打开 `models/index.html`，需保证 `models-data.js` 在 `models.js` 之前引入。

---

## 5. 公共数据与脚本

| 文件 | 职责 | 维护时机 |
|---|---|---|
| `js/site.js` | Header/Footer/Toast 渲染、`NAV` 导航注册 | 改导航 / 品牌信息 / 新增模块 |
| `js/main.js` | 主题切换、`REPOS` 仓库卡片、邮箱复制 | 增删小项目 |
| `js/announcements.js` | 公告数据与列表渲染 | 新增公告 |
| `js/guide.js` | 教程页代码复制按钮 | 一般不用改 |
| `js/ccswitch-*.js` | CC Switch 预设 / 核心 / 组件 | 改预设 / 协议 |

---

## 6. 修改后验证清单

- [ ] 相对路径正确（首页 `js/…`，子目录 `../js/…`）
- [ ] `site.js` 在 `main.js` 之前加载
- [ ] 本地服务器全部 200；双击 `index.html`（file://）正常
- [ ] 浅/深色正常、移动端正常
- [ ] 外链带 `rel="noopener"`；无 API Key 硬编码
