# 模型广场数据流水线规范

> 本文档说明「Sheep AI Plus 抓取的 `pricing.json`」如何被清洗、转化为
> 模型广场直接使用的 `assets/models-data.js`。适合**交给智能体执行**。

---

## 1. 数据流总览

```
你手动抓取 pricing.json（https://sheepaiplus.top/api/pricing）
   ↓
┌─ scripts/build-models-data.py ──────────────────────────┐
│  Step 1  分组白名单清洗    data/available-groups.json   │
│  Step 2  品牌修正          data/brand-overrides.json    │
│  Step 3  计费类型识别      （自动检测，无需人工）        │
│  Step 4  精简字段 + 中文描述                            │
└─────────────────────────────────────────────────────────┘
   ↓
assets/models-data.js（含 data + 规则，网页直接使用）
   ↓
目验 → git 提交 → GitHub Pages 自动部署
```

**分工原则**：
- **规则（有效分组、品牌修正）** → 独立数据文件，人工/智能体维护；
- **确定性处理（字段精简、分组过滤、计费识别）** → 脚本自动完成；
- **需要判断的内容**（如新增分组是否开放、vendor 是否标错）→ 智能体依据本文档 + 数据判断后更新规则文件。

---

## 2. 规则文件

### 2.1 `data/available-groups.json` — 有效分组表

```json
{
  "_meta": { "source": "Sheep AI 与 Sheep AI Plus 分组对照 CSV", "updated": "2026-08-24" },
  "groups": {
    "Claude-Code-1": "Claude",
    "Codex-Gpt-2": "GPT / Codex",
    "deepseek-1": "DeepSeek"
  }
}
```

- 键 = **API 实际分组名**；值 = 分组类别（用于侧边栏分组归类）。
- 只保留**向用户开放**的分组，剔除 `测试`、`特供-*`、`qjzf`、`huawei-*` 专线等内部分组。
- 新增/剔除开放分组时，修改此文件即可，前端自动生效。

### 2.2 `data/brand-overrides.json` — 品牌修正表

```json
{
  "_meta": { "说明": "上游 vendor 标错的模型修正表。键=模型名，值=正确 vendor_id", "updated": "2026-08-24" },
  "overrides": { "aigc-image-kling": 88 }
}
```

- 当上游 `/api/pricing` 把某模型归错厂商时，在这里覆盖为正确 `vendor_id`。
- 修改后重新运行脚本即可。

---

## 3. 给智能体的执行步骤

> 用户抓取了新版 `pricing.json`，把文件放到仓库根目录，然后说
> 「按 `docs/models-data-pipeline.md` 更新模型数据」。智能体执行：

### Step 1：运行构建脚本

```bash
python3 scripts/build-models-data.py
```

脚本会自动完成 Step 1/2/3/4（分组过滤、品牌修正、计费识别、字段精简、中文描述），
输出 `assets/models-data.js` 并打印：模型数、有效分组数、计费类型分布、价格锚点校验。

### Step 2：核对规则文件是否需要更新

对比脚本打印结果与上一版，重点检查：

- **分组**：`data/available-groups.json` 是否需新增开放分组 / 剔除已下线分组。
  判断依据：新出现的分组名是否属于「官方开放分组」（通常符合命名规范且非 测试/特供/专线）。
- **品牌**：检查是否有模型名与 vendor 明显不符（如 `aigc-image-kling` 曾被标为腾讯）。
  把错放的模型名 + 正确 `vendor_id` 加进 `data/brand-overrides.json`。
- **计费**：若上游出现新的计费字段，在 `docs/models-data-pipeline.md` 的计费规则章节补充，
  并在 `scripts/build-models-data.py` 的 `detect_billing` 中增加识别分支。

更新规则文件后重新运行脚本，确认输出。

### Step 3：校验

- 价格锚点：脚本已打印 claude-opus-5 / gpt-5.6-sol 校验，核对是否合理；
- 本地双击打开 `models/index.html`，确认：
  - 能搜到新模型、价格正常；
  - 分组筛选只出现有效分组；
  - 阶梯模型分组表展示分段价；
  - `node --check js/models.js` 通过。

### Step 4：提交推送

```bash
git add assets/models-data.js data/ scripts/ docs/
git commit -m "🔄 更新模型广场数据（YYYY-MM-DD）"
git push origin main
```

---

## 4. 计费规则

构建脚本会根据模型字段自动识别计费类型（写入每个模型的 `billing_type`），前端据此自适应展示：

| 计费类型 | 判定字段 | 价格维度 |
|---|---|---|
| `basic` 基础型 | 无特殊字段 | 输入 / 输出 / 缓存命中 |
| `cache` 缓存创建型 | `cache_creation_5m_ratio` / `cache_creation_1h_ratio` | +5m / 1h 缓存创建 |
| `step` 阶梯计费型 | `step_ratios` | 输入 / 输出按 tokens 分段计价 |
| `image` 图像型 | `image_ratio` | 按张 |
| `audio` 音频型 | `audio_ratio` | 按时长 |

**价格公式**（已用真实计费日志校验）：

- 基础输入 $/1M = `model_ratio × 2`
- 补全 = 输入 × `completion_ratio`；缓存命中 = 输入 × `cache_ratio`
- 5m / 1h 缓存创建 = 输入 × `cache_creation_5m/1h_ratio`
- **分组最终价 = 基础价 × (`group_ratio[分组]` × 1.4)**
- 阶梯：各段 = 基础价 × 该段 `prompt_step_ratio` / `completion_step_ratio`（相邻同倍率段自动合并）

**校验锚点**：
- claude-opus-5（`model_ratio=2.5`）：基础输入 $5；AWS-Bedrock-1（group_ratio 0.44118）分组输入 = 5 × 0.44118 × 1.4 ≈ **3.088**
- gpt-5.6-sol（`model_ratio=2.5`，阶梯）：S1 $5（0~272k）、S2 $10（272k~1M、>1M 合并）

---

## 5. 常见问题

- **脚本报「找不到 pricing.json」**：把文件放到仓库根目录，或用 `python3 scripts/build-models-data.py /路径/pricing.json`。
- **分组数异常**：检查 `data/available-groups.json` 是否被误改，以及上游分组名是否有变更。
- **价格对不上**：先核对 `group_ratio` 是否含该分组；若分组不在有效表中，前端会隐藏，属正常。
- **本地打不开**：确认 `models/index.html` 引入 `../assets/models-data.js` 且在 `models.js` 之前。
