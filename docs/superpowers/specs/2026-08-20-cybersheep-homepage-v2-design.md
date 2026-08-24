# CyberSheep 赛博小羊 — 品牌主页 v2 重新设计

**日期：** 2026-08-20
**状态：** 已确认
**参考设计：** Sheep AI Plus 主页 hero 组件（`.local/sheepaiplus-homepage.html`）

---

## 1. 背景与目标

赛博小羊（CyberSheep）是 Sheep AI 系列品牌的品牌母体。近期聚合平台从 Sheep AI 升级为 **Sheep AI Plus**（sheepaiplus.top），因此主页需要：

1. 将所有 Sheep AI 入口替换为 Sheep AI Plus（文案 + 链接统一为 `sheepaiplus.top`）
2. 参考 Sheep AI Plus 主页的设计语言（`.local` 中的 hero 组件）重新设计赛博小羊主页
3. 展示内容扩展为：API 平台、工具箱、博客、公告、SheepAI-Lab（GitHub 组织）、赛博小羊小项目仓库（可增删）

### 核心原则

- **品牌统一** — 视觉语言与 Sheep AI Plus 完全一致（青绿渐变、玻璃面板、浮动光斑、渐变文字、logo 药丸、模型跑马灯）
- **品牌保留** — 页面仍以 CyberSheep 赛博小羊为身份，不复制 sheepaiplus.top 的整页内容
- **内容可扩展** — 公告为静态列表（改 HTML 维护），小项目仓库为 JS 数组渲染（改数组维护）
- **双主题** — 浅色 + 深色，跟随系统 + 手动切换 + localStorage 记忆

---

## 2. 技术方案

纯静态 HTML + CSS + JS，无构建工具，无框架依赖。

| 文件 | 操作 | 说明 |
|------|------|------|
| `index.html` | 重写 | 多区块滚动单页 |
| `css/style.css` | 重写 | .local 设计语言，CSS 变量驱动，双主题 |
| `js/main.js` | 重写 | 主题切换 + 仓库数组渲染 + 邮箱复制 |
| `README.md` | 更新 | 反映新设计 |
| `assets/cybersheep.png` | 保留 | 品牌 logo / 羊形象 |
| `assets/QQ-group-qcode.jpg` | 保留 | 社群二维码 |

- 字体：系统字体栈（`-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`），不引 Google Fonts
- 模型 logo：`https://unpkg.com/@lobehub/icons-static-svg@latest/icons/*.svg`（与 .local 一致）
- 无外部图标库，交互图标用 emoji / 内联 SVG

---

## 3. 配色系统（取自 .local，双主题）

