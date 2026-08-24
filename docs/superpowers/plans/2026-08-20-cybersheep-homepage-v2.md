# CyberSheep 主页 v2 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将赛博小羊主页重写为 Sheep AI Plus 设计语言（青绿玻璃态、双主题、滚动多区块），并把所有 Sheep AI 入口替换为 Sheep AI Plus。

**Architecture:** 纯静态单页 `index.html` + 重写 `css/style.css`（CSS 变量驱动、浅/深双主题）+ 重写 `js/main.js`（主题切换、仓库卡片渲染、邮箱复制）。设计细节见 spec：`docs/superpowers/specs/2026-08-20-cybersheep-homepage-v2-design.md`。视觉参考组件在 `.local/sheepaiplus-homepage.html`（已被 gitignore，不提交）。

**Tech Stack:** 原生 HTML + CSS + JS，无构建工具。模型图标来自 `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/*.svg`。

## Global Constraints

- 所有产品名统一为 **Sheep AI Plus**，API 平台入口链接统一为 **`https://sheepaiplus.top`**（严禁出现 `www.sheepai.top`）
- 工具箱：`https://sheepaitools.github.io`；博客：`https://flowus.cn/sheepblog/share/f94ab8ef-ca2e-4d63-9c6e-b4d4943b327f?code=8KZJQM`；SheepAI-Lab：`https://github.com/SheepAI-Lab`
- 仓库项目初始仅 **2 个**：`sheepai-creator`（TypeScript）、`sheepai-hud`（Swift）。**不放** sheepai-skills（暂无简介）
- 品牌主色渐变（浅色）：`#0f766e → #059669 → #0ea5a8`；（深色）：`#34d399 → #10b981 → #2dd4bf`
- 双主题：`html[data-theme]` 驱动，`localStorage` key 用 `cybersheep-theme`，默认跟随 `prefers-color-scheme`
- 保留资产：`assets/cybersheep.png`、`assets/QQ-group-qcode.jpg`
- 不引入任何第三方 JS/框架，不引 Google Fonts（系统字体栈）
- 每个任务结束时用本地服务器目验 + 提交

---

### Task 1: 重写 `index.html`（完整页面结构 + Sheep AI Plus 替换）

**Files:**
- Modify: `index.html`（整体重写）

**Interfaces:**
- Produces: 稳定的 DOM 结构 / class 命名 / 区块 id，供 Task 2（CSS）与 Task 3（JS）消费：
  - `html[data-theme]`、`#themeToggle`（主题按钮，初始文案 `🌙`）
  - 区块 id：`top`、`api`、`tools`、`blog`、`announcements`、`lab`、`projects`
  - 仓库网格容器：`<div class="repo-grid" id="repoGrid">`（Task 3 的 JS 往这里注入卡片）
  - toast 容器：`<div class="toast" id="toast">`、邮箱按钮：`#emailLink`
  - 导航锚点 class：`.site-nav`；按钮 class：`.btn` / `.btn-primary` / `.btn-secondary` / `.btn-ghost`
  - 模型跑马灯：`.model-marquee` 内 `.marquee-row` > `.marquee-track` > 两份相同 `.marquee-set`（每份含 10 个 `.logo-pill`，每 pill 有 `.logo-badge-wrap` > `img.logo-badge` + `.logo-text`）

- [ ] **Step 1: 重写 index.html**

整体结构如下（section 之间的 HTML 严格按此骨架；文案用 spec §4 的内容）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="CyberSheep 赛博小羊 — Sheep AI Plus 聚合平台 | AI 工具 | 智能体教程 | 开源项目">
  <meta name="keywords" content="CyberSheep,赛博小羊,Sheep AI Plus,AI API,AI工具,Claude Code,SheepAI-Lab">
  <meta name="author" content="CyberSheep">
  <meta name="theme-color" content="#f7fbfa">
  <title>CyberSheep 赛博小羊 — 首页</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🐑</text></svg>">
