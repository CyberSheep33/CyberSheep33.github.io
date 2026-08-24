# CyberSheep 首页浅色玻璃态重设计 — 实现计划

> **For agentic workers:** 使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现。步骤使用 checkbox (`- [ ]`) 语法追踪。

**目标：** 将 cybersheep-page 从深色赛博朋克风格重写为与 sheepai-tools 统一的浅色玻璃态首页。

**架构：** 纯静态 HTML + CSS + JS 单页面。4 张横向卡片阵列占据全视口，每张卡片由 `<a>` 包裹实现整卡跳转。CSS 自定义属性驱动配色，`flexbox` + `grid` 实现响应式布局。

**技术栈：** HTML5, CSS3 (自定义属性 + flexbox + grid + backdrop-filter), Vanilla JS (剪贴板 API)

## 全局约束

- 无构建工具、无框架、无外部图标库
- 系统字体栈，不引入 Google Fonts
- 页面高度 100vh 桌面端无滚动，手机端取消高度限制
- 配色翠绿 `#10b981` + 天蓝 `#0ea5e9`，与 sheepai-tools 统一
- 4 张卡片各用不同左侧彩色边框（翠绿/天蓝/淡紫/暖黄）
- API、Tools、博客卡片整卡 `<a>` 包裹可点击
- 模型标识用品牌色圆点 + 官方名称胶囊，不引入外部图标素材
- 邮箱点击可复制到剪贴板

---

### Task 1: 重写 CSS 样式文件

**文件：**
- 重写：`css/style.css`

**接口：**
- 产出：CSS 自定义属性 `--bg`, `--card-bg`, `--card-border`, `--text`, `--text-mid`, `--text-dim`, `--emerald`, `--sky`, `--violet`, `--amber`, `--shadow-sm`, `--shadow-md`, `--radius`
- 产出：`.bg-grid`, `.bg-orb--emerald`, `.bg-orb--sky` 背景类
- 产出：`.dashboard`, `.header`, `.header-logo`, `.header-tagline` 布局类
- 产出：`.cards-grid` 卡片容器, `.card` 基础卡片, `.card--api`, `.card--tools`, `.card--blog`, `.card--community` 差异卡片
- 产出：`.card-header`, `.card-subtitle`, `.card-desc`, `.card-tags`, `.card-tag`, `.card-action` 卡片内部组件
- 产出：`.model-brand` 模型品牌标签组件
- 产出：`.community-body`, `.community-qr`, `.community-email` 社群特殊布局
- 产出：`.footer` 底部
- 产出：`.toast` 复制提示
- 产出：响应式媒体查询 `@media (max-width: 1023px)` 和 `@media (max-width: 639px)`

- [ ] **Step 1: 写入 CSS 自定义属性根变量与基础重置**

将以下内容写入 `css/style.css`：

```css
/* ============================================================
   CyberSheep 赛博小羊 — Light Glass-Morphism v4
   ============================================================ */

:root {
  --bg: #f8fafc;
  --card-bg: rgba(255,255,255,0.85);
  --card-border: rgba(255,255,255,0.75);
  --text: #0f172a;
  --text-mid: #475569;
  --text-dim: #94a3b8;

  --emerald: #10b981;
  --emerald-dim: rgba(16,185,129,0.08);
  --emerald-tint: rgba(16,185,129,0.03);

  --sky: #0ea5e9;
  --sky-dim: rgba(14,165,233,0.08);
  --sky-tint: rgba(14,165,233,0.03);

  --violet: #8b5cf6;
  --violet-dim: rgba(139,92,246,0.08);
  --violet-tint: rgba(139,92,246,0.03);

  --amber: #f59e0b;
  --amber-dim: rgba(245,158,11,0.08);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --radius: 1.5rem;

  --font-sans: system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;
  --font-mono: 'SF Mono','Cascadia Code','Menlo',monospace;
}

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{font-size:16px}
body{
  font-family:var(--font-sans);background:var(--bg);color:var(--text);
  -webkit-font-smoothing:antialiased;line-height:1.55;
  height:100vh;height:100dvh;overflow:hidden;
}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
```

