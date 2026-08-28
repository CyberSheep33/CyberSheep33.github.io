# 模块维护速查

## 公告与帮助

1. 创建 `announcements/<slug>.html`；
2. 按 [`announcement-html-standard.md`](announcement-html-standard.md) 编写富 HTML；
3. 在 `data/announcements.json` 最前面添加元数据；
4. 构建并验证。

不得在 `js/announcements.js` 中维护公告数组。该脚本只负责搜索、列表和上下篇。

## 快速开始

快速开始由四份数据组成：

- `tutorial-tools.json`；
- `tutorial-models.json`；
- `tutorial-methods.json`；
- `tutorial-routes.json`。

创建详情页后添加一条有效路线，列表会自动按工具和模型组织。不要手动向 `guide/index.html` 复制卡片。

兼容规则与 AI 维护流程见 [`quickstart-content-model.md`](quickstart-content-model.md)。

## CC Switch

- 预设仍维护在 `js/ccswitch-presets.js`；
- Deep Link 核心只维护在 `js/ccswitch-core.js`；
- 工具兼容范围同步维护在 `data/tutorial-methods.json`；
- CC Switch 生成器属于快速开始的辅助与进阶工具。

新增或修改预设后，要同时确认教程路线中的工具 family 在兼容范围内。

## 项目

编辑 `data/projects.json`：

- 官方项目使用 `source: official`；
- 精选创作者项目使用 `source: curated`；
- `repo_url` 必须是可核验的真实链接；
- 首页只展示 `featured` 不为 false 的条目。

## 博客

编辑 `data/blogs.json` 中的 `platforms`、`creators` 和 `articles`。只收录真实平台、创作者和原文链接。

## 模型广场

正式周更使用：

```bash
python3 scripts/update-models.py pricing.json
```

不要直接运行兼容脚本作为发布流程，也不要只提交 `assets/models-data.js`。详细规范见 [`models-data-pipeline.md`](models-data-pipeline.md)。

## 全局链接

品牌邮箱、API、GitHub 和博客入口维护在 `data/site.json`。修改后运行站点数据构建。

## 每次修改后的最低验证

```bash
python3 scripts/build-site-data.py
python3 scripts/validate-site.py
```

然后通过本地服务器检查相关页面的浅色、深色、桌面和移动端。
