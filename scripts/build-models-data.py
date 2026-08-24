#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""构建模型广场数据快照（数据流水线）

从 Sheep AI Plus 手动抓取的 pricing.json，按「有效分组表 + 品牌修正 + 计费识别」
层层清洗，生成 CyberSheep 模型广场直接使用的 assets/models-data.js。

流水线：
    pricing.json（原始）
      → Step 1 分组白名单清洗（data/available-groups.json）
      → Step 2 品牌修正（data/brand-overrides.json）
      → Step 3 计费类型识别（自动检测 step/image/audio/cache/basic）
      → Step 4 精简字段 + 中文描述 → assets/models-data.js

用法：
    python3 scripts/build-models-data.py [pricing.json 路径]

规则文件（人工/智能体维护）：
    data/available-groups.json  有效分组表（分组 -> 类别）
    data/brand-overrides.json   品牌修正表（模型名 -> 正确 vendor_id）
"""
import datetime
import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 模型对象保留字段（含计费相关字段）
KEEP = [
    "model_name", "description", "tags", "model_type",
    "model_ratio", "completion_ratio", "cache_ratio",
    "cache_creation_5m_ratio", "cache_creation_1h_ratio",
    "enable_groups", "supported_endpoint_types", "quota_type",
    "model_price", "usage_count", "available", "icon", "type", "vendor_id",
    "step_ratios", "image_ratio", "audio_ratio", "audio_completion_ratio",
]


def load_json(path):
    if not os.path.exists(path):
        sys.exit(f"[错误] 找不到 {path}")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def detect_billing(m):
    """根据模型字段识别计费类型。"""
    if m.get("image_ratio"):
        return "image"
    if m.get("audio_ratio"):
        return "audio"
    if m.get("step_ratios"):
        return "step"
    if m.get("cache_creation_5m_ratio") or m.get("cache_creation_1h_ratio"):
        return "cache"
    return "basic"


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO_ROOT, "pricing.json")
    out = os.path.join(REPO_ROOT, "assets", "models-data.js")

    # 读取规则文件
    avail = load_json(os.path.join(REPO_ROOT, "data", "available-groups.json"))
    brand = load_json(os.path.join(REPO_ROOT, "data", "brand-overrides.json"))
    valid_groups = avail.get("groups", {})          # {group: category}
    valid_set = set(valid_groups.keys())
    overrides = brand.get("overrides", {})          # {model_name: vendor_id}

    # 读取原始数据
    d = load_json(src)

    # Step 1-4：逐模型清洗
    data = []
    for m in d.get("data", []):
        o = {k: m[k] for k in KEEP if k in m}

        # 1) 分组白名单清洗：只保留有效分组
        if "enable_groups" in o:
            o["enable_groups"] = [g for g in o["enable_groups"] if g in valid_set]

        # 2) 品牌修正：覆盖错误 vendor_id
        if o.get("model_name") in overrides:
            o["vendor_id"] = overrides[o["model_name"]]

        # 3) 计费类型识别
        o["billing_type"] = detect_billing(o)

        # 4) 中文描述
        zh = m.get("translations", {}).get("zh", {}).get("description")
        if zh:
            o["description"] = zh

        data.append(o)

    # 顶层数据：只保留有效分组的倍率与描述
    out_obj = {
        "data": data,
        "group_ratio": {g: v for g, v in d.get("group_ratio", {}).items() if g in valid_set},
        "usable_group": {g: v for g, v in d.get("usable_group", {}).items() if g in valid_set},
        "vendors": d.get("vendors", []),
        "supported_endpoint": d.get("supported_endpoint", {}),
        # 规则（供前端运行时使用）
        "available_groups": valid_groups,
        "brand_overrides": overrides,
        "fetched_at": datetime.date.today().isoformat(),
    }

    js = "/* CyberSheep 模型广场数据快照（由 scripts/build-models-data.py 生成） */\n"
    js += "window.MODELS_DATA = " + json.dumps(out_obj, ensure_ascii=False) + ";\n"

    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(js)

    # 校验输出
    print(f"已生成 {out}")
    print(f"  模型数: {len(data)} | 有效分组数: {len(out_obj['group_ratio'])} | 厂商数: {len(out_obj['vendors'])}")
    print(f"  fetched_at: {out_obj['fetched_at']}")
    print(f"  大小: {os.path.getsize(out) / 1024:.1f} KB")

    # 计费类型分布
    from collections import Counter
    print(f"  计费类型分布: {dict(Counter(m['billing_type'] for m in data))}")

    # 价格锚点校验
    def find(name):
        return next((x for x in data if x["model_name"] == name), None)

    m = find("claude-opus-5")
    if m:
        base_in = m["model_ratio"] * 2
        g = out_obj["group_ratio"].get("AWS-Bedrock-1")
        print(f"  [校验] claude-opus-5 基础输入=${base_in:.3f}/1M" + (f"，AWS-Bedrock-1 分组≈${base_in*g*1.4:.3f}/1M" if g else ""))
    m = find("gpt-5.6-sol")
    if m and m.get("step_ratios"):
        steps = m["step_ratios"]
        print(f"  [校验] gpt-5.6-sol 阶梯 S1=${m['model_ratio']*2*steps[0]['prompt_step_ratio']:.3f}, S2=${m['model_ratio']*2*steps[1]['prompt_step_ratio']:.3f}")


if __name__ == "__main__":
    main()