</head>
<body>
  <header class="site-header">
    <a class="brand-mark" href="#top" aria-label="CyberSheep 首页">
      <img src="assets/cybersheep.png" alt="" width="38" height="38">
      <span><strong>CyberSheep</strong><em>赛博小羊</em></span>
    </a>
    <nav class="site-nav" aria-label="主要入口">
      <a href="#api">API 平台</a>
      <a href="#tools">工具箱</a>
      <a href="#blog">博客</a>
      <a href="#announcements">公告</a>
      <a href="#lab">SheepAI-Lab</a>
      <a href="#projects">项目</a>
    </nav>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="切换主题">🌙</button>
  </header>

  <main>
    <!-- HERO -->
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="floating-dots" aria-hidden="true">
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
        <div class="dot dot-3"></div>
      </div>
      <div class="hero-copy">
        <p class="hero-kicker">CyberSheep · 赛博小羊</p>
        <h1 class="hero-title" id="hero-title">赛博小羊 <span class="gradient-text">CyberSheep</span></h1>
        <p class="hero-lede">把模型调用、AI 工具和真实使用经验放在同一个入口。少一点花架子，多一点能直接开工的东西。</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="https://sheepaiplus.top" target="_blank" rel="noopener">进入 Sheep AI Plus</a>
          <a class="btn btn-secondary" href="https://sheepaitools.github.io" target="_blank" rel="noopener">打开工具箱</a>
          <a class="btn btn-ghost" href="https://github.com/SheepAI-Lab" target="_blank" rel="noopener">SheepAI-Lab</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="sheep-card">
          <img src="assets/cybersheep.png" alt="CyberSheep 赛博小羊品牌形象" width="460" height="460">
          <div class="signal-card signal-card--top">
            <span>Flagship product</span><strong>Sheep AI Plus</strong>
          </div>
          <div class="signal-card signal-card--bottom">
            <span>One API · Many models</span><strong>Claude · GPT · Gemini · Grok</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- 01 API 平台 -->
    <section class="section" id="api" aria-labelledby="api-title">
      <header class="section-head">
        <span class="kicker">01 · API 平台</span>
        <h2 id="api-title">Sheep AI Plus</h2>
      </header>
      <div class="section-card">
        <div class="card-copy">
          <p class="card-desc">一个 API 令牌调用全球主流模型，兼容 OpenAI SDK。真实 USD 余额计费，模型页直接展示最终 Token 价格，延续高性价比路线。适合产品接入、脚本自动化与智能体开发。</p>
          <div class="model-marquee" aria-label="支持模型">
            <div class="marquee-row">
              <div class="marquee-track">
                <!-- 第一份 set -->
                <div class="marquee-set">
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="OpenAI" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg"></span><span class="logo-text">OpenAI</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="Claude" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/claude-color.svg"></span><span class="logo-text">Claude</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="Gemini" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/gemini-color.svg"></span><span class="logo-text">Gemini</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="Grok" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/grok.svg"></span><span class="logo-text">Grok</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="DeepSeek" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/deepseek-color.svg"></span><span class="logo-text">DeepSeek</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="Qwen" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/qwen-color.svg"></span><span class="logo-text">Qwen</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="Zhipu AI" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/zhipu-color.svg"></span><span class="logo-text">Zhipu AI</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="Kimi" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/kimi-color.svg"></span><span class="logo-text">Kimi</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="MiniMax" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/minimax-color.svg"></span><span class="logo-text">MiniMax</span></div>
                  <div class="logo-pill"><span class="logo-badge-wrap"><img class="logo-badge" alt="Doubao" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/doubao-color.svg"></span><span class="logo-text">Doubao</span></div>
                </div>
                <!-- 第二份相同 set（无缝循环必需），aria-hidden -->
                <div class="marquee-set" aria-hidden="true">
                  <!-- 与上一 set 完全相同的 10 个 logo-pill -->
                </div>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <a class="btn btn-primary" href="https://sheepaiplus.top" target="_blank" rel="noopener">进入 Sheep AI Plus</a>
            <a class="btn btn-ghost" href="https://sheepai.apifox.cn/" target="_blank" rel="noopener">接入教程</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 工具箱 -->
    <section class="section" id="tools" aria-labelledby="tools-title">
      <header class="section-head">
        <span class="kicker">02 · 工具箱</span>
        <h2 id="tools-title">SheepAI Tools</h2>
      </header>
      <div class="section-card">
        <div class="card-copy">
          <p class="card-desc">用 SheepAI 账户一键登录，多模型对话对比、图像生成、翻译、润色、摘要等常用工作流集中处理。</p>
          <div class="card-actions">
            <a class="btn btn-primary" href="https://sheepaitools.github.io" target="_blank" rel="noopener">打开在线工具</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 03 博客 -->
    <section class="section" id="blog" aria-labelledby="blog-title">
      <header class="section-head">
        <span class="kicker">03 · 博客</span>
        <h2 id="blog-title">CyberSheep 博客</h2>
      </header>
      <div class="section-card">
        <div class="card-copy">
          <p class="card-desc">记录 Claude Code、Codex、智能体搭建和 AI 工具链实战，把踩坑过程整理成能复用的方法。</p>
          <div class="card-actions">
            <a class="btn btn-primary" href="https://flowus.cn/sheepblog/share/f94ab8ef-ca2e-4d63-9c6e-b4d4943b327f?code=8KZJQM" target="_blank" rel="noopener">阅读博客</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 04 公告 -->
    <section class="section" id="announcements" aria-labelledby="announcements-title">
      <header class="section-head">
        <span class="kicker">04 · 公告</span>
        <h2 id="announcements-title">通知公告</h2>
      </header>
      <div class="section-card">
        <ul class="announce-list">
          <li class="announce-item">
            <time datetime="2026-08-01">2026-08-01</time>
            <p><strong>Sheep AI 已升级为 Sheep AI Plus</strong> —— 真实 USD 余额计费、模型页直显最终 Token 价格，新入口 sheepaiplus.top。</p>
          </li>
          <li class="announce-item">
            <time datetime="2026-07-24">2026-07-24</time>
            <p><strong>sheepai-creator 桌面应用上线</strong> —— 跨平台 AI 图像 / 视频创作客户端，可在 SheepAI-Lab 仓库查看源码。</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- 05 SheepAI-Lab -->
    <section class="section" id="lab" aria-labelledby="lab-title">
      <header class="section-head">
        <span class="kicker">05 · SheepAI-Lab</span>
        <h2 id="lab-title">开源组织</h2>
      </header>
      <div class="section-card">
        <div class="card-copy">
          <p class="card-desc">赛博小羊的 GitHub 开源组织，托管桌面应用、CLI 工具与各类 AI 周边小项目。欢迎 Star 与贡献。</p>
          <div class="card-actions">
            <a class="btn btn-primary" href="https://github.com/SheepAI-Lab" target="_blank" rel="noopener">进入 SheepAI-Lab</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 06 小项目 -->
    <section class="section" id="projects" aria-labelledby="projects-title">
      <header class="section-head">
        <span class="kicker">06 · 赛博小羊小项目</span>
        <h2 id="projects-title">更多作品</h2>
      </header>
      <div class="repo-grid" id="repoGrid">
        <!-- Task 3 由 js/main.js 中的 REPOS 数组渲染，初始为空即可 -->
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="community-panel">
      <img src="assets/QQ-group-qcode.jpg" alt="赛博小羊官方 QQ 群二维码" width="112" height="112" loading="lazy">
      <div>
        <p>扫码加入官方 QQ 群，交流 AI 使用心得、获取模型上架资讯、反馈问题建议。</p>
        <button class="email-button" id="emailLink" type="button" title="点击复制邮箱地址">cybersheep33@gmail.com</button>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 CyberSheep 赛博小羊</span>
      <a href="https://sheepaiplus.top" target="_blank" rel="noopener">Sheep AI Plus</a>
    </div>
  </footer>

  <div class="toast" id="toast" aria-live="polite"></div>
  <script src="js/main.js"></script>
