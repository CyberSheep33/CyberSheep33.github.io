# 模型广场每周更新速查

完整规则见 [`models-data-pipeline.md`](models-data-pipeline.md)。本页只保留日常更新命令。

## 1. 获取原始数据

登录 Sheep AI Plus 后访问 `https://sheepaiplus.top/api/pricing`，把完整响应保存为 `pricing.json`。

不要手动删字段、修改分组倍率或把 API Key 保存在仓库中。

## 2. 创建新版本

```bash
python3 scripts/update-models.py pricing.json
```

需要指定版本日期时：

```bash
python3 scripts/update-models.py pricing.json --date YYYY-MM-DD
```

脚本会同时完成：

- 保存 `raw.json.gz` 原始备份与 SHA-256；
- 应用开放分组白名单和品牌修正；
- 识别 basic/cache/step/image/audio 计费类型；
- 生成清洗后的 `cleaned.json`；
- 与上一版本计算模型及分组差异；
- 生成 `changes.json` 和维护者可读的 `update-log.md`；
- 更新 `assets/models-data.js`；
- 更新历史版本清单；
- 生成 `announcements/models-update-YYYY-MM-DD.html` 可视化公告；
- 自动登记公告元数据并更新 `assets/site-data.js`。

历史目录：

```text
data/model-snapshots/YYYY-MM-DD/
  raw.json.gz
  cleaned.json
  metadata.json
  changes.json
  update-log.md
```

历史版本不可覆盖；重复日期会直接报错。

## 3. 核对输出

重点检查脚本输出的：

- 模型、公开分组、厂商和端点数量；
- 计费类型分布；
- `claude-opus-5` 与 `gpt-5.6-sol` 价格锚点；
- 新增、移除和字段变化模型数；
- 分组倍率变化数。

打开本次版本的 `update-log.md` 和 `changes.json`，确认来源、SHA、数量与变化符合预期。

同时打开 `announcements/models-update-YYYY-MM-DD.html`，重点核对：

- 数量与 `update-log.md` 一致；
- 新增、下架模型名称没有截断或误分类；
- 价格无变化时明确显示无变化状态；
- 分组变化图表与完整明细一致；
- 页面没有展示 API、SHA、原始文件或其他维护信息；
- 结尾提供模型广场入口和必要的可用性、计费提醒。

## 4. 全站验证

```bash
python3 scripts/validate-site.py
python3 -m http.server 8080
```

浏览器检查模型搜索、分组筛选、阶梯价格、详情抽屉和数据日期。

## 5. 提交

模型更新通常需要提交：

```text
assets/models-data.js
assets/site-data.js
announcements/models-update-YYYY-MM-DD.html
data/announcements.json
data/model-snapshots/
data/available-groups.json       如有开放分组变化
data/brand-overrides.json        如有品牌修正
scripts/                         如有计费规则变化
docs/                            如有规则说明变化
```

不要只提交 `assets/models-data.js`，否则历史记录会与线上最新版不同步，自动校验也会失败。
