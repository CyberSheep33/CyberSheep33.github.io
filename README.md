# CyberSheep 赛博小羊 — 品牌首页

赛博小羊品牌入口页，展示旗下所有产品、公告与开源项目。

**设计：** 采用 Sheep AI Plus（sheepaiplus.top）的设计语言 —— 青绿玻璃态、浅色 / 深色双主题、渐变文字、模型跑马灯。

## 项目结构

```
index.html          — 主页面（Hero + 6 个内容区块）
announcements/       — 公告独立页（每条公告一个 HTML）
css/style.css       — 样式（CSS 变量驱动，浅/深双主题）
js/main.js          — 交互（主题切换、仓库卡片渲染、邮箱复制）
assets/              — 图片素材（Logo、QQ 群二维码）
docs/superpowers/    — 设计文档与实现计划（spec + plan）
```

## 技术

纯静态 HTML + CSS + JS，无构建工具，无框架依赖，开箱即用。

## 部署

本仓库通过 GitHub Pages 部署到 `cybersheep33.github.io`。
推送 `main` 分支即可自动更新。

## 维护指南

- **公告**：每条公告是 `announcements/` 下的一个独立 HTML 页（如 `announcements/sheep-ai-plus-upgrade.html`，可单独分享 `cybersheep33.github.io/announcements/xxx.html`）。新增步骤：① 复制 `announcements/` 中任意页面，改内容与文件名；② 在 `index.html` 的 `.announce-list` 复制一条 `.announce-item`，把链接指向新页面
- **嵌入型公告**：风格独立的自定义 HTML（自带样式/脚本）可作为公告直接插入壳页。复制 `announcements/_template-embed.html` 使用：内容粘贴到 `.announce-embed` 内，样式选择器加 `.announce-embed` 前缀做隔离。参考示例：`announcements/billing-comparison.html`。注意 `_template-embed.html` 以 `_` 开头，不会被 GitHub Pages（Jekyll）发布
- **小项目仓库**：改 `js/main.js` 中的 `REPOS` 数组，新增 / 删除一条对象即可
- **模型跑马灯**：改 `index.html` 中 `.marquee-set` 内的 `logo-pill` 列表

## 产品链接

- **Sheep AI Plus（API 平台）：** [sheepaiplus.top](https://sheepaiplus.top)
- **SheepAI Tools 工具平台：** [sheepaitools.github.io](https://sheepaitools.github.io)
- **博客：** [赛博小羊博客](https://flowus.cn/sheepblog/share/f94ab8ef-ca2e-4d63-9c6e-b4d4943b327f?code=8KZJQM)
- **SheepAI-Lab 开源组织：** [github.com/SheepAI-Lab](https://github.com/SheepAI-Lab)

## 联系

📧 cybersheep33@gmail.com