- [ ] **Step 2: 写入背景效果样式**

```css
/* Background */
.bg-grid{
  position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:
    linear-gradient(rgba(15,23,42,0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(15,23,42,0.06) 1px,transparent 1px);
  background-size:44px 44px;
}
.bg-orb{
  position:fixed;border-radius:50%;pointer-events:none;z-index:0;
}
.bg-orb--emerald{
  width:320px;height:320px;background:var(--emerald);
  filter:blur(100px);opacity:0.22;
  top:-120px;right:-80px;
}
.bg-orb--sky{
  width:280px;height:280px;background:var(--sky);
  filter:blur(100px);opacity:0.22;
  bottom:-100px;left:-60px;
}
```

- [ ] **Step 3: 写入整体布局样式**

```css
/* Dashboard */
.dashboard{
  position:relative;z-index:1;
  display:flex;flex-direction:column;
  height:100vh;height:100dvh;
  max-width:1200px;margin:0 auto;padding:16px 20px;gap:14px;
}

/* Header */
.header{
  display:flex;align-items:baseline;justify-content:space-between;
  flex-shrink:0;padding:0;
}
.header-logo{
  display:flex;align-items:center;gap:6px;font-weight:700;
}
.header-logo .logo-icon{
  font-size:1.4rem;line-height:1;
}
.header-logo .logo-en{
  font-size:1.05rem;color:var(--text);
}
.header-logo .logo-divider{
  color:var(--text-dim);font-weight:300;margin:0 2px;
}
.header-logo .logo-cn{
  font-size:0.9rem;color:var(--text-mid);font-weight:500;
}
.header-tagline{
  font-size:0.78rem;color:var(--text-dim);
}
```

- [ ] **Step 4: 写入卡片网格与基础卡片样式**

```css
/* Cards Grid */
.cards-grid{
  flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;min-height:0;
}

/* Base Card */
.card{
  position:relative;display:flex;flex-direction:column;
  border-radius:var(--radius);background:var(--card-bg);
  border:1px solid var(--card-border);
  padding:18px 20px;gap:8px;
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  box-shadow:var(--shadow-sm);
  transition:transform .2s,box-shadow .2s,border-color .2s;
  overflow:hidden;
}
.card--link{cursor:pointer}
.card--link:hover{
  transform:translateY(-2px);
  box-shadow:var(--shadow-md);
}

/* Card accent borders */
.card--api{border-left:3px solid var(--emerald);background:linear-gradient(135deg,var(--emerald-tint),var(--card-bg))}
.card--api:hover{border-color:rgba(16,185,129,0.25)}
.card--tools{border-left:3px solid var(--sky);background:linear-gradient(135deg,var(--sky-tint),var(--card-bg))}
.card--tools:hover{border-color:rgba(14,165,233,0.25)}
.card--blog{border-left:3px solid var(--violet);background:linear-gradient(135deg,var(--violet-tint),var(--card-bg))}
.card--blog:hover{border-color:rgba(139,92,246,0.25)}
.card--community{border-left:3px solid var(--amber);background:var(--card-bg)}
.card--community:hover{border-color:rgba(245,158,11,0.25)}
```

- [ ] **Step 5: 写入卡片内部组件样式**

