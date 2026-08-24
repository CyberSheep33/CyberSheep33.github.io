#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""构建模型广场数据快照

从 Sheep AI Plus 手动抓取的 pricing.json，生成 CyberSheep 模型广场使用的
assets/models-data.js（window.MODELS_DATA = {...}）。

用法：
    python3 scripts/build-models-data.py [pricing.json 路径]

默认读取仓库根目录的 pricing.json（如未提供路径参数）。
输出：assets/models-data.js，并打印校验信息。

字段精简原则：只保留模型广场渲染所需的字段，其余丢弃以控制体积。
"""
import json
import os
import sys

# 模型对象保留字段（含计费相关字段）
KEEP = [
    "model_name", "description", "tags", "model_type",
    "model_ratio", "completion_ratio", "cache_ratio",
    "cache_creation_5m_ratio", "cache_creation_1h_ratio",
    "enable_groups", "supported_endpoint_types", "quota_type",
    "model_price", "usage_count", "available", "icon", "type", "vendor_id",
    "step_ratios", "image_ratio", "audio_ratio", "audio_completion_ratio",
]


def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(repo_root, "pricing.json")
    out = os.path.join(repo_root, "assets", "models-data.js")

    if not os.path.exists(src):
        sys.exit(f"[错误] 找不到 {src}，请先到 https://sheepaiplus.top/api/pricing 抓取并存为 pricing.json")

    with open(src, encoding="utf-8") as f:
        d = json.load(f)

    # 1. 精简模型数据 + 提取中文描述
    data = []
    for m in d.get("data", []):
        o = {k: m[k] for k in KEEP if k in m}
        zh = m.get("translations", {}).get("zh", {}).get("description")
        if zh:
            o["description"] = zh
        data.append(o)

    out_obj = {
        "data": data,
        "group_ratio": d.get("group_ratio", {}),
        "usable_group": d.get("usable_group", {}),
        "vendors": d.get("vendors", []),
        "supported_endpoint": d.get("supported_endpoint", {}),
        "fetched_at": "YYYY-MM-DD",  # TODO: 改成当天日期
    }

    js = "/* CyberSheep 模型广场数据快照（由 scripts/build-models-data.py 生成） */\n"
    js += "window.MODELS_DATA = " + json.dumps(out_obj, ensure_ascii=False) + ";\n"

    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(js)

    # 2. 校验输出
    print(f"已生成 {out}")
    print(f"  模型数: {len(data)} | 分组数: {len(out_obj['group_ratio'])} | 厂商数: {len(out_obj['vendors'])}")
    print(f"  大小: {os.path.getsize(out) / 1024:.1f} KB")

    # 3. 价格公式校验锚点（claude-opus-5 / gpt-5.6-sol）
    def find(name):
        return next((x for x in data if x["model_name"] == name), None)

    m = find("claude-opus-5")
    if m:
        base_in = m["model_ratio"] * 2
        print(f"  [校验] claude-opus-5 基础输入 = {m['model_ratio']}×2 = ${base_in:.3f}/1M")
        g = out_obj["group_ratio"].get("AWS-Bedrock-1")
        if g:
            print(f"  [校验] claude-opus-5 AWS-Bedrock-1 输入 = {base_in:.3f}×{g}×1.4 ≈ ${base_in*g*1.4:.3f}/1M")

    m = find("gpt-5.6-sol")
    if m and m.get("step_ratios"):
        steps = m["step_ratios"]
        s1 = m["model_ratio"] * 2 * (steps[0].get("prompt_step_ratio", 1))
        s2 = m["model_ratio"] * 2 * (steps[1].get("prompt_step_ratio", 1))
        print(f"  [校验] gpt-5.6-sol 阶梯输入 S1=${s1:.3f}/1M, S2=${s2:.3f}/1M (0~{steps[0]['step_size']} / {steps[0]['step_size']}~{steps[1]['step_size']})")

    print("  完成。若 fetched_at 是占位符，请改为当天日期后提交。")


if __name__ == "__main__":
    main()
