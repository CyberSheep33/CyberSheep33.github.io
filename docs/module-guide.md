# CyberSheep 生态模块开发与维护规范

> 本文档说明如何在 CyberSheep33.github.io 上新增、维护生态模块。
> 适用于纯静态、无构建工具、GitHub Pages 直跑的架构。

---

## 1. 站点架构总览

CyberSheep33.github.io 是赛博小羊 AI 生态的统一入口，采用「公共组件 + 模块化区块」的静态架构：

```
网站
├── 全局组件    js/site.js（统一渲染 Header / Footer / Toast）
├── 公共布局    所有页面共享顶部导航、页脚、主题、基础样式（css/style.css）
├── 页面模块    announcements / guide / tools …（每个模块一个独立目录）
└── 静态数据    js/announcements.js 等数据文件
```

**核心原则：**

- 每个页面只负责自己的 `<main>` 内容，公共部分交给 `js/site.js`。
- 页面之间共享同一套设计语言（CSS 变量、按钮、卡片、双主题），禁止引入第二套样式。
- 纯静态，不加后端、不引入构建工具、不引入框架。

---

## 2. 目录结构约定

每个生态模块对应仓库根目录下一个独立文件夹：

```
announcements/   # 公告模块
  index.html     # 模块入口（列表页）
  *.html         # 模块内页面
guide/           # 快速开始 / 教程模块（知识中心）
tools/           # 工具模块
download/        # 【未来】下载中心
about/           # 【未来】关于
models/          # 【未来】模型广场（暂不规划）
```

约定：

- 每个模块必须有 `index.html` 作为入口页。
- 模块内私有样式放到 `css/<module>.css`（如 `guide.css`、`tools.css`），基础样式一律复用 `css/style.css`。
- 模块内脚本放 `js/`，并在 `site.js` 或页面中按需引入。

---

## 3. 新增一个生态模块（三步）

以新增 `download/` 模块为例：

### 3.1 创建模块目录与页面

```
download/
  index.html   # 模块入口页
```

每个页面使用统一模板（见第 4 节）：只写 `<main>` 内容，公共 Header/Footer 由占位符承载。

### 3.2 登记到导航

打开 `js/site.js`，在 `NAV` 数组里登记一项：

```js
var NAV = [
  // …
  { label: '下载', href: 'download/index.html', section: 'download' },
  // …
]
```

- **独立首页的模块**：用页面链接（如 `'download/index.html'`）。
- **首页区块类模块**：用锚点（如 `{ label: '博客', href: '#blog', anchor: true }`）。
- `section` 字段用于子页面导航高亮：当 `location.pathname` 匹配 `/download/` 时，该项自动加 `aria-current`。

### 3.3 校验

- `site.js` 会自动判断目录并补 `../` 前缀，无需手动写死路径。
- 用浏览器 / 本地服务器验证：入口页可达、导航高亮正确、浅/深色正常、移动端正常。

> 若新模块不需要出现在主导航（例如仅作为子工具页），可跳过 3.2，只建目录与页面。

---

## 4. 页面模板规范

所有页面遵循同一骨架：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="…">
  <title>页面标题 — CyberSheep 赛博小羊</title>
  <link rel="stylesheet" href="css/style.css">        <!-- 基础样式，必引 -->
  <link rel="stylesheet" href="css/guide.css">          <!-- 模块样式，按需 -->
  <link rel="icon" href="data:image/svg+xml,…">
</head>
<body>
  <header class="site-header" id="siteHeader"></header> <!-- site.js 注入 -->
  <main>…页面内容…</main>
  <footer class="site-footer" id="siteFooter"></footer> <!-- site.js 注入 -->
  <script src="js/site.js"></script>                    <!-- 必须在 main.js 之前 -->
  <script src="js/main.js"></script>                    <!-- 主题/邮箱/仓库渲染 -->
  <script src="js/…"></script>                          <!-- 页面私有脚本 -->
</body>
</html>
```

注意事项：

- 相对路径：首页脚本用 `js/…`，子目录（如 `guide/`）用 `../js/…`。CSS 同理。
- `site.js` **必须**在 `main.js` 之前加载（`main.js` 依赖其注入的 `#themeToggle` / `#emailLink` / `#toast`）。
- 不需要手动写 `<div class="toast">`，`site.js` 会自动补齐。
- 外链一律 `target="_blank" rel="noopener"`。

---

## 5. 设计语言规范

新增内容必须复用现有视觉语言，禁止重新定义一套：

- **颜色 / 主题**：使用 `css/style.css` 的 CSS 变量（`--primary`、`--panel`、`--border`、`--fg`、`--muted` 等），浅/深双主题由 `html[data-theme]` 自动处理。
- **按钮**：`.btn` / `.btn-primary` / `.btn-secondary` / `.btn-ghost`。
- **卡片**：`.section-card`、`.guide-card`、`.repo-card` 等。
- **圆角 / 阴影**：`--radius-lg` / `--radius-md` / `--radius-pill`、`--shadow`。
- **禁止**：引入 Bootstrap/Tailwind/Vue/React 等框架；复制一套新 CSS；改变主题机制。
- 新模块的私有样式尽量只定义「该模块特有组件」，放 `css/<module>.css`。

---

## 6. 静态约束

- 不加后端、不加数据库。
- 不引入 Node 构建 / Webpack / Vite。
- 所有资源相对引用，保证 GitHub Pages 与本地双击 `file://` 都能打开。
- 新增第三方安装包一律外链官方来源，不在仓库内托管安装文件。

---

## 7. 常见维护任务速查

### 新增公告

1. 复制 `announcements/_template-embed.html`（嵌入型）或任意公告页，改为新 slug；
2. 在 `js/announcements.js` 的 `ANNOUNCEMENTS` 数组**最前面**加一条记录（date / title / excerpt / slug）。

### 新增教程

1. 在 `guide/` 复制一个现有教程页，改标题与步骤；
2. 在 `guide/index.html` 的 `.guide-grid` 加一张 `.guide-card`；
3. 可选：在首页「快速开始」区块加入口卡片。

### 新增 CC Switch 预设

1. 在 `js/ccswitch-presets.js` 的 `CCSWITCH_PRESETS` 加一条对象（`app` / `endpoint` / `model` / `deeplinkSupported` 等）；
2. 页面用 `<div class="ccswitch-widget" data-preset="xxx"></div>` 引用。

### 修改导航 / 品牌信息

统一改 `js/site.js` 里的 `NAV` / `BRAND_IMG` / `EMAIL` / `COPYRIGHT`，全站生效。

---

## 8. 验证清单

新增或修改模块后，至少检查：

- [ ] 入口页与内部链接可访问（本地服务器 200）
- [ ] 双击 `index.html`（`file://`）导航、主题、链接正常
- [ ] 浅色 / 深色模式正常
- [ ] 桌面 / 平板 / 手机（约 375px）布局正常
- [ ] `site.js` 在 `main.js` 之前加载
- [ ] 外链均带 `rel="noopener"`；装饰图标 `aria-hidden`；表单有 `<label>`
- [ ] 无 API Key / 敏感信息硬编码