</body>
</html>
```

说明：第二份 `.marquee-set` 内需完整复制第一份的 10 个 pill（保持两 set 完全一致，动画才能无缝）。

- [ ] **Step 2: 结构性校验**

Run:
```bash
cd /home/aaron/Projects/CyberSheep33.github.io
grep -n "www.sheepai.top" index.html && echo "FAIL: 仍含旧链接" || echo "OK: 无旧链接"
grep -c "sheepaiplus.top" index.html
grep -c 'id="repoGrid"' index.html
grep -c 'class="marquee-set"' index.html
```
Expected: 旧链接 grep 无输出（`OK: 无旧链接`）；`sheepaiplus.top` 出现 ≥4 次；`repoGrid` = 1；`marquee-set` = 2。

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "♻️ Rewrite homepage structure — Sheep AI Plus entry + 6 sections"
```

---

### Task 2: 重写 `css/style.css`（设计系统 + 双主题 + 全区块样式）

**Files:**
- Modify: `css/style.css`（整体重写）

**Interfaces:**
- Consumes: Task 1 的 DOM 结构/class 命名
- Produces: 供 Task 3 使用的主题变量切换机制（`html[data-theme="dark"]` 覆盖变量）、`.repo-grid` / `.repo-card` 网格样式、`.toast--show` 样式

