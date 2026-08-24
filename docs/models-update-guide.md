# 模型广场数据更新指南

> 模型广场（`models/`）为纯静态，数据来自本地快照 `assets/models.json`。
> 因为 `https://sheepaiplus.top/api/pricing` 没有 CORS 头、无法在浏览器端直接调用，
> 需要人工抓取数据后更新快照。本文档说明如何操作（适合交给智能体执行）。

---

## 1. 抓取新数据

1. 用浏览器打开：`https://sheepaiplus.top/api/pricing`
2. 在登录状态下访问（数据含完整分组倍率，无需登录也会返回，但登录更完整）。
3. 页面会显示 JSON，全选复制，或使用浏览器「另存为」把响应保存为 `pricing.json`。

> 抓取到的是一个 JSON 对象，顶层包含：`data`（模型数组）、`group_ratio`（分组倍率）、
> `usable_group`（分组描述）、`vendors`（厂商）、`supported_endpoint`（端点）。

---

## 2. 交给智能体更新（推荐）

把抓取到的 `pricing.json` 放到仓库根目录（或直接上传），然后让智能体执行：

> 「请按 `docs/models-update-guide.md` 更新模型广场数据：读取仓库里的 `pricing.json`，
> 重新生成 `assets/models.json`，校验价格后提交。」

智能体需要完成的步骤（也可手动执行）：

### Step 1：精简生成 `assets/models.json`

读入 `pricing.json`，生成：

```jsonc
{
  "data": [ /* 模型数组 */ ],
  "group_ratio": { /* 原样保留 */ },
  "usable_group": { /* 原样保留 */ },
  "vendors": [ /* 原样保留 */ ],
  "fetched_at": "YYYY-MM-DD"
}
```

每个模型对象**只保留**以下字段（其余丢弃以控制体积）：

```
model_name, description, tags, model_type, model_ratio, completion_ratio,
cache_ratio, cache_creation_5m_ratio, cache_creation_1h_ratio, enable_groups,
supported_endpoint_types, quota_type, model_price, usage_count, available,
icon, type, vendor_id
```

说明：

- 若 `translations.zh.description` 存在，用它替换 `description`（显示中文描述）。
- `group_ratio`、`usable_group`、`vendors` 原样搬入顶层。
- `fetched_at` 写当前日期。

### Step 2：校验价格公式（务必）

用任意一个已知模型核对价格公式，确认无误再提交：

- 基础输入 $/1M = `model_ratio × 0.2470588`
- 补全 = 输入 × `completion_ratio`；缓存命中 = 输入 × `cache_ratio`
- 5m/1h 缓存创建 = 输入 × `cache_creation_5m_ratio` / `cache_creation_1h_ratio`
- **分组最终价 = 基础价 × (`group_ratio[分组]` / 0.0882353)**

校验锚点（claude-opus-5，model_ratio=2.5，AWS-Bedrock-1 group_ratio=0.44118）：

| 项目 | 期望（平台显示） | 计算 |
|---|---|---|
| 基础输入 | 0.6177 | 2.5 × 0.2470588 = 0.6176 |
| 基础补全 | 3.0880 | 0.6176 × 5 = 3.0880 |
| 基础缓存命中 | 0.0618 | 0.6176 × 0.1 = 0.0618 |
| 分组输入 | 3.0880 | 0.6176 × (0.44118/0.0882353) = 3.0880 |
| 分组补全 | 15.4410 | 3.0880 × 5 = 15.4400 |
| 分组缓存命中 | 0.3088 | 0.6176 × 5 × 0.1 = 0.3088 |
| 分组 5m 缓存创建 | 3.8600 | 0.6176 × 5 × 1.25 = 3.8600 |
| 分组 1h 缓存创建 | 6.1770 | 0.6176 × 5 × 2 = 6.1760 |

### Step 3：目验

- 本地打开 `models/index.html`，确认能搜到新模型、价格正常、分组展开正常。
- 确认没有明显异常的离谱价格（如 0 或 NaN）。
- `node --check js/models.js` 通过。

### Step 4：提交推送

```bash
git add assets/models.json
git commit -m "🔄 更新模型广场数据快照（YYYY-MM-DD）"
git push origin main
```

---

## 3. 手动更新（不借助智能体）

1. 按第 1 节抓取 `pricing.json`；
2. 用任意脚本（Python / Node）执行第 2 节 Step 1 的精简逻辑，覆盖写 `assets/models.json`；
3. 按 Step 2 抽查价格；
4. 提交推送。

参考生成脚本（Python）：

```python
import json

with open('pricing.json', encoding='utf-8') as f:
    d = json.load(f)

keep = ['model_name','description','tags','model_type','model_ratio','completion_ratio',
        'cache_ratio','cache_creation_5m_ratio','cache_creation_1h_ratio','enable_groups',
        'supported_endpoint_types','quota_type','model_price','usage_count','available',
        'icon','type','vendor_id']

data = []
for m in d['data']:
    o = {k: m[k] for k in keep if k in m}
    zh = m.get('translations', {}).get('zh', {}).get('description')
    if zh:
        o['description'] = zh
    data.append(o)

out = {
    'data': data,
    'group_ratio': d.get('group_ratio', {}),
    'usable_group': d.get('usable_group', {}),
    'vendors': d.get('vendors', []),
    'fetched_at': 'YYYY-MM-DD',   # 改成当天
}
with open('assets/models.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False)
```

---

## 4. 常见问题

- **价格对不上？** 先核对 `group_ratio` 里是否有该分组；若分组不存在（测试/特供等），
  页面会显示「价格未收录」，属正常。
- **上游接口变了？** 抓取后先看顶层 keys 是否仍含 `data` / `group_ratio`；若缺 `group_ratio`，
  页面将无法计算分组价，需同步调整 `js/models.js`。
- **快照太大？** 若超过约 500KB，可进一步丢弃 `description` 或 `vendors` 等次要字段。