```css
/* Card header row */
.card-header{
  display:flex;align-items:center;gap:8px;
}
.card-header .card-icon-img{
  width:22px;height:22px;border-radius:6px;flex-shrink:0;
}
.card-header .card-icon-emoji{
  font-size:1.15rem;line-height:1;flex-shrink:0;
}
.card-title{
  font-size:0.95rem;font-weight:700;flex:1;min-width:0;
}
.card-badge{
  font-size:0.62rem;font-weight:600;letter-spacing:0.06em;
  text-transform:uppercase;padding:2px 8px;border-radius:12px;
  flex-shrink:0;
}
.card-badge--emerald{color:var(--emerald);background:var(--emerald-dim);border:1px solid rgba(16,185,129,0.15)}
.card-badge--sky{color:var(--sky);background:var(--sky-dim);border:1px solid rgba(14,165,233,0.15)}
.card-badge--violet{color:var(--violet);background:var(--violet-dim);border:1px solid rgba(139,92,246,0.15)}
.card-badge--amber{color:var(--amber);background:var(--amber-dim);border:1px solid rgba(245,158,11,0.15)}

/* Card subtitle */
.card-subtitle{
  font-size:0.88rem;font-weight:600;color:var(--text);
}

/* Card description */
.card-desc{
  font-size:0.8rem;color:var(--text-mid);line-height:1.65;
}

/* Feature tags */
.card-tags{
  display:flex;flex-wrap:wrap;gap:5px;margin-top:auto;
}
.card-tag{
  display:inline-block;font-size:0.72rem;padding:3px 10px;border-radius:12px;
}
.card-tag--emerald{color:var(--emerald);background:var(--emerald-dim)}
.card-tag--sky{color:var(--sky);background:var(--sky-dim)}
.card-tag--violet{color:var(--violet);background:var(--violet-dim)}

/* Action link at bottom */
.card-action{
  font-size:0.78rem;font-weight:600;text-align:center;
  padding-top:4px;margin-top:auto;
}
.card-action--emerald{color:var(--emerald)}
.card-action--sky{color:var(--sky)}
.card-action--violet{color:var(--violet)}
```

- [ ] **Step 6: 写入模型品牌标签与社群卡片特殊样式**

```css
/* Model brand pills */
.model-brands{
  display:flex;flex-wrap:wrap;gap:6px;align-items:center;
  padding:6px 10px;border-radius:12px;
  background:rgba(255,255,255,0.6);
}
.model-brand{
  display:inline-flex;align-items:center;gap:4px;
  font-size:0.72rem;font-weight:600;color:var(--text-mid);
  padding:2px 8px;border-radius:8px;background:white;
  border:1px solid rgba(0,0,0,0.06);
}
.model-brand::before{
  content:'';display:inline-block;width:6px;height:6px;border-radius:50%;flex-shrink:0;
}
.model-brand--claude::before{background:#d97706}
.model-brand--gpt::before{background:#10b981}
.model-brand--gemini::before{background:#3b82f6}
.model-brand--deepseek::before{background:#6366f1}
.model-brand--qwen::before{background:#8b5cf6}

/* Community card special layout */
.community-body{
  display:flex;gap:14px;align-items:flex-start;flex:1;
}
.community-qr-block{
  flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:4px;
  padding:8px;background:white;border-radius:12px;
  border:1px solid rgba(0,0,0,0.06);
}
.community-qr-block img{
  width:72px;height:72px;border-radius:8px;
}
.community-qr-title{
  font-size:0.7rem;font-weight:600;color:var(--text);
}
.community-qr-hint{
  font-size:0.65rem;color:var(--text-dim);text-align:center;
}
.community-info{
  flex:1;display:flex;flex-direction:column;gap:8px;min-width:0;
}
.community-desc{
  font-size:0.78rem;color:var(--text-mid);line-height:1.6;
}
.community-email-block{
  margin-top:auto;
}
.community-email{
  font-family:var(--font-mono);font-size:0.82rem;color:var(--emerald);
  cursor:pointer;user-select:all;
  transition:color .15s;
}
.community-email:hover{color:var(--text)}
.community-email-hint{
  font-size:0.66rem;color:var(--text-dim);margin-top:2px;
}
```

- [ ] **Step 7: 写入 Toast 提示与 Footer 样式**

```css
/* Toast */
.toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  background:var(--text);color:white;padding:10px 24px;
  border-radius:12px;font-size:0.85rem;font-weight:600;
  z-index:100;opacity:0;transition:opacity .25s;
  pointer-events:none;
}
.toast--show{opacity:1}

/* Footer */
.footer{
  flex-shrink:0;text-align:center;padding:6px 0;
  font-size:0.7rem;color:var(--text-dim);
}
```

- [ ] **Step 8: 写入响应式样式**

