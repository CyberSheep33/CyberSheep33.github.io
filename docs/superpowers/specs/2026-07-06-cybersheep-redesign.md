# CyberSheep 赛博小羊 — 品牌首页重新设计

**日期：** 2026-07-06
**状态：** 已确认
**参考设计：** sheepai-tools (sheepaitools.github.io)

---

## 1. 设计目标

将当前深色赛博朋克风格首页替换为与 sheepai-tools 统一的浅色玻璃态设计，强化品牌一致性。用户进入页面后无需滚动即可看到全部 4 个功能模块。

### 核心原则

- **首屏即全貌** — 所有模块卡片在视口内一次性展示，不做滚动叙事
- **品牌统一** — 配色（翠绿+天蓝）、玻璃态、网格光斑与 sheepai-tools 一致
- **卡片差异化** — 4 张卡片各有不同的视觉特征（左侧彩色边框、底色 tint），而非统一模板
- **极简交互** — 整张卡片可点击跳转，无须寻找底部按钮

---

## 2. 技术方案

纯静态 HTML + CSS 手写，无构建工具，无框架依赖。

- 单页面：`index.html`
- 样式：`css/style.css`（全部重写）
- 交互：`js/main.js`（邮箱复制 + 卡片整卡点击）
- 字体：系统字体栈，不引入 Google Fonts（与 sheepai-tools 一致）
- 无外部图标库，使用 emoji 或内联 SVG

---

## 3. 配色系统

与 sheepai-tools 品牌色系统对齐：

| CSS 变量 | 值 | 用途 |
|----------|-----|------|
| `--bg` | `#f8fafc` (slate-50) | 页面背景 |
| `--card-bg` | `rgba(255,255,255,0.85)` | 卡片背景（半透明玻璃态） |
| `--card-border` | `rgba(255,255,255,0.75)` | 卡片边框 |
| `--text` | `#0f172a` (slate-950) | 主文字 |
| `--text-mid` | `#475569` (slate-600) | 辅助文字 |
| `--text-dim` | `#94a3b8` (slate-400) | 次要文字 |
| `--emerald` | `#10b981` | 翠绿强调（API 卡片） |
| `--sky` | `#0ea5e9` | 天蓝强调（Tools 卡片） |
| `--violet` | `#8b5cf6` | 淡紫强调（博客卡片） |
| `--amber` | `#f59e0b` | 暖黄强调（社群卡片） |
| `--dark-block` | `#020617` (slate-950) | 深色图标背块 |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 卡片浅阴影 |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07)` | 卡片 hover 阴影 |
| `--radius` | `1.5rem` (24px) | 卡片大圆角 |

---

## 4. 页面布局

```
┌──────────────────────────────────────────────────┐
│  Header: Logo + 标语（~48px）                     │
├──────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │   API    │ │  Tools   │ │   博客   │ │ 社群 │ │
│  │  平台    │ │  平台    │ │         │ │ 联系 │ │
│  │ (翠绿)   │ │ (天蓝)   │ │ (淡紫)  │ │(暖黄)│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────┘ │
├──────────────────────────────────────────────────┤
│  Footer: 一行文字（~30px）                        │
└──────────────────────────────────────────────────┘
```

- 页面高度 `100vh` / `100dvh`（桌面端无滚动）
- 4 张卡片均分剩余高度，gap 16px
- 整体 padding 20px（桌面）/ 14px（平板）/ 10px（手机）

---

## 5. 组件详细设计

### 5.1 Header

```
🐑 CyberSheep | 赛博小羊          Your Gateway to AI
```

- Logo 左对齐，标语右对齐
- Logo：emoji 羊 + 品牌英文名 + 竖线分隔 + 中文名
- 英文名用深色粗体，中文名用 slate-600
- 标语用 slate-400，字号 0.8rem
- 无背景，无边框，直接位于页面 padding 区域内

### 5.2 卡片通用结构

每张卡片：
- `border-radius: var(--radius)` (24px)
- `background: var(--card-bg)` 半透明白色
- `backdrop-filter: blur(16px)`
- `border: 1px solid var(--card-border)`
- 左侧 3px 彩色强调边框（`border-left`）
- 整体 `<a>` 包裹（除社群卡片），hover 时阴影增强 + 微上移
- 内边距：`padding: 20px 22px`
- flex column 布局，内容垂直分布

**Hover 效果：**
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: <对应彩色>;
}
```

