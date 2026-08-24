# CyberSheep 品牌主页设计规格

**日期**: 2026-07-05
**仓库**: git@github-cs33:CyberSheep33/CyberSheep33.github.io.git
**部署**: GitHub Pages

---

## 一、项目概述

为"赛博小羊 CyberSheep"品牌制作单页主页，集成 Sheep AI API 平台、SheepAITools 工具平台、CyberSheep 博客、社群联系等信息入口，部署至 GitHub Pages。

## 二、技术方案

- **纯静态 HTML/CSS/JS**，零依赖，无构建步骤
- 部署方式：直接 push 到 `CyberSheep33.github.io` 仓库的 `main` 分支
- 响应式设计：桌面端、平板、手机三档适配
- 支持系统深色/浅色模式（默认深色）

## 三、页面结构（单页6段 + 导航 + 页脚）

### 导航栏
- 固定顶部，滚动时背景模糊加深
- 左侧：品牌 Logo（CSS 文字 Logo "CyberSheep | 赛博小羊" + 霓虹发光效果）
- 右侧：锚点链接 — API | 工具 | 模型 | 博客 | 社群
- 移动端：汉堡菜单展开

### 1. Hero 主视觉区
- 赛博小羊角色图片（assets/cybersheep.png）作为视觉焦点
- 标题：「CyberSheep 赛博小羊」
- 副标题：AI API 聚合服务平台 | 在线工具 | 智能体教程
- 双按钮： [进入 SheepAI] → sheepai.top / [探索工具] → sheepaitools.github.io

### 2. Sheep AI API 平台
- 介绍多模型聚合中转服务
- 特性卡片：模型丰富 | 稳定高速 | 简易接入
- 跳转按钮 → sheepai.top

### 3. SheepAITools 工具平台
- 介绍在线 AI 工具集合
- 使用方式：SheepAI 注册用户 ID + 系统令牌 / API 令牌登录
- 跳转按钮 → sheepaitools.github.io

### 4. 接入模型展示
- 模型图标/名称网格：Claude, GPT, Gemini, DeepSeek 等
- 视觉上展示平台技术能力

### 5. CyberSheep 博客
- 介绍博客内容：AI 使用经验、Claude Code/Codex 等智能体教程
- 跳转按钮 → Notion 博客

### 6. 社群 & 联系
- QQ 群二维码（assets/QQ-group-qcode.jpg）
- 邮箱：cybersheep33@gmail.com（可点击 mailto）
- 可能的其他社交媒体

### 页脚
- Copyright © 2026 CyberSheep
- 各平台链接重复

## 四、视觉设计

### 配色
| 用途 | 颜色 | 色值 |
|------|------|------|
| 背景主色 | 深空黑 | `#0a0a12` |
| 卡片背景 | 半透明深 | `rgba(255,255,255,0.04)` |
| 霓虹青主色 | Cyan | `#00f0ff` |
| 柔和紫辅色 | Purple | `#b388ff` |
| 文字主色 | 白 | `#e8e8ed` |
| 文字辅色 | 灰 | `#8888a0` |
| 卡片边框 | 半透明白 | `rgba(255,255,255,0.06)` |
| 发光效果 | 霓虹青阴影 | `0 0 20px rgba(0,240,255,0.3)` |

### 字体
- 中文：PingFang SC / Microsoft YaHei（系统默认）
- 英文/代码：JetBrains Mono（CDN 加载）
- 正文：system-ui 回退栈

### 设计元素
- 卡片：圆角 16px，半透明毛玻璃 `backdrop-filter: blur(20px)`
- 按钮：胶囊形 (pill)，霓虹青渐变边框，hover 发光
- 背景：网格点阵图案（CSS generated）
- 分割线：线性渐变 `#00f0ff → #b388ff`

### 动效
- 滚动渐入：Intersection Observer + CSS `@keyframes fadeInUp`
- 卡片 hover：上浮 4px + 阴影增强
- 按钮 hover：发光扩大
- 导航滚动：背景从透明渐变到带模糊的深色

### Logo（CSS 实现）
```html
<div class="logo">
  <span class="logo-emoji">🐑</span>
  <span class="logo-text">CyberSheep</span>
  <span class="logo-divider">|</span>
  <span class="logo-cn">赛博小羊</span>
</div>
```
霓虹发光效果：`text-shadow: 0 0 10px rgba(0,240,255,0.6), 0 0 40px rgba(0,240,255,0.3)`

## 五、响应式断点

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| Desktop | ≥1024px | 完整多列布局，大图 |
| Tablet | 768-1023px | 缩减列数，适中字体 |
| Mobile | <768px | 单列堆叠，缩略导航（汉堡菜单） |

## 六、性能目标

- 首屏加载：<2s（纯静态，无 JS 框架）
- 图片优化：使用现代格式（WebP 备选），添加 `loading="lazy"`
- 零外部请求（除字体 CDN 和跳转链接外）
- Lighthouse 评分目标：Performance ≥95, Accessibility ≥95, SEO ≥90

## 七、文件结构

```
/
├── index.html          # 主页面
├── assets/
│   ├── cybersheep.png  # 品牌图片
│   └── QQ-group-qcode.jpg  # QQ群二维码
├── css/
│   └── style.css       # 样式
├── js/
│   └── main.js         # 交互逻辑
├── CNAME               # 自定义域名（如需）
└── README.md
```
