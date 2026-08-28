# 公告富 HTML 设计与开发规范

> 公告允许每篇采用不同布局和视觉表达，但必须共享结构化元数据、全站外壳和安全边界。

## 1. 固定与自由部分

由站点统一提供：

- Header、Footer、主题切换和 Toast；
- 返回公告中心；
- 页面标题、摘要、日期和分类元数据；
- 上一篇、下一篇和相关推荐；
- 首页最新三条与公告中心列表；
- 搜索索引所需的标题、摘要和关键词。

每篇公告可以自由设计：

- 正文布局；
- 时间线、步骤卡片、FAQ、对照表和图表；
- 与内容相关的局部动效；
- 页面专属 CSS 与少量无依赖 JavaScript。

## 2. 元数据

每篇公告必须在 `data/announcements.json` 中登记：

- `slug`、`title`、`excerpt`；
- `date` 和可选 `updated`；
- `type`：`announcement`、`update`、`troubleshooting`、`guide` 或 `faq`；
- `category`；
- `keywords`；
- `featured`；
- 可选 `related_guides`、`related_models`。

详情页仍输出为 `announcements/<slug>.html`，以保持现有 URL。

## 3. HTML 结构

正文根节点必须使用：

```html
<article class="announcement-content announcement-content--SLUG">
  <!-- 页面专属内容 -->
</article>
```

使用语义化的 `article`、`section`、`nav`、`table`、`figure`、`details`。一个页面只能有一个主 `h1`，后续标题按层级排列。

## 4. CSS 边界

- 所有私有选择器必须以 `.announcement-content--SLUG` 开头；
- 使用 `css/style.css` 中的颜色、圆角、阴影和字体变量；
- 不允许覆盖 `body`、`.site-header`、`.site-footer`、`.btn` 等全局选择器；
- 不使用任意的超大 z-index；
- 表格必须有窄屏横向滚动容器；
- 正文段落限制阅读宽度，长标题使用 `text-wrap: balance`；
- 必须提供深色主题适配；
- 动画只改变 transform 和 opacity，并为 `prefers-reduced-motion` 提供关闭规则。

## 5. JavaScript 边界

- 使用 IIFE 或模块作用域，不创建无前缀全局变量；
- 查询范围从公告根节点开始，避免操作其他页面组件；
- 不引入统计、跟踪或非必要第三方脚本；
- 不请求或保存 API Key、Token 等敏感数据；
- 搜索、筛选等交互必须具备无结果状态；
- 交互元素使用真实 button、label 和 ARIA 状态。

## 6. 视觉质量

- 视觉形式必须服务于信息理解，不为每篇公告机械添加 Hero、三等分卡片或大渐变；
- 对照类内容优先使用表格或前后对比；
- 流程类内容优先使用编号步骤或时间线；
- 故障排查优先突出症状、原因、解决办法和验证方式；
- 重要风险使用统一警示组件，不只依赖颜色表达；
- CTA 数量保持克制，主要操作最多一个。

## 7. 验收清单

- 元数据完整且 slug 唯一；
- 公告详情页存在并能从列表进入；
- 桌面、平板和 375px 手机布局正常；
- 浅色、深色和 reduced-motion 正常；
- 标题层级、键盘焦点、表格标题和图片替代文本正确；
- 私有 CSS/JS 未污染其他页面；
- 所有外链带 `target="_blank" rel="noopener"`；
- 无虚构来源、无敏感信息、无不可验证配置参数；
- 上下篇导航与首页最新三条由数据自动生成。