### 5.3 卡片 1 — SheepAI API 聚合平台

**强调色：** 翠绿 `--emerald` | **底色 tint：** `rgba(16, 185, 129, 0.03)`

```
┌─────────────────────────────────────┐
│ 🐑 SheepAI API 聚合平台   [API中转] │ ← 标题行
│                                     │
│ 一个 API 令牌调用全球大模型          │ ← 副标题 bold
│                                     │
│ 兼容 OpenAI SDK，3 行代码即可集成。  │ ← 描述
│ 按量计费 · 多区域节点 · 99.9% 可用  │
│                                     │
│ Claude  GPT  Gemini  DeepSeek  Qwen │ ← 品牌色·文字胶囊
│                                     │
│         ⚡ 访问 sheepai.top          │ ← 底部链接行
└─────────────────────────────────────┘
```

特殊元素：
- **标题 icon**：使用 `assets/cybersheep.png`（缩小到 22x22 作为行内图标）替代 emoji
- **模型品牌标签**：品牌色圆点 + 官方名称，白底 pill 排列。品牌色映射：
  - Claude: `#d97706`（暖橙）
  - GPT: `#10b981`（翠绿，与主题色一致）
  - Gemini: `#3b82f6`（蓝）
  - DeepSeek: `#6366f1`（靛蓝）
  - Qwen: `#8b5cf6`（紫）
- **整卡可点击**，跳转 `https://www.sheepai.top`

### 5.4 卡片 2 — SheepAI Tools 工具平台

**强调色：** 天蓝 `--sky` | **底色 tint：** `rgba(14, 165, 233, 0.03)`

```
┌─────────────────────────────────────┐
│ 🛠️ SheepAI Tools 工具平台 [在线工具] │
│                                     │
│ 汇集多种实用在线 AI 工具             │
│                                     │
│ SheepAI 账户一键登录，多模型对话对比、│
│ 图像生成、文本翻译/润色/摘要等功能    │
│                                     │
│ 💬 多模型对话  🖼️ 图像生成           │ ← 功能标签 pill（浅蓝底）│
│ 📝 文本处理    🆔 一键登录           │
│                                     │
│         🛠️ 访问工具平台              │
└─────────────────────────────────────┘
```

- 功能标签 pill：浅蓝底 `rgba(14, 165, 233, 0.08)`，天蓝文字
- **整卡可点击**，跳转 `https://sheepaitools.github.io`

### 5.5 卡片 3 — CyberSheep 博客

**强调色：** 淡紫 `--violet` | **底色 tint：** `rgba(139, 92, 246, 0.03)`

```
┌─────────────────────────────────────┐
│ 📝 CyberSheep 博客           [内容] │
│                                     │
│ 分享 AI 使用经验与智能体开发教程      │
│                                     │
│ Claude Code 编程全流程、Codex 智能体 │
│ 搭建、AI 工具链实战，从入门到高级     │
│                                     │
│ 📖 AI 上手  🛠️ Claude Code          │ ← 主题 pill（浅紫底）
│ 🤖 Agent    💡 踩坑经验             │
│                                     │
│         📖 阅读博客                  │
└─────────────────────────────────────┘
```

- 主题标签 pill：浅紫底 `rgba(139, 92, 246, 0.08)`，紫色文字
- **整卡可点击**，跳转 `https://cybersheep.notion.site/CyberSheep-393bb7144bb6805ba663c8f4b858b685`

### 5.6 卡片 4 — 社群与联系

**强调色：** 暖黄 `--amber` | **底色 tint：** 纯白（无 tint，区分度最高）

```
┌─────────────────────────────────────┐
│ 💬 社群与联系                [社群] │
│                                     │
│  ┌──────┐                           │
│  │      │  扫码加入官方 QQ 群        │ ← 二维码左 + 说明右
│  │  QR  │  交流 AI 心得、获取资讯    │
│  │      │                           │
│  └──────┘                           │
│                                     │
│ 📧 cybersheep33@gmail.com           │ ← 邮箱，hover 变色
│ ──────────────────────────          │
│ 点击复制邮箱地址                     │ ← 提示小字
└─────────────────────────────────────┘
```