- [ ] **Step 1: 写 CSS 变量与主题系统**

`:root`（浅色）与 `html[data-theme="dark"]`（深色）各定义一组变量，值从 spec §3 抄录。变量命名与 .local 对齐（`--bg`、`--fg`、`--muted`、`--soft`、`--panel`、`--panel-strong`、`--border`、`--border-strong`、`--shadow`、`--shadow-strong`、`--primary`、`--primary-2`、`--primary-3`、`--glow-1`、`--glow-2`、`--tag-bg`、`--pill-text`、`--divider`）。再补页面级变量：`--font-sans`、`--font-mono`、`--radius-lg: 28px`、`--radius-md: 18px`、`--radius-pill: 999px`、`--max: 1180px`。

核心代码块（浅色）：

```css
:root {
  --bg: linear-gradient(180deg, #f7fbfa 0%, #ffffff 52%, #f1faf7 100%);
  --fg: #17342f;
  --muted: #59716d;
  --soft: #7b8f8b;
  --panel: rgba(255, 255, 255, 0.76);
  --panel-strong: rgba(255, 255, 255, 0.92);
  --border: rgba(185, 223, 212, 0.86);
  --border-strong: rgba(138, 203, 185, 0.92);
  --shadow: 0 10px 30px rgba(15, 118, 110, 0.10);
  --shadow-strong: 0 24px 54px rgba(15, 118, 110, 0.18);
  --primary: #0f766e;
  --primary-2: #059669;
  --primary-3: #0ea5a8;
  --glow-1: rgba(34, 197, 94, 0.08);
  --glow-2: rgba(14, 165, 168, 0.06);
  --tag-bg: rgba(255, 255, 255, 0.88);
  --pill-text: #223a36;
  --divider: rgba(148, 163, 184, 0.24);
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  --radius-lg: 28px;
  --radius-md: 18px;
  --radius-pill: 999px;
  --max: 1180px;
}
```

深色覆盖（值见 spec §3.2）：`html[data-theme="dark"] { ... }`，其中 `--bg` 用 `linear-gradient(180deg, #071816 0%, #0a1413 45%, #0d1a18 100%)`。

- [ ] **Step 2: 写基础 + Header + Hero 样式**

- `*{box-sizing:border-box}`、`html{scroll-behavior:smooth; scroll-padding-top:84px}`、`body{ margin:0; background:var(--bg); color:var(--fg); font-family:var(--font-sans); line-height:1.6; min-width:320px }`
- `.site-header`: `position:sticky; top:0; z-index:30;` 玻璃背景 `var(--panel)` + `backdrop-filter:blur(18px)`，容器限宽 `var(--max)` 居中，`display:flex; justify-content:space-between; align-items:center; padding:14px 20px`
- `.brand-mark`: flex + gap 11px；img 38px 圆角 12px + drop-shadow；`strong` 0.98rem 800；`em` 0.76rem `--muted` 非斜体
- `.site-nav`: flex pill 容器（复用 .local `logo-pill` 观感）；`a` min-width 82px / min-height 36px / 圆角 pill / hover 填充 `--primary` 白字
- `.theme-toggle`: 圆形玻璃按钮 38px，hover 上浮
- `.hero`: `display:grid; grid-template-columns:minmax(0,1.1fr) minmax(320px,0.9fr); gap:clamp(28px,5vw,64px); align-items:center; min-height:calc(100dvh - 84px); position:relative; overflow:hidden; padding:56px 0 40px; max-width:var(--max); margin:0 auto;`
- `.floating-dots` 与 `.dot-1/.2/.3`：照抄 .local（§dot 尺寸/位置/模糊），背景用 `--glow-1/--glow-2` 淡色，`z-index:-1`
- `.hero-title`: `font-size:clamp(2.6rem, 6vw, 4rem); font-weight:800; line-height:1.1; letter-spacing:-1px;` 内 `.gradient-text` 用 `background:linear-gradient(135deg,var(--primary),var(--primary-2) 55%,var(--primary-3)); -webkit-background-clip:text; color:transparent;`
- `.hero-lede`: `--muted`、clamp 字号、`max-width:36rem; line-height:1.78`
- `.hero-actions`: flex wrap gap 12px；`.btn` 圆角 14px、min-width 154px、padding 15px 28px、hover translateY(-2px)；`.btn-primary` 用品牌渐变 + 白字 + 绿色阴影；`.btn-secondary` 玻璃边框 `--primary` 字；`.btn-ghost` 透明 + `--primary` 字
- `.sheep-card`: 玻璃面板（`--panel-strong` + 渐变 + blur）、圆角 `--radius-lg`、内居中的羊图（`max-width:min(84%,430px)`、drop-shadow）+ 两张 `.signal-card`（absolute 定位、小等宽 kicker 大写 + strong 标题）