```css
/* Tablet: 2x2 grid */
@media(max-width:1023px){
  html{font-size:15px}
  .dashboard{padding:12px 14px;gap:10px}
  .cards-grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .header-tagline{display:none}
}

/* Mobile: single column, scrollable */
@media(max-width:639px){
  body{height:auto;overflow-y:auto}
  html{font-size:14px}
  .dashboard{height:auto;min-height:100dvh;padding:10px;gap:8px}
  .cards-grid{grid-template-columns:1fr;gap:8px}
  .header{justify-content:center}
  .header-tagline{display:none}
  .bg-orb--emerald,.bg-orb--sky{opacity:0.12}
  .community-body{flex-direction:column;align-items:center}
  .community-qr-block img{width:64px;height:64px}
  .card{padding:14px 16px}
}
```

- [ ] **Step 9: 写入 reduced-motion 兼容**

```css
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:0.01ms!important;animation-iteration-count:1!important;
    transition-duration:0.01ms!important;
  }
}
```

- [ ] **Step 10: 验证 CSS 语法**

```bash
# 无构建工具，直接在浏览器打开 index.html 验证（Task 2 完成后一起验证）
```

---

### Task 2: 重写 HTML 结构

**文件：**
- 重写：`index.html`

**接口：**
- 消费：Task 1 中定义的所有 CSS 类名
- 产出：页面 DOM 结构，供 Task 3 的 JS 绑定事件

- [ ] **Step 1: 写入完整 HTML**

