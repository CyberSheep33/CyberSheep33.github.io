# CyberSheep 赛博小羊

CyberSheep 是围绕 AI 服务使用体验构建的一站式静态门户：帮助用户注册 Sheep AI Plus、创建 API Key、选择模型、为 AI Coding 工具完成配置，并在遇到问题时查找公告与解决方案。

站点同时展示 CyberSheep / SheepAI-Lab 项目、精选创作者项目，以及不同平台上的优质 AI 博客和文章入口。

## 用户路径

```text
CyberSheep 首页
  → 注册 Sheep AI Plus / 创建 API Key
  → 模型广场选择模型和分组
  → 快速开始选择工具、模型和配置方式
  → 完成配置并开始使用
  → 在公告与帮助中查找问题解决方案
```

## 页面模块

```text
index.html                 首页与核心用户路径
models/index.html          模型广场
guide/index.html           快速开始：工具 × 模型 × 配置方式
guide/*.html               已发布教程详情
tools/ccswitch.html        CC Switch 系列进阶配置生成器
announcements/index.html   公告与帮助搜索页
announcements/*.html       富 HTML 公告详情
blog/index.html            博客平台、博主与精选文章导航
```

## 技术形态

- 原生 HTML、CSS、JavaScript；
- Python 只用于构建数据、更新模型快照和验证；
- 最终产物仍是普通静态文件，由 GitHub Pages 直接托管；
- 不依赖前端框架、数据库或后端服务；
- 浏览器数据通过生成的 JS 快照注入，同时支持 GitHub Pages 与本地 `file://`。

## 数据驱动架构

人工或 AI 主要维护 `data/` 中的源数据：

| 文件 | 职责 |
|---|---|
| `data/site.json` | 品牌信息与全局链接 |
| `data/projects.json` | 官方项目和精选创作者项目 |
| `data/announcements.json` | 公告列表、分类、关键词与关联数据 |
| `data/tutorial-tools.json` | 工具目录与规划状态 |
| `data/tutorial-models.json` | 原生模型和其他模型目标 |
| `data/tutorial-methods.json` | CC Switch、配置文件、内置面板等配置方式 |
| `data/tutorial-routes.json` | 已确认有效的教程组合与页面 URL |
| `data/blogs.json` | 博客平台、博主和精选文章 |
| `data/available-groups.json` | 模型广场公开分组白名单 |
| `data/brand-overrides.json` | 上游模型品牌归属修正 |
| `data/model-snapshots/` | 每周模型历史、元数据和差异报告 |

运行以下命令生成浏览器使用的数据：

```bash
python3 scripts/build-site-data.py
```

生成文件是 `assets/site-data.js`，请勿手动编辑。

## 本地开发

```bash
python3 scripts/build-site-data.py
python3 -m http.server 8080
```

浏览器访问 `http://localhost:8080`。

提交前运行：

```bash
python3 scripts/validate-site.py
```

验证包括：

- JSON、Python 和 JavaScript 语法；
- 站内链接和资源引用；
- 外链安全属性；
- 教程路线兼容关系与页面存在性；
- 公告 slug 与详情页；
- 生成数据同步状态；
- 模型最新版与历史快照一致性；
- 疑似 API Key 泄漏。

GitHub Actions 会在 push 和 pull request 时重复执行相同校验。

## 快速开始教程维护

快速开始不是普通页面列表，而是由有效路线驱动：

```text
工具 + 模型目标 + 配置方式 + 真实教程页面
```

新增教程时：

1. 在 `tutorial-tools.json` 确认工具；
2. 在 `tutorial-models.json` 确认模型目标；
3. 在 `tutorial-methods.json` 确认配置方式与兼容范围；
4. 创建教程 HTML；
5. 在 `tutorial-routes.json` 添加 `published` 路线；
6. 运行构建与验证。

构建脚本会拒绝 CC Switch 不支持的工具组合。完整规范见：

- `docs/product-architecture-v3.md`
- `docs/quickstart-content-model.md`

## 公告维护

公告继续使用富 HTML，以便针对时间线、对照表、故障排查和数据展示设计不同布局。

新增公告时：

1. 创建 `announcements/<slug>.html`；
2. 按 `docs/announcement-html-standard.md` 隔离私有 CSS/JS；
3. 在 `data/announcements.json` 最前面添加元数据；
4. 运行 `python3 scripts/build-site-data.py`；
5. 运行 `python3 scripts/validate-site.py`。

首页最新三条、公告中心搜索和详情页上下篇都会自动读取结构化数据。

## 项目与博客维护

- 新增官方项目：向 `data/projects.json` 添加 `source: "official"`；
- 新增精选项目：添加 `source: "curated"`；
- 修改 GitHub 主入口：编辑 `data/site.json` 的 `links.github`；
- 新增平台、博主或文章：编辑 `data/blogs.json`；
- 不得生成虚构创作者、文章或链接。

## 每周模型数据更新

把从 Sheep AI Plus 抓取的 `pricing.json` 放入仓库，然后执行：

```bash
python3 scripts/update-models.py pricing.json
```

脚本自动：

- 以日期创建不可覆盖的历史版本；
- gzip 保存原始 JSON；
- 应用分组白名单、品牌修正和计费识别；
- 生成清洗快照、SHA-256、统计和价格锚点；
- 与上一版比较新增、移除、价格字段和分组倍率变化；
- 生成 `changes.json` 与 `report.md`；
- 更新模型广场使用的 `assets/models-data.js`；
- 更新 `data/model-snapshots/manifest.json`。

可指定数据版本日期：

```bash
python3 scripts/update-models.py pricing.json --date 2026-08-31
```

历史版本禁止覆盖。抓取错误时应修正源文件并使用新的明确版本，不要直接修改已有快照。

详细说明见 `docs/models-data-pipeline.md`。

## 公共代码

| 文件 | 职责 |
|---|---|
| `js/site.js` | Header、Footer、导航、Toast 与模块路径推导 |
| `js/main.js` | 主题、项目卡片、全局链接与邮箱复制 |
| `js/guide-catalog.js` | 快速开始工具选择和有效路线渲染 |
| `js/announcements.js` | 公告搜索、列表和上下篇 |
| `js/blog.js` | 博客平台、博主和文章渲染 |
| `js/ccswitch-presets.js` | CC Switch 配置预设 |
| `js/ccswitch-core.js` | Deep Link 生成与 API Key 校验 |
| `js/models.js` | 模型搜索、筛选、价格与详情 |

## 安全红线

- API Key 只能在用户浏览器内存中使用；
- 禁止把 API Key 写入 JSON、预设、localStorage、Cookie 或日志；
- 配置链接包含 API Key，只能由用户主动复制；
- 外部链接必须使用 `rel="noopener"`；
- 不得凭印象编造工具兼容关系、Deep Link 参数或模型价格。

## 发布

仓库通过 GitHub Pages 部署。推送 `main` 前应确保：

```bash
python3 scripts/build-site-data.py --check
python3 scripts/validate-site.py
```

GitHub Actions 校验通过后，现有 Pages 流程继续发布静态文件。