- [ ] **Step 3: 写区块 + 跑马灯 + 仓库网格 + 公告 + Footer 样式**

- `.section`: `max-width:var(--max); margin:0 auto; padding:36px 20px 12px;`
- `.section-head`: flex 基线对齐；`.kicker` 等宽 0.73rem `--primary` 800 字重 + 上边距；`h2` 2.2rem 800
- `.section-card`: `--panel` + `backdrop-filter:blur(16px)` + `border:1px solid var(--border)` + 圆角 22px + padding 32px + hover 阴影加深
- `.card-desc`: `--muted`、max-width 40rem、line-height 1.72
- `.card-actions`: flex gap 12px margin-top 22px
- `.model-marquee` 跑马灯：`.marquee-row{overflow:hidden; position:relative; padding:4px 0}`、`.marquee-track{display:flex; width:max-content; gap:14px; animation: marqueeLeft 36s linear infinite}`、`.marquee-set{display:flex; gap:14px; flex-shrink:0}`、`.logo-pill`（白底玻璃药丸 + hover 上浮，复用 .local 样式）、`.logo-badge-wrap` 28px 白底圆角 + `.logo-badge` 21px、`.logo-text` 14px 600
- `@keyframes marqueeLeft { 0%{transform:translateX(0)} 100%{transform:translateX(calc(-50% - 7px))} }`
- `.announce-list`: 无符号列表；`.announce-item`: flex gap 16px、分隔线 `--divider`、`time` 等宽小字 `--soft`、`strong` 标题 + 说明文字 `--muted`
- `.repo-grid`: `display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px;`；`.repo-card`: 玻璃卡（同 `.section-card`）padding 24px、`display:flex; flex-direction:column; gap:10px`、hover 上浮；`h3` 等宽粗体 1.05rem、`p` `--muted` 0.92rem、`.repo-lang` 语言 pill（浅色底 `--primary` 字 0.75rem）、`.repo-link` `--primary` 粗体（`→` 后缀）
- `.site-footer`: `max-width:var(--max); margin:0 auto; padding:36px 20px 30px; border-top:1px solid var(--divider)`；`.community-panel` flex（二维码 112px 白底圆角 16px + 说明列）；`.email-button` 透明底 + 下划线 `--primary` + hover 变 `--fg`；`.footer-bottom` flex space-between、0.82rem `--soft`
- `.toast` + `.toast--show`：沿用现有定位逻辑，底色 `--fg` 白字

- [ ] **Step 4: 深色主题下组件微调 + 响应式 + 减弱动效**

- `html[data-theme="dark"] .site-header { background: var(--panel); }`（玻璃深色变量自动生效）；`.logo-badge-wrap` 在深色下保持白底（模型图标多带深色轮廓）
- `@media (max-width: 980px)`：`.hero{grid-template-columns:1fr}`、`.section{ padding-inline:16px }`
- `@media (max-width: 640px)`：`.site-nav{overflow-x:auto}`（横向滚动）、`.hero-actions{flex-direction:column; align-items:stretch}`、`.btn{width:100%; max-width:340px; margin-inline:auto}`、`.sheep-card > img{max-width:70%}`、`.announce-item{flex-direction:column; gap:4px}`、`.community-panel{grid-template-columns:92px 1fr}`
- `@media (prefers-reduced-motion: reduce)`：关闭所有 transition/animation（沿用现有规则）
- `.toast--show` 必须有（Task 3 复用）

- [ ] **Step 5: 目验**