将以下内容完整写入 `index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="CyberSheep 赛博小羊 — AI API 聚合服务平台 | 在线 AI 工具 | 智能体教程 | 模型调用中转站">
  <meta name="keywords" content="CyberSheep,赛博小羊,AI API,模型中转,AI工具,Claude Code,智能体教程">
  <meta name="author" content="CyberSheep">
  <meta name="theme-color" content="#f8fafc">

  <meta property="og:title" content="CyberSheep 赛博小羊 — AI API 聚合服务平台">
  <meta property="og:description" content="多模型聚合中转 | 在线 AI 工具 | AI 使用经验与智能体教程">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CyberSheep">

  <title>CyberSheep 赛博小羊 — AI API 聚合服务平台</title>

  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🐑</text></svg>">
</head>
<body>

  <div class="dashboard">

    <!-- Header -->
    <header class="header">
      <div class="header-logo">
        <span class="logo-icon">🐑</span>
        <span class="logo-en">CyberSheep</span>
        <span class="logo-divider">|</span>
        <span class="logo-cn">赛博小羊</span>
      </div>
      <p class="header-tagline">Your Gateway to AI</p>
    </header>

    <!-- 4-Card Grid -->
    <div class="cards-grid">

      <!-- Card 1: API Platform -->
      <a href="https://www.sheepai.top" target="_blank" rel="noopener" class="card card--link card--api">
        <div class="card-header">
          <img src="assets/cybersheep.png" alt="" class="card-icon-img" width="22" height="22">
          <h2 class="card-title">SheepAI API 聚合平台</h2>
          <span class="card-badge card-badge--emerald">API 中转</span>
        </div>
        <p class="card-subtitle">一个 API 令牌调用全球大模型</p>
        <p class="card-desc">兼容 OpenAI SDK 格式，3 行代码即可集成。按量计费，多区域节点部署，99.9% 可用性保障。</p>
        <div class="model-brands">
          <span class="model-brand model-brand--claude">Claude</span>
          <span class="model-brand model-brand--gpt">GPT</span>
          <span class="model-brand model-brand--gemini">Gemini</span>
          <span class="model-brand model-brand--deepseek">DeepSeek</span>
          <span class="model-brand model-brand--qwen">Qwen</span>
        </div>
        <span class="card-action card-action--emerald">⚡ 访问 sheepai.top →</span>
      </a>

      <!-- Card 2: Tools Platform -->
      <a href="https://sheepaitools.github.io" target="_blank" rel="noopener" class="card card--link card--tools">
        <div class="card-header">
          <span class="card-icon-emoji">🛠️</span>
          <h2 class="card-title">SheepAI Tools 工具平台</h2>
          <span class="card-badge card-badge--sky">在线工具</span>
        </div>
        <p class="card-subtitle">汇集多种实用在线 AI 工具</p>
        <p class="card-desc">凭 SheepAI 注册账户一键登录，即可使用多模型对话对比、AI 图像生成、文本翻译/润色/摘要等功能。</p>
        <div class="card-tags">
          <span class="card-tag card-tag--sky">💬 多模型对话对比</span>
          <span class="card-tag card-tag--sky">🖼️ AI 图像生成</span>
          <span class="card-tag card-tag--sky">📝 文本翻译/润色/摘要</span>
          <span class="card-tag card-tag--sky">🆔 账户一键登录</span>
        </div>
        <span class="card-action card-action--sky">🛠️ 访问工具平台 →</span>
      </a>

      <!-- Card 3: Blog -->
      <a href="https://cybersheep.notion.site/CyberSheep-393bb7144bb6805ba663c8f4b858b685" target="_blank" rel="noopener" class="card card--link card--blog">
        <div class="card-header">
          <span class="card-icon-emoji">📝</span>
          <h2 class="card-title">CyberSheep 博客</h2>
          <span class="card-badge card-badge--violet">内容</span>
        </div>
        <p class="card-subtitle">分享 AI 使用经验与智能体开发教程</p>
        <p class="card-desc">涵盖 Claude Code 辅助编程全流程、Codex 智能体搭建、AI 工具链实战等内容。从入门指南到高级技巧，助你成为 AI 时代的高效玩家。</p>
        <div class="card-tags">
          <span class="card-tag card-tag--violet">📖 从零上手 AI 工具</span>
          <span class="card-tag card-tag--violet">🛠️ Claude Code 编程实战</span>
          <span class="card-tag card-tag--violet">🤖 智能体 Agent 开发</span>
          <span class="card-tag card-tag--violet">💡 踩坑经验与实践</span>
        </div>
        <span class="card-action card-action--violet">📖 阅读博客 →</span>
      </a>

      <!-- Card 4: Community (not a link wrapper) -->
      <div class="card card--community">
        <div class="card-header">
          <span class="card-icon-emoji">💬</span>
          <h2 class="card-title">社群与联系</h2>
          <span class="card-badge card-badge--amber">社群</span>
        </div>
        <div class="community-body">
          <div class="community-qr-block">
            <img src="assets/QQ-group-qcode.jpg" alt="赛博小羊官方 QQ 群二维码" width="72" height="72" loading="lazy">
            <span class="community-qr-title">🐧 官方 QQ 群</span>
            <span class="community-qr-hint">扫码加入</span>
          </div>
          <div class="community-info">
            <p class="community-desc">加入赛博小羊社群，与其他用户交流 AI 使用心得、获取最新模型上架资讯、反馈问题建议。</p>
            <div class="community-email-block">
              <span class="community-email" id="emailLink" title="点击复制邮箱地址">cybersheep33@gmail.com</span>
              <p class="community-email-hint">📧 商务 / 反馈 / 技术支持 · 点击复制</p>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /.cards-grid -->

    <!-- Footer -->
    <footer class="footer">
      © 2026 CyberSheep 赛博小羊
    </footer>

  </div><!-- /.dashboard -->

  <!-- Background effects -->
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="bg-orb bg-orb--emerald" aria-hidden="true"></div>
  <div class="bg-orb bg-orb--sky" aria-hidden="true"></div>

  <!-- Toast -->
  <div class="toast" id="toast" aria-live="polite"></div>

  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: 用浏览器打开 index.html 验证页面渲染**

在浏览器打开 `index.html`，检查：4 张卡片横向排列、彩色左边框可见、背景网格和光斑正常、所有文字显示正确。

---

### Task 3: 精简 JavaScript

**文件：**
- 修改：`js/main.js`

**接口：**
- 消费：DOM 元素 `#emailLink`, `#toast`
- 产出：邮箱点击复制 + toast 提示

- [ ] **Step 1: 写入精简后的 JS**

将以下内容完整写入 `js/main.js`：

