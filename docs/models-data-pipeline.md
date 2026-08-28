# 模型广场数据版本流水线

本规范说明 Sheep AI Plus `pricing.json` 如何被归档、清洗、比较并发布到模型广场。

## 1. 数据流

```text
pricing.json
  ├── gzip 原始归档 + SHA-256
  ├── 开放分组白名单清洗
  ├── 品牌归属修正
  ├── 计费类型识别
  ├── 字段精简与中文描述
  ├── 与上一版生成差异
  ├── 发布 assets/models-data.js
  └── 生成可视化公告并登记到公告中心
```

入口命令：

```bash
python3 scripts/update-models.py pricing.json
```

## 2. 文件职责

| 文件 | 职责 |
|---|---|
| `scripts/model_pipeline.py` | 清洗、计费识别、渲染、统计和价格锚点 |
| `scripts/update-models.py` | 版本归档、差异、清单与当前快照发布 |
| `scripts/model_announcement.py` | 从历史差异生成富 HTML 公告与公告元数据 |
| `scripts/build-models-data.py` | 旧命令兼容入口，不创建历史版本 |
| `data/available-groups.json` | 用户可用分组白名单与类别 |
| `data/brand-overrides.json` | 上游 vendor 错误修正 |
| `data/model-snapshots/manifest.json` | 历史版本顺序与最新版 |
| `assets/models-data.js` | 浏览器加载的当前版本 |

日常更新必须使用 `update-models.py`；兼容入口只用于调试，不能作为正式发布流程。

## 3. 不可覆盖的版本

每次更新建立 `data/model-snapshots/YYYY-MM-DD/`：

- `raw.json.gz`：未经修改的原始响应；
- `cleaned.json`：与模型广场当前数据结构一致；
- `metadata.json`：来源、哈希、统计、上一版本和价格锚点；
- `changes.json`：机器可读差异；
- `update-log.md`：维护者日志，包含来源、SHA、归档位置、统计和校验信息。

同一日期已经存在时脚本会拒绝运行，避免覆盖历史证据。

仓库迁移前的 2026-08-24 数据作为基线版本保存，因为当时没有原始 `pricing.json`，所以其 `raw_available` 为 false。

## 4. 清洗规则

### 开放分组

模型的 `enable_groups`、顶层 `group_ratio` 和 `usable_group` 只保留 `data/available-groups.json` 中的分组。

新增分组前必须确认它对用户开放。测试、特供、内部专线和无法确认的分组不得直接加入。

### 品牌修正

当上游 vendor 明显错误时，在 `data/brand-overrides.json` 记录：

```json
{
  "overrides": {
    "aigc-image-kling": 88
  }
}
```

### 保留字段

仅保留模型广场需要的名称、描述、标签、模型类型、计费倍率、公开分组、端点、可用状态、图标、vendor 和特殊计费字段。

若 `translations.zh.description` 存在，优先使用中文描述。

## 5. 计费类型

| 类型 | 判断字段 | 展示方式 |
|---|---|---|
| `basic` | 无特殊字段 | 输入、输出、缓存命中 |
| `cache` | 缓存创建倍率 | 增加 5m / 1h 缓存创建 |
| `step` | `step_ratios` | 按 Token 区间展示输入输出 |
| `image` | `image_ratio` | 按张/相对倍率 |
| `audio` | `audio_ratio` | 按时长/相对倍率 |

价格公式：

- 基础输入 $/1M = `model_ratio × 2`；
- 输出 = 基础输入 × `completion_ratio`；
- 缓存命中 = 基础输入 × `cache_ratio`；
- 缓存创建 = 基础输入 ×相应创建倍率；
- 分组最终估价 = 基础价 × (`group_ratio[group] × 1.4`)；
- 阶梯价再乘以该阶段的 prompt/completion step ratio。

页面和维护日志中的价格都是估算，以 Sheep AI Plus 实际扣费为准。

## 6. 差异范围

相邻版本比较：

- 新增和移除模型；
- `model_ratio`、输出/缓存倍率与模型价格；
- 阶梯和计费类型；
- 公开分组与端点；
- 模型可用状态；
- 分组倍率新增、移除和变化。

完整差异写入 `changes.json`，维护摘要与技术溯源信息写入 `update-log.md`。

数组字段在清洗阶段稳定排序；公开分组和端点按集合语义比较，避免仅因上游返回顺序变化产生虚假差异。

## 7. 可视化公告

非基线版本归档成功后，`update-models.py` 自动调用 `model_announcement.py`：

- 输出 `announcements/models-update-YYYY-MM-DD.html`；
- 在 `data/announcements.json` 中新增或更新对应公告；
- 重新生成 `assets/site-data.js`；
- 首页最新三条和公告中心自动出现该版本；
- API、SHA、原始文件和校验锚点只写入维护日志，不进入用户公告。

公告必须展示新增、下架、价格倍率、公开分组、端点和必要的使用提醒。无变化的类型保留明确状态，完整分组明细使用可展开表格。

每次更新固定产生两个面向不同读者的结果：

- 用户公告：`announcements/models-update-YYYY-MM-DD.html`；
- 维护日志：`data/model-snapshots/YYYY-MM-DD/update-log.md`。

2026-08-24 基线版本保留迁移前的旧文件名 `report.md`，后续版本统一使用 `update-log.md`。

如需从已经归档的版本重新生成公告：

```bash
python3 scripts/model_announcement.py --version YYYY-MM-DD
```

## 8. 发布校验

`python3 scripts/validate-site.py` 会确认：

- `manifest.json` 有最新版；
- 最新 `cleaned.json` 存在；
- 最新历史快照与 `assets/models-data.js` 完全一致；
- 最新模型公告已登记且详情页存在；
- 所有脚本、JSON 和站内链接有效。

模型更新后必须同时提交当前快照和历史目录。