Run:
```bash
cd /home/aaron/Projects/CyberSheep33.github.io && python3 -m http.server 8000
```
浏览器打开 `http://localhost:8000`，检查：
- 浅色下整体为青绿玻璃态；右上角主题按钮点击后变深色（页面背景变深绿、文字变浅）
- Hero 左文右羊、羊图带阴影、signal 卡片悬浮
- 06 区块 `#repoGrid` 目前为空（Task 3 后才有卡片）——可接受
- 跑马灯在 API 区块内缓慢向左循环滚动
- 缩放窗口到 <640px：单栏堆叠、导航可横向滚动、按钮全宽
- 完成后 `Ctrl+C` 停掉服务器

- [ ] **Step 6: 提交**

```bash
git add css/style.css
git commit -m "🎨 Add Sheep AI Plus design system — glassmorphism, dual theme, all sections"
```

---

### Task 3: 重写 `js/main.js`（主题切换 + 仓库渲染 + 邮箱复制）

**Files:**
- Modify: `js/main.js`（整体重写）

**Interfaces:**
- Consumes: Task 1 的 `#themeToggle`、`#repoGrid`、`#emailLink`、`#toast`；Task 2 的 `html[data-theme]` 与 `.toast--show`
- Produces: 可在任意浏览器直接运行的 IIFE，无外部依赖

- [ ] **Step 1: 写完整 main.js**

```js
/* ============================================================
   CyberSheep — Theme Toggle · Repo Render · Email Copy
   ============================================================ */
(function () {
  'use strict'

  /* ---------- 主题 ---------- */
  var THEME_KEY = 'cybersheep-theme'
  var root = document.documentElement
  var themeToggle = document.getElementById('themeToggle')

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme
    if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙'
    if (persist) localStorage.setItem(THEME_KEY, theme)
  }

  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY)
    applyTheme(saved === 'dark' || saved === 'light' ? saved : systemTheme(), false)
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next, true)
    })
  }

  /* ---------- 仓库卡片 ---------- */
  var REPOS = [
    {
      name: 'sheepai-creator',
      desc: '跨平台 AI 图像 / 视频创作桌面应用',
      lang: 'TypeScript',
      url: 'https://github.com/SheepAI-Lab/sheepai-creator'
    },
    {
      name: 'sheepai-hud',
      desc: 'SheepAI 用户信息、余额与 API Token 用量桌面小组件',
      lang: 'Swift',
      url: 'https://github.com/SheepAI-Lab/sheepai-hud'
    }
    // 新增小项目：复制上面一条对象即可（name/desc/lang/url）
  ]

  var LANG_COLORS = {
    TypeScript: '#3178c6',
    Swift: '#f05138',
    Shell: '#89e051'
  }

  function langStyle(lang) {
    return LANG_COLORS[lang] ? 'color:' + LANG_COLORS[lang] + ';' : ''
  }

  function renderRepos() {
    var grid = document.getElementById('repoGrid')
    if (!grid) return
    grid.innerHTML = REPOS.map(function (r) {
      return (
        '<a class="repo-card" href="' + r.url + '" target="_blank" rel="noopener">' +
          '<h3>' + r.name + '</h3>' +
          '<p>' + r.desc + '</p>' +
          '<span class="repo-lang" style="' + langStyle(r.lang) + '">' + r.lang + '</span>' +
          '<span class="repo-link">GitHub →</span>' +
        '</a>'
      )
    }).join('')
  }

  /* ---------- 邮箱复制 ---------- */
  var emailEl = document.getElementById('emailLink')
  var toastEl = document.getElementById('toast')
  var toastTimer = null

  function showToast(msg) {
    if (!toastEl) return
    toastEl.textContent = msg
    toastEl.classList.add('toast--show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('toast--show')
    }, 1800)
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('邮箱已复制')
      }).catch(function () {
        fallbackCopy(text)
      })
    } else {
      fallbackCopy(text)
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    ta.style.top = '-9999px'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    try {
      var ok = document.execCommand('copy')
      showToast(ok ? '邮箱已复制' : '复制失败，请手动复制')
    } catch (e) {
      showToast('复制失败，请手动复制')
    }
    document.body.removeChild(ta)
  }

  if (emailEl) {
    emailEl.addEventListener('click', function () {
      copyText(emailEl.textContent.trim())
    })
  }

  /* ---------- 初始化 ---------- */
  initTheme()
  renderRepos()
})()
```

- [ ] **Step 2: 目验**