### 3.1 浅色主题

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg` | `linear-gradient(180deg, #f7fbfa 0%, #ffffff 52%, #f1faf7 100%)` | 页面背景 |
| `--fg` | `#17342f` | 主文字 |
| `--muted` | `#59716d` | 辅助文字 |
| `--soft` | `#7b8f8b` | 次要文字 |
| `--panel` | `rgba(255,255,255,0.76)` | 玻璃面板 |
| `--panel-strong` | `rgba(255,255,255,0.92)` | 强玻璃面板 |
| `--border` | `rgba(185,223,212,0.86)` | 面板边框 |
| `--primary` | `#0f766e` | 品牌主色 |
| `--primary-2` | `#059669` | 品牌渐变 |
| `--primary-3` | `#0ea5a8` | 品牌渐变 |
| `--glow-1` | `rgba(34,197,94,0.08)` | 光斑 1 |
| `--glow-2` | `rgba(14,165,168,0.06)` | 光斑 2 |

### 3.2 深色主题

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg` | `linear-gradient(180deg, #071816 0%, #0a1413 45%, #0d1a18 100%)` | 页面背景 |
| `--fg` | `#eefaf6` | 主文字 |
| `--muted` | `#b4cbc5` | 辅助文字 |
| `--soft` | `#8fa6a0` | 次要文字 |
| `--panel` | `rgba(10,27,24,0.62)` | 玻璃面板 |
| `--panel-strong` | `rgba(12,31,27,0.82)` | 强玻璃面板 |
| `--border` | `rgba(44,85,77,0.85)` | 面板边框 |
| `--primary` | `#34d399` | 品牌主色 |
| `--primary-2` | `#10b981` | 品牌渐变 |
| `--primary-3` | `#2dd4bf` | 品牌渐变 |
| `--glow-1` | `rgba(52,211,153,0.10)` | 光斑 1 |
| `--glow-2` | `rgba(45,212,191,0.08)` | 光斑 2 |

### 3.3 主题机制

- `html` 或 `body` 上设置 `data-theme="light" | "dark"`
- 默认：跟随 `prefers-color-scheme`
- 手动切换按钮：右上角，点击后 `localStorage.setItem('theme', ...)`，下次加载优先读取
- 所有颜色经 CSS 变量，深色只需覆盖变量值

---

## 4. 页面结构（自上而下）

```
Header
  ├ CyberSheep logo (cybersheep.png) + 品牌名
  ├ 锚点导航：API平台 / 工具箱 / 博客 / 公告 / SheepAI-Lab / 项目
  └ 🌙 主题切换按钮

HERO（左文右羊）
  ├ 左：渐变标题「赛博小羊」+ 英文 CyberSheep + 副标题 + CTA 组
  │     CTA：主「进入 Sheep AI Plus」→ sheepaiplus.top
  │         次「打开工具箱」→ sheepaitools.github.io
  │         文字链「SheepAI-Lab」→ github.com/SheepAI-Lab
  ├ 右：羊形象 (assets/cybersheep.png) + 2 张 signal 玻璃卡
  └ 背景：浮动光斑 (dot)

01 · API 平台 —— Sheep AI Plus
  ├ 玻璃卡：标题「Sheep AI Plus · AI API 聚合平台」
  ├ 说明：透明定价、真实 USD、统一接入多模型、兼容 OpenAI SDK
  ├ 模型跑马灯（复用 .local marquee：OpenAI/Claude/Gemini/Grok/DeepSeek/Qwen 等）
  └ CTA「进入平台」→ https://sheepaiplus.top

02 · 工具箱 —— SheepAI Tools
  └ 玻璃卡 → https://sheepaitools.github.io

03 · 博客 —— CyberSheep 博客
  └ 玻璃卡 → https://flowus.cn/sheepblog/share/f94ab8ef-ca2e-4d63-9c6e-b4d4943b327f?code=8KZJQM

04 · 公告
  └ 静态列表（带时间戳），示例 2 条：
      - Sheep AI 已升级为 Sheep AI Plus
      - sheepai-creator 桌面应用上线
    （改 HTML 维护，可增删）

05 · SheepAI-Lab —— GitHub 组织
  └ 玻璃卡 → https://github.com/SheepAI-Lab

06 · 赛博小羊小项目 —— 仓库卡片网格
  ├ 由 js/main.js 中 REPOS 数组渲染
  ├ 初始 2 个：
  │   - sheepai-creator  (TypeScript) 跨平台 AI 图像/视频创作桌面应用
  │   - sheepai-hud      (Swift)      SheepAI 用户信息/余额/用量桌面小组件
  ├ 卡片：仓库名 + 简介 + 语言标签 + GitHub 链接
  └ 新增项目 = 数组加一行（sheepai-skills 待有简介后再加）

Footer
  ├ QQ 群二维码 + 说明
  ├ 邮箱 cybersheep33@gmail.com（点击复制）
  └ © 2026 CyberSheep 赛博小羊
```

---

## 5. 组件详细设计

### 5.1 Header

- `position: sticky` 顶部，浅色下为半透明玻璃、深色下为半透明深色
- Logo 左对齐（`assets/cybersheep.png` 38px，圆角）
- 锚点导航 pill 样式（与 .local 的 `logo-pill` 视觉一致）
- 主题切换按钮：🌙/☀️ 图标切换

### 5.2 Hero

- 左文右羊两栏（桌面），单栏堆叠（手机）
- 品牌标题使用渐变文字：`background-clip: text` + 品牌渐变
- 副标题色 `--muted`，行高 1.78
- 右侧羊形象置于玻璃面板内（.local 的 `logo-icon` 风格），带 drop-shadow
- 背景浮动光斑复用 .local `dot` 元素（三个不同尺寸/位置）

### 5.3 区块通用卡片

每个内容区块用 `.section` + `.section-card`：

- 圆角 22-28px，`--panel` 玻璃背景，`backdrop-filter: blur(14-16px)`
- 边框 `--border`，阴影 `--shadow`
- hover 微上移 + 阴影加深
- 每个区块有编号 kicker（`01 · API 平台`）—— 等宽字体、`--primary` 色

### 5.4 模型跑马灯（API 区块内）

直接复用 .local 的结构：

- 一条 marquee row（`left` 动画），track 内为两份相同的 `marquee-set` 实现无缝循环
- 每个模型为 `logo-pill`：圆角药丸 + 白底图标 + 名称
- 图标来自 `@lobehub/icons-static-svg`
- 示例：OpenAI / Claude / Gemini / Grok / DeepSeek / Qwen / Zhipu AI / Kimi / MiniMax / Doubao

### 5.5 公告列表

- 每条公告：日期标签（等宽字体、小字号）+ 标题 + 可选的说明文字
- 列表容器玻璃卡
- 维护方式：直接改 HTML，复制一条 `<li>` 即可新增

### 5.6 仓库卡片（JS 渲染）

`js/main.js`：

```js
const REPOS = [
  {
    name: 'sheepai-creator',
    desc: '跨平台 AI 图像 / 视频创作桌面应用',
    lang: 'TypeScript',
    url: 'https://github.com/SheepAI-Lab/sheepai-creator',
  },
  {
    name: 'sheepai-hud',
    desc: 'SheepAI 用户信息、余额与 API Token 用量桌面小组件',
    lang: 'Swift',
    url: 'https://github.com/SheepAI-Lab/sheepai-hud',
  },
]
```

- 页面加载时把 REPOS 渲染成 `.repo-grid` 卡片网格
- 每张卡片：仓库名（等宽/粗体）+ 简介 + 语言标签 pill + GitHub 链接
- 语言标签色可用简单映射（TypeScript → 蓝，Swift → 橙）或统一主题色

---

## 6. 链接汇总（Sheep AI → Sheep AI Plus 替换）

| 位置 | 原链接 | 新链接 | 文案 |
|------|--------|--------|------|
| Header 导航 | — | `https://sheepaiplus.top` | API 平台 |
| Hero 主 CTA | `www.sheepai.top` | `https://sheepaiplus.top` | 进入 Sheep AI Plus |
| 01 API 平台 | `www.sheepai.top` | `https://sheepaiplus.top` | Sheep AI Plus |
| 02 工具箱 | `sheepaitools.github.io` | 不变 | SheepAI Tools |
| 03 博客 | flowus | 不变 | CyberSheep 博客 |
| 05 SheepAI-Lab | — | `https://github.com/SheepAI-Lab` | SheepAI-Lab |
| 06 仓库 | — | `https://github.com/SheepAI-Lab/<repo>` | — |
| Footer | — | `https://sheepaiplus.top` | Sheep AI Plus |

---

## 7. 交互清单

1. **主题切换**：右上角按钮，localStorage + prefers-color-scheme，切换时更新 `data-theme`
2. **邮箱复制**：点击 cybersheep33@gmail.com 复制 + toast 提示（保留现有逻辑）
3. **仓库卡片渲染**：REPOS 数组 → DOM
4. **锚点导航**：平滑滚动到对应区块

---

## 8. 响应式断点

| 断点 | 布局 |
|------|------|
| ≥1024px | Hero 左右两栏；仓库网格 3 列；导航完整显示 |
| 640–1023px | Hero 单栏居中；仓库网格 2 列；导航收窄 |
| <640px | 单栏堆叠；导航只保留关键项或收进按钮；模型跑马灯保留但边距收紧 |

---

## 9. 验收标准

- [ ] 所有 Sheep AI 入口已替换为 Sheep AI Plus（文案 + `sheepaiplus.top`）
- [ ] 页面为滚动式多区块单页，含 API 平台 / 工具箱 / 博客 / 公告 / SheepAI-Lab / 小项目
- [ ] 视觉语言与 .local（Sheep AI Plus）一致：青绿渐变、玻璃面板、浮动光斑、渐变文字
- [ ] 浅色 / 深色主题可切换，localStorage 记忆，默认跟随系统
- [ ] API 区块含模型跑马灯
- [ ] 小项目区块由 REPOS 数组渲染，初始含 sheepai-creator、sheepai-hud
- [ ] 公告为内嵌静态列表（≥1 条）
- [ ] QQ 群二维码 + 邮箱复制保留
- [ ] 桌面 / 平板 / 手机响应式正常