```javascript
/* ============================================================
   CyberSheep — Minimal Interactions
   ============================================================ */

(function () {
  var emailEl = document.getElementById('emailLink')
  var toastEl = document.getElementById('toast')

  if (!emailEl || !toastEl) return

  var toastTimer = null

  function showToast(msg) {
    toastEl.textContent = msg
    toastEl.classList.add('toast--show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('toast--show')
    }, 1800)
  }

  emailEl.addEventListener('click', function () {
    var email = emailEl.textContent.trim()
    if (!email) return

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () {
        showToast('邮箱已复制 ✅')
      }).catch(function () {
        fallbackCopy(email)
      })
    } else {
      fallbackCopy(email)
    }
  })

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
      showToast(ok ? '邮箱已复制 ✅' : '复制失败，请手动复制')
    } catch (e) {
      showToast('复制失败，请手动复制')
    }
    document.body.removeChild(ta)
  }
})()
```

- [ ] **Step 2: 验证邮箱复制功能**

在浏览器中点击邮箱地址，检查：toast 弹出 "邮箱已复制 ✅"，1.8 秒后自动消失。粘贴验证剪贴板内容为 `cybersheep33@gmail.com`。

---

### Task 4: 更新 README

**文件：**
- 修改：`README.md`

- [ ] **Step 1: 更新 README 内容**

将现有 README.md 替换为：

```markdown
# CyberSheep 赛博小羊 — 品牌首页

赛博小羊品牌入口页，展示旗下所有产品与服务。

**设计：** 浅色玻璃态 (Light Glass-Morphism)，与 [sheepai-tools](https://sheepaitools.github.io) 统一品牌风格。

## 项目结构

```
index.html          — 主页面（4 张模块卡片）
css/style.css       — 样式（CSS 自定义属性驱动）
js/main.js           — 交互（邮箱复制）
assets/              — 图片素材（Logo、二维码）
```

## 技术

纯静态 HTML + CSS + JS，无构建工具，开箱即用。

## 部署

本仓库通过 GitHub Pages 部署到 `cybersheep33.github.io`。
推送 `main` 分支即可自动更新。

## 产品链接

- **SheepAI API 平台：** [www.sheepai.top](https://www.sheepai.top)
- **SheepAI Tools 工具平台：** [sheepaitools.github.io](https://sheepaitools.github.io)
- **博客：** [CyberSheep Notion](https://cybersheep.notion.site/CyberSheep-393bb7144bb6805ba663c8f4b858b685)

## 联系

📧 cybersheep33@gmail.com
```

- [ ] **Step 2: 验证 README 渲染**

在编辑器预览 README.md，确认格式正确、链接有效。

---

### Task 5: 浏览器验证与调试

**文件：**
- 无新建文件，验证 Task 1–4 的产出

- [ ] **Step 1: 桌面端验证 (≥1024px)**

打开浏览器访问 `index.html`，逐个检查：
1. 页面高度 = 视口高度，无垂直滚动条
2. 4 张卡片等宽横向排列
3. 卡片 1 左侧翠绿边框，cybersheep.png 图标可见
4. 5 个模型品牌标签各有正确颜色圆点
5. 卡片 2 左侧天蓝边框
6. 卡片 3 左侧淡紫边框
7. 卡片 4 左侧暖黄边框，二维码可见
8. 背景网格和双色光斑可见
9. 点击卡片 1 → 跳转 sheepai.top
10. 点击卡片 2 → 跳转 sheepaitools.github.io
11. 点击卡片 3 → 跳转 Notion 博客
12. 点击邮箱 → 显示 toast "邮箱已复制 ✅"

- [ ] **Step 2: 平板端验证 (640–1023px)**

调整浏览器宽度到 768px，检查：
1. 卡片变为 2×2 网格布局
2. 标语行隐藏
3. 页面无水平滚动条

- [ ] **Step 3: 手机端验证 (<640px)**

调整浏览器宽度到 375px，检查：
1. 卡片变为单列堆叠
2. 页面可垂直滚动
3. Header 居中
4. 二维码尺寸缩小
5. 光斑透明度降低

- [ ] **Step 4: 提交所有变更**

```bash
git add index.html css/style.css js/main.js README.md
git commit -m "🎨 Redesign: light glass-morphism homepage (sheepai-tools style)"
```