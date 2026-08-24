# 主页维护与更新规范

> 本文档说明 CyberSheep33.github.io **首页（index.html）** 的维护与更新方法。
> 新增/修改模块时请同时参考 [`module-guide.md`](module-guide.md) 与 [`module-maintenance.md`](module-maintenance.md)。

---

## 1. 首页结构

首页 = Hero + 6 个内容区块（`<section>`）：

```
Hero（#top）
├── 01 API 平台（#api）      Sheep AI Plus
├── 02 博客（#blog）          CyberSheep 博客
├── 03 快速开始（#quickstart） AI Coding 工具配置入口
├── 04 公告（#announcements） 最新 3 条 + 查看全部
├── 05 SheepAI-Lab（#lab）    开源组织
└── 06 赛博小羊小项目（#projects）仓库卡片
```

页面骨架由公共组件承载：

```html
<header class="site-header" id="siteHeader"></header>  <!-- site.js 注入 -->
<main>…各 section…</main>
<footer class="site-footer" id="siteFooter"></footer>  <!-- site.js 注入 -->
<script src="js/site.js"></script>
<script src="js/main.js"></script>
<script src="js/announcements.js"></script>
```

---

## 2. 各区块维护入口

| 区块 | 维护位置 | 说明 |
|---|---|---|
| Hero 文案 | `index.html` `.hero-copy` | 主标题、副标题、三个按钮 |
| 01 API 平台 | `index.html` `#api` 内 `.card-desc`、`#card-actions` | 描述、按钮（进入/模型广场/API 文档）、模型跑马灯 |
| 02 博客 | `index.html` `#blog` | 描述与「阅读博客」按钮链接 |
| 03 快速开始 | `index.html` `#quickstart` 内 `.quickstart-grid` | 入口卡片；完整内容在 `guide/index.html` |
| 04 公告 | 自动渲染 | 由 `js/announcements.js` 取最新 3 条，无需改首页 |
| 05 SheepAI-Lab | `index.html` `#lab` | 描述与链接 |
| 06 小项目 | `js/main.js` 的 `REPOS` 数组 | 增删仓库卡片 |

**导航**：统一在 `js/site.js` 的 `NAV` 数组维护，首页只渲染 `#siteHeader` 占位符，不直接写导航 HTML。

---

## 3. 新增 / 移除首页区块

### 新增区块

1. 在 `index.html` 的 `<main>` 里按现有 `<section class="section" id="xxx">` 结构新增一块；
2. 重新编号后续区块的 `.kicker`（01、02、03…），保证连续；
3. 如需出现在导航：在 `js/site.js` 的 `NAV` 加一项（首页区块用 `{ label, href: '#xxx', anchor: true }`）。

### 移除区块

1. 删除 `index.html` 中对应 `<section>…</section>`；
2. 重新编号后续区块；
3. 若 `NAV` 里有对应导航项，同步删除。

> 首页区块编号必须连续（01、02、03…），删除/新增后请检查所有 `kicker`。

---

## 4. 首页职责边界

首页是**品牌与生态入口**，不是所有内容的堆叠：

- 完整教程 → `guide/`；首页只放入口卡片。
- 全部公告 → `announcements/`；首页只显示最新 3 条。
- 配置工具 → `tools/ccswitch.html`；首页经快速开始卡片进入。

避免让首页继续无限增长。

---

## 5. 视觉 / 交互要求

- 沿用青绿玻璃态、CSS 变量、双主题（`html[data-theme]` + `cybersheep-theme`）。
- 按钮用 `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-ghost`。
- 外链一律 `target="_blank" rel="noopener"`。
- 装饰图标 `aria-hidden="true"`，图片有 `alt`。
- 移动端：导航可横向滚动，卡片单列，按钮全宽。

---

## 6. 发布

首页改动随 GitHub Pages 自动部署：提交到 `main` 并推送即生效。
