# 生态模块开发规范

本仓库是数据驱动的纯静态站点。新增模块必须复用公共布局、设计变量和验证流程。

## 当前模块

```text
models/          模型广场
guide/           快速开始与教程
tools/           进阶工具
announcements/   公告与帮助
blog/            博客与知识导航
```

公共组件：

- `js/site.js`：Header、Footer、导航、Toast 和根路径推导；
- `js/main.js`：主题、项目、全局链接和邮箱；
- `css/style.css`：全站变量和基础组件；
- `assets/site-data.js`：由 `data/*.json` 构建的浏览器数据。

## 新模块步骤

1. 新建 `<module>/index.html`；
2. 页面只编写自己的 `<main>`，复用 `#siteHeader` 和 `#siteFooter`；
3. 私有样式放 `css/<module>.css`，私有脚本放 `js/<module>.js`；
4. 在 `js/site.js` 的 `NAV` 注册入口和 `section`；
5. 如需结构化内容，在 `data/` 建源数据并由 `build-site-data.py` 合并；
6. 运行全站验证和浏览器目验。

`site.js` 根据自身 script 路径推导站点根目录，不需要把新目录加入硬编码正则。

## 页面骨架

```html
<header class="site-header" id="siteHeader"></header>
<main>…模块内容…</main>
<footer class="site-footer" id="siteFooter"></footer>

<script src="../assets/site-data.js"></script> <!-- 页面需要结构化数据时 -->
<script src="../js/site.js"></script>
<script src="../js/main.js"></script>
<script src="../js/<module>.js"></script>
```

`site.js` 必须在 `main.js` 前；依赖 `CYBERSHEEP_DATA` 的脚本必须在 `site-data.js` 后。

## 约束

- 不新增后端、数据库或前端框架；
- 不在多个 HTML 中复制同一列表数据；
- 外链带 `rel="noopener"`；
- 表单有 label，图像有合理 alt，页面有返回路径；
- API Key 不进入数据文件、存储和日志；
- 内容不足时提供真实空状态，不使用虚构项目或文章。

## 验证

```bash
python3 scripts/build-site-data.py
python3 scripts/validate-site.py
python3 -m http.server 8080
```

至少检查桌面、375px、浅色、深色、键盘焦点和浏览器控制台。
