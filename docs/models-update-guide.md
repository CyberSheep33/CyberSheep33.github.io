# 模型广场数据更新指南

> 模型广场（`models/`）为纯静态。数据来自 `assets/models-data.js`——
> 一个以 `<script>` 注入的 JS 文件（`window.MODELS_DATA = {...}`）。
> 用 script 注入而不是 fetch，是为了在**本地双击打开（file://）** 和 GitHub Pages 上都能正常工作。
>
> 因为 `https://sheepaiplus.top/api/pricing` 没有 CORS 头、无法在浏览器端直接 fetch，
> 需要人工抓取数据后更新快照。本文档说明如何操作（适合交给智能体执行）。

---

## 1. 抓取新数据

1. 用浏览器打开：`https://sheepaiplus.top/api/pricing`
2. 在登录状态下访问（数据含完整分组倍率）。
3. 页面会显示 JSON，全选复制保存为 `pricing.json`。

> 顶层结构：`data`（模型数组）、`group_ratio`（分组倍率）、`usable_group`（分组描述）、
> `vendors`（厂商）、`supported_endpoint`（端点）。

---

## 2. 交给智能体更新（推荐）

把抓取到的 `pricing.json` 放到仓库根目录（或直接上传），然后让智能体执行：

> 「请按 `docs/models-update-guide.md` 更新模型广场数据：读取仓库里的 `pricing.json`，
> 重新生成 `assets/models-data.js`，校验价格后提交。」

智能体需要完成的步骤（也可手动执行）：

### Step 1：精简生成 `assets/models-data.js`

读入 `pricing.json`，生成 `assets/models-data.js`：

```js
window.MODELS_DATA = {
  "data": [ /* 模型数组 */ ],
  "group_ratio": { /* 原样保留 */ },
  "usable_group": { /* 原样保留 */ },
  "vendors": [ /* 原样保留 */ ],
  "supported_endpoint": { /* 原样保留（详情页展示调用端点路径） */ },
  "fetched_at": "YYYY-MM-DD"
};
```

每个模型对象**只保留**以下字段（其余丢弃以控制体积）：

```
model_name, description, tags, model_type, model_ratio, completion_ratio,
cache_ratio, cache_creation_5m_ratio, cache_creation_1h_ratio, enable_groups,
supported_endpoint_types, quota_type, model_price, usage_count, available,
icon, type, vendor_id, step_ratios, image_ratio, audio_ratio,
audio_completion_ratio
```

说明：

- 若 `translations.zh.description` 存在，用它替换 `description`（显示中文描述）。
- `group_ratio`、`usable_group`、`vendors` 原样搬入。
- `fetched_at` 写当前日期。

### Step 2：校验价格公式（务必）

价格公式（已用真实计费日志校验）：

- 基础输入 $/1M = `model_ratio × 2`
- 补全 = 输入 × `completion_ratio`；缓存命中 = 输入 × `cache_ratio`
- 5m / 1h 缓存创建 = 输入 × `cache_creation_5m_ratio` / `cache_creation_1h_ratio`
- **分组最终价 = 基础价 × (`group_ratio[分组]` × 1.4)**

**锚点 1（真实计费日志）**：gpt-5.6-sol，`model_ratio=2.5`，Codex-Gpt-2 分组：

| 项目 | 期望 | 计算 |
|---|---|---|
| 基础输入 | $5 / 1M | 2.5 × 2 = 5 |
| 基础输出 | $30 / 1M | 5 × 6 = 30 |
| 基础缓存命中 | $0.5 / 1M | 5 × 0.1 = 0.5 |
| 分组倍率 | 0.082362 | group_ratio[Codex-Gpt-2] 0.05883 × 1.4 = 0.08236 |

**锚点 2（模型广场显示）**：claude-opus-5，`model_ratio=2.5`，AWS-Bedrock-1 分组
（group_ratio 0.44118）：基础输入 $5，分组输入 = 5 × 0.44118 × 1.4 = **3.088** ✓

### Step 3：目验

- **本地直接双击打开 `models/index.html`**（file://）应能正常显示（不再依赖 fetch）；
- 能搜到新模型、价格正常、分组展开正常；
- `node --check js/models.js` 通过。

### Step 4：提交推送

```bash
git add assets/models-data.js
git commit -m "🔄 更新模型广场数据快照（YYYY-MM-DD）"
git push origin main
```

---

## 3. 手动更新（不借助智能体）

1. 按第 1 节抓取 `pricing.json`；
2. 用任意脚本执行第 2 节 Step 1 的精简逻辑，覆盖写 `assets/models-data.js`；
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
        'icon','type','vendor_id','step_ratios','image_ratio','audio_ratio','audio_completion_ratio']

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
    'supported_endpoint': d.get('supported_endpoint', {}),
    'fetched_at': 'YYYY-MM-DD',   # 改成当天
}
with open('assets/models-data.js', 'w', encoding='utf-8') as f:
    f.write('window.MODELS_DATA = ' + json.dumps(out, ensure_ascii=False) + ';\n')
```

---

## 4. 常见问题

- **价格对不上？** 先核对 `group_ratio` 里是否有该分组；若分组不存在（测试/特供等），
  页面会显示「价格未收录」，属正常。
- **上游接口变了？** 抓取后先看顶层 keys 是否仍含 `data` / `group_ratio`；若缺 `group_ratio`，
  页面将无法计算分组价，需同步调整 `js/models.js`。
- **本地打不开？** 确认 `models/index.html` 里引入了 `../assets/models-data.js` 且在 `models.js` 之前。
