# CyberSheep 赛博小羊 — 品牌首页

赛博小羊品牌入口页，展示旗下所有产品、公告、AI Coding 快速开始教程与开源项目。

**设计：** 采用 Sheep AI Plus（sheepaiplus.top）的设计语言 —— 青绿玻璃态、浅色 / 深色双主题、渐变文字、模型跑马灯。

## 项目结构

```
index.html                — 主页面（Hero + 7 个内容区块）
announcements/
  index.html              — 公告中心（自动渲染全部公告）
  *.html                  — 每条公告一个独立详情页
guide/
  index.html              — 快速开始中心（AI Coding 工具选择入口）
  codex-cli.html          — Codex CLI 配置教程
  codex-desktop.html      — Codex Desktop 配置教程
  claude-code.html        — Claude Code 配置教程
  claude-desktop.html     — Claude Desktop 配置教程
  network-tools.html      — 网络加速教程（FLClash + 机场）
tools/
  ccswitch.html           — 通用 CC Switch 配置生成工具
css/
  style.css               — 全站基础设计（CSS 变量驱动，浅/深双主题）
  guide.css               — 教程页与 CC Switch Widget 特有组件
  tools.css               — 配置工具页特有组件
js/
  main.js                 — 主题切换、仓库卡片渲染、邮箱复制
  announcements.js        — 公告数据 + 首页/公告中心列表渲染
  guide.js                — 教程页代码复制按钮
  ccswitch-presets.js     — CC Switch 配置预设（数据）
  ccswitch-core.js        — CC Switch Deep Link 生成核心（唯一一份逻辑）
  ccswitch-widget.js      — CC Switch 配置组件（Guide 页内嵌）
assets/                   — 图片素材（Logo、QQ 群二维码）
docs/superpowers/         — 设计文档与实现计划（spec + plan）
```

## 技术

纯静态 HTML + CSS + JS，无构建工具，无框架依赖，开箱即用，GitHub Pages 即可部署。

## 部署

本仓库通过 GitHub Pages 部署到 `cybersheep33.github.io`。推送 `main` 分支即可自动更新。

## 维护指南

### 新增公告

1. 复制 `announcements/` 中任意页面（或 `announcements/_template-embed.html`），改内容与文件名，例如 `announcements/new-feature.html`；
2. 在 `js/announcements.js` 的 `ANNOUNCEMENTS` 数组**最前面**加一条记录：

```js
{
  date: '2026-08-23',
  title: '公告标题',
  excerpt: '一句话摘要',
  slug: 'new-feature'   // 对应 announcements/new-feature.html
}
```

保存后首页（自动取最新 3 条）与公告中心（全部）都会自动更新，无需再改页面 HTML。

### 新增 Guide 教程

1. 在 `guide/` 下复制一个现有教程页（如 `guide/codex-cli.html`），改标题、步骤内容与 `data-preset`；
2. 在 `guide/index.html` 的 `.guide-grid` 里复制一张 `.guide-card`，指向新页面；
3. 可选：在首页「快速开始」区块（`index.html` 的 `.quickstart-grid`）增加入口卡片。

### 新增 CC Switch Preset

1. 打开 `js/ccswitch-presets.js`，在 `CCSWITCH_PRESETS` 里加一条对象：

```js
'preset-id': {
  id: 'preset-id',
  title: '显示名称',
  app: 'claude',            // CC Switch app 类型：claude / claude-desktop / codex / gemini / opencode / openclaw
                            // 注意：Claude Desktop 用 'claude-desktop'，与 Claude Code ('claude') 是两个独立应用
  name: 'sheepaiplus',      // 导入到 CC Switch 的供应商名称
  providerName: 'Sheep AI Plus',
  endpoint: 'https://...',  // 供应商 API 端点
  homepage: 'https://...',
  model: 'gpt-5.6-luna',    // 默认模型（可选，不填则用 CC Switch 内置默认）
  deeplinkSupported: true,  // 是否支持 CC Switch 深度链接一键导入；false 时页面改为展示手动配置步骤
  enabled: true,
  tag: '类型标签',
  desc: '一句话介绍'
}
```

> **关于 `deeplinkSupported`**：CC Switch V1 深度链接协议的 `app` 参数目前官方只列出 `claude / codex / gemini / opencode / openclaw`。虽然软件内部也能配置 Claude Desktop、Hermes、Pi 等，但深度链接一键导入未必支持。因此 Claude Desktop（`app=claude-desktop`）暂置 `deeplinkSupported: false`，教程页会自动展示「在 CC Switch 中手动新建配置」的步骤；等 CC Switch 支持后把该字段改成 `true` 即可开放一键导入，无需改页面代码。

> 常见问题：想改某个工具的默认模型（例如 Codex 默认用 `gpt-5.6-luna`）？直接改 `js/ccswitch-presets.js` 里对应 preset 的 `model` 字段即可，无需改任何页面代码。工具页也可以直接在「高级配置 → 默认模型」里临时覆盖。

2. Guide 页面用 `<div class="ccswitch-widget" data-preset="preset-id"></div>` 引用即可；工具页通过 `?preset=preset-id` 自动选中。

**Deep Link 校验：** 预设会生成 `ccswitch://v1/import?resource=provider&app=...&endpoint=...&apiKey=...&homepage=...&enabled=true`。确认 app 值在 CC Switch 官方允许范围内（`claude / codex / gemini / opencode / openclaw`），并到 [CC Switch 官方文档](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/5-faq/5.3-deeplink.md) 核对协议，不要凭印象编造参数。

**注意：** API Key 永远只存在于用户浏览器内存中，禁止写入 preset、localStorage、Cookie，禁止上传服务器或打印到 console。

### 小项目仓库

改 `js/main.js` 中的 `REPOS` 数组，新增 / 删除一条对象即可。

### 模型跑马灯

改 `index.html` 中 `.marquee-set` 内的 `logo-pill` 列表。

## 产品链接

- **Sheep AI Plus（API 平台）：** [sheepaiplus.top](https://sheepaiplus.top)
- **SheepAI Tools 工具平台：** [sheepaitools.github.io](https://sheepaitools.github.io)
- **博客：** [赛博小羊博客](https://flowus.cn/sheepblog/share/f94ab8ef-ca2e-4d63-9c6e-b4d4943b327f?code=8KZJQM)
- **SheepAI-Lab 开源组织：** [github.com/SheepAI-Lab](https://github.com/SheepAI-Lab)
- **CC Switch 官方仓库：** [github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch)

## 联系

📧 cybersheep33@gmail.com