Run: `cd /home/aaron/Projects/CyberSheep33.github.io && python3 -m http.server 8000`
浏览器打开 `http://localhost:8000`，检查：
1. **主题**：右上角按钮显示 🌙（浅色）；点击变深色、按钮变 ☀️；刷新页面主题保持；在 DevTools `Application > Local Storage` 中确认 `cybersheep-theme` 已写入
2. **仓库卡片**：06 区块渲染出 2 张卡片（sheepai-creator / sheepai-hud），含语言标签与 GitHub 链接，点击跳到对应仓库
3. **邮箱复制**：点击 footer 邮箱，底部弹出「邮箱已复制」toast，1.8s 后消失；剪贴板内容为 `cybersheep33@gmail.com`
4. 打开 DevTools Console 无报错
- 完成后 `Ctrl+C` 停掉服务器

- [ ] **Step 3: 提交**

```bash
git add js/main.js
git commit -m "✨ Add theme toggle, repo card render, email copy"
```

---

### Task 4: 更新 `README.md` + 全站收尾校验

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 更新 README.md**

重写为反映新结构（参考原文件改）：项目简介改为「赛博小羊品牌入口页，Sheep AI Plus 设计语言，含 API 平台 / 工具箱 / 博客 / 公告 / SheepAI-Lab / 小项目仓库」。产品链接一节里 `www.sheepai.top` 改为 `sheepaiplus.top`，文案改为 Sheep AI Plus。新增「维护指南」小节说明：公告改 `index.html` 的 `.announce-list`；小项目在 `js/main.js` 的 `REPOS` 数组增删。

- [ ] **Step 2: 全站校验**

Run:
```bash
cd /home/aaron/Projects/CyberSheep33.github.io
grep -rn "sheepai.top\b" --include=*.html --include=*.js --include=*.css --include=*.md . | grep -v "sheepaiplus.top" | grep -v node_modules || echo "OK: 全仓无残留旧链接"
grep -c "sheepaiplus.top" index.html README.md
python3 -m http.server 8000
```
Expected: `OK: 全仓无残留旧链接`（只允许 `sheepaiplus.top` 形式的命中；若出现 `www.sheepai.top` 单独命中则修正）。浏览器 3 个断点（桌面 / 平板 / 手机）目验一遍 + 深色模式。确认仓库卡片、跑马灯、锚点导航、主题记忆均正常。完成后 `Ctrl+C`。

- [ ] **Step 3: 提交**

```bash
git add README.md
git commit -m "📝 Update README for homepage v2 — Sheep AI Plus + maintenance guide"
```

---

## Self-Review

**Spec coverage 对照：**
- §3 配色双主题 → Task 2 Step 1 ✓
- §4 页面结构六区块 + Hero → Task 1 ✓
- §4 公告静态列表 → Task 1（announcements 区块）+ Task 4 维护说明 ✓
- §4/§5.6 仓库 JS 数组渲染（初始 2 个，不含 sheepai-skills）→ Task 3 REPOS ✓
- §5.4 模型跑马灯（单条 left，双 set）→ Task 1 + Task 2 ✓
- §5.1 sticky header + 锚点导航 + 主题按钮 → Task 1 + Task 2 ✓
- §5.2 Hero 左文右羊 + signal 卡 + 浮动光斑 → Task 1 + Task 2 ✓
- §6 链接汇总（Sheep AI → Sheep AI Plus，工具箱/博客不变）→ Task 1 + Task 4 校验 ✓
- §7 交互（主题 / 复制 / 渲染 / 锚点）→ Task 3（锚点靠 CSS `scroll-behavior` + `scroll-padding-top`）✓
- §8 响应式断点 → Task 2 Step 4 ✓
- §9 验收 → Task 2 Step 5 / Task 3 Step 2 / Task 4 Step 2 ✓

**Placeholder scan:** 无 TBD/TODO；每步含实际代码或校验命令。Task 1 中第二份 `marquee-set` 用注释标注「复制第一份」，执行时直接复制即可（非占位，是明确指令）。

**Type consistency:** 
- `data-theme` 全程用 `html` 元素（JS `root.dataset.theme` 与 CSS `html[data-theme="dark"]` 一致）
- 区块 id：`api/tools/blog/announcements/lab/projects` 在 HTML、导航锚点、spec 中一致
- `REPOS` 对象字段 `name/desc/lang/url` 在 Task 3 定义与渲染处一致
- 语言标签色映射 `LANG_COLORS` 在 Task 3 定义与 `langStyle()` 使用处一致
