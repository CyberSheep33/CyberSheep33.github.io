"""Shared model snapshot cleaning, validation and rendering functions."""

import collections
import datetime
import hashlib
import json
import os


REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

KEEP = [
    "model_name", "description", "tags", "model_type",
    "model_ratio", "completion_ratio", "cache_ratio",
    "cache_creation_5m_ratio", "cache_creation_1h_ratio",
    "enable_groups", "supported_endpoint_types", "quota_type",
    "model_price", "usage_count", "available", "icon", "type", "vendor_id",
    "step_ratios", "image_ratio", "audio_ratio", "audio_completion_ratio",
]


def load_json(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def load_rules():
    available = load_json(os.path.join(REPO_ROOT, "data", "available-groups.json"))
    brands = load_json(os.path.join(REPO_ROOT, "data", "brand-overrides.json"))
    return available.get("groups", {}), brands.get("overrides", {})


def detect_billing(model):
    if model.get("image_ratio"):
        return "image"
    if model.get("audio_ratio"):
        return "audio"
    if model.get("step_ratios"):
        return "step"
    if model.get("cache_creation_5m_ratio") or model.get("cache_creation_1h_ratio"):
        return "cache"
    return "basic"


def build_snapshot(raw, fetched_at=None):
    valid_groups, overrides = load_rules()
    valid_set = set(valid_groups)
    models = []

    for model in raw.get("data", []):
        cleaned = {key: model[key] for key in KEEP if key in model}
        if "enable_groups" in cleaned:
            cleaned["enable_groups"] = sorted({group for group in cleaned["enable_groups"] if group in valid_set})
        if "supported_endpoint_types" in cleaned:
            cleaned["supported_endpoint_types"] = sorted(set(cleaned["supported_endpoint_types"]))
        if cleaned.get("model_name") in overrides:
            cleaned["vendor_id"] = overrides[cleaned["model_name"]]
        cleaned["billing_type"] = detect_billing(cleaned)
        zh = model.get("translations", {}).get("zh", {}).get("description")
        if zh:
            cleaned["description"] = zh
        models.append(cleaned)

    return {
        "data": models,
        "group_ratio": {group: value for group, value in raw.get("group_ratio", {}).items() if group in valid_set},
        "usable_group": {group: value for group, value in raw.get("usable_group", {}).items() if group in valid_set},
        "vendors": raw.get("vendors", []),
        "supported_endpoint": raw.get("supported_endpoint", {}),
        "available_groups": valid_groups,
        "brand_overrides": overrides,
        "fetched_at": fetched_at or datetime.date.today().isoformat(),
    }


def render_js(snapshot):
    prefix = "/* CyberSheep 模型广场数据快照（由 scripts/update-models.py 生成） */\n"
    return prefix + "window.MODELS_DATA = " + json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")) + ";\n"


def atomic_write(path, content, binary=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    temporary = path + ".tmp"
    mode = "wb" if binary else "w"
    kwargs = {} if binary else {"encoding": "utf-8"}
    with open(temporary, mode, **kwargs) as handle:
        handle.write(content)
    os.replace(temporary, path)


def write_current_asset(snapshot):
    output = os.path.join(REPO_ROOT, "assets", "models-data.js")
    atomic_write(output, render_js(snapshot))
    return output


def load_current_asset():
    path = os.path.join(REPO_ROOT, "assets", "models-data.js")
    with open(path, encoding="utf-8") as handle:
        text = handle.read()
    marker = "window.MODELS_DATA = "
    start = text.find(marker)
    if start < 0:
        raise ValueError("assets/models-data.js 中未找到 MODELS_DATA")
    payload = text[start + len(marker):].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    return json.loads(payload)


def snapshot_stats(snapshot):
    return {
        "models": len(snapshot.get("data", [])),
        "groups": len(snapshot.get("group_ratio", {})),
        "vendors": len(snapshot.get("vendors", [])),
        "endpoints": len(snapshot.get("supported_endpoint", {})),
        "billing_types": dict(collections.Counter(model.get("billing_type", "unknown") for model in snapshot.get("data", []))),
    }


def sha256_bytes(content):
    return hashlib.sha256(content).hexdigest()


def anchor_checks(snapshot):
    models = {model.get("model_name"): model for model in snapshot.get("data", [])}
    checks = []
    opus = models.get("claude-opus-5")
    if opus:
        base_input = opus.get("model_ratio", 0) * 2
        group = snapshot.get("group_ratio", {}).get("AWS-Bedrock-1")
        checks.append({
            "name": "claude-opus-5",
            "base_input": round(base_input, 6),
            "aws_bedrock_1_input": round(base_input * group * 1.4, 6) if group is not None else None,
        })
    sol = models.get("gpt-5.6-sol")
    if sol and sol.get("step_ratios"):
        steps = sol["step_ratios"]
        checks.append({
            "name": "gpt-5.6-sol",
            "stage_1_input": round(sol.get("model_ratio", 0) * 2 * steps[0].get("prompt_step_ratio", 1), 6),
            "stage_2_input": round(sol.get("model_ratio", 0) * 2 * steps[1].get("prompt_step_ratio", 1), 6) if len(steps) > 1 else None,
        })
    return checks


def print_summary(snapshot):
    stats = snapshot_stats(snapshot)
    print(
        f"模型数: {stats['models']} | 有效分组: {stats['groups']} | "
        f"厂商: {stats['vendors']} | 端点: {stats['endpoints']}"
    )
    print(f"计费类型: {stats['billing_types']}")
    for check in anchor_checks(snapshot):
        print(f"价格锚点: {check}")