- 二维码：80x80，白色圆角底块包裹（`background: white; border-radius: 12px; padding: 8px`）
- 二维码右侧说明文字，slate-600
- 邮箱使用等宽字体，可点击复制（JavaScript 处理）
- **整卡不可点击**（不是外链），内部元素各自交互
- 卡片无彩色底色 tint，纯白卡片体

### 5.7 Footer

```
Copyright © 2026 CyberSheep 赛博小羊
```

- 单行居中，字号 0.72rem，颜色 `--text-dim`
- 无上边框分隔线（靠 4 卡与 footer 之间的间距自然区分）
- 可选择性加邮箱链接

---

## 6. 背景效果

继承 sheepai-tools 的背景方案：

```css
/* 网格图案 */
.bg-grid {
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
  background-size: 44px 44px;
}

/* 彩色光斑 */
.bg-orb--emerald {
  width: 320px; height: 320px;
  background: var(--emerald);
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.25;
  position: fixed; top: -120px; right: -80px;
}

.bg-orb--sky {
  width: 280px; height: 280px;
  background: var(--sky);
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.25;
  position: fixed; bottom: -100px; left: -60px;
}
```

---

## 7. 响应式断点

| 断点 | 布局 | 卡片排列 | 特殊调整 |
|------|------|----------|----------|
| ≥1024px | 桌面 | 4 列横向 | 全高 `100vh`，无滚动 |
| 640–1023px | 平板 | 2×2 网格（CSS Grid） | 字号微降，卡片间距 12px |
| <640px | 手机 | 单列堆叠 | 取消 100vh，允许滚动；二维码 64x64；光斑透明度降低 |

手机端特殊规则：
```css
@media (max-width: 639px) {
  body { height: auto; overflow-y: auto; }
  .dashboard { height: auto; min-height: 100dvh; }
  .bg-orb--emerald, .bg-orb--sky { opacity: 0.12; }
}
```

---

## 8. JavaScript 交互

极简交互，仅需：

1. **邮箱点击复制** — 点击邮箱地址复制到剪贴板，显示 toast 提示"已复制"
2. **社群卡片部分区域点击** — 邮箱区域可点击复制

API/Tools/博客卡片用原生 `<a>` 标签包裹实现整卡点击，无需 JavaScript。

---

## 9. 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `index.html` | 重写 | 全新 HTML 结构 |
| `css/style.css` | 重写 | 所有样式替换为浅色玻璃态 |
| `js/main.js` | 修改 | 精简为邮箱复制 + 可能的轻量交互 |
| `README.md` | 更新 | 更新项目描述，反映新设计 |
| `assets/cybersheep.png` | 保留 | 用于 API 卡片标题 icon |
| `assets/QQ-group-qcode.jpg` | 保留 | 用于社群卡片二维码 |

---

## 10. 验收标准

- [ ] 桌面端（≥1024px）打开页面，4 张卡片全部在首屏可见，无需滚动
- [ ] 每张卡片各自有独立的彩色强调边框和底色 tint
- [ ] API 卡片包含品牌色模型标签列表
- [ ] API / Tools / 博客卡片整卡可点击跳转
- [ ] 社群卡片展示二维码和邮箱
- [ ] 邮箱点击可复制
- [ ] 页面有网格背景 + 两个彩色光斑
- [ ] 平板端 2×2 网格布局正常
- [ ] 手机端单列滚动布局正常
- [ ] 配色与 sheepai-tools 保持一致

---

## 11. 品牌色 vs 模型色映射参考

```
API 模块 (翠绿)    → --emerald: #10b981
Tools 模块 (天蓝)  → --sky:     #0ea5e9
博客模块 (淡紫)    → --violet:  #8b5cf6
社群模块 (暖黄)    → --amber:   #f59e0b

Claude  标签色 → #d97706 (暖橙)
GPT     标签色 → #10b981 (翠绿)
Gemini  标签色 → #3b82f6 (蓝)
DeepSeek标签色 → #6366f1 (靛蓝)
Qwen    标签色 → #8b5cf6 (紫)
```