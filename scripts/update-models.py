#!/usr/bin/env python3
"""Archive, clean, diff and publish a weekly Sheep AI Plus pricing snapshot."""

import argparse
import datetime
import gzip
import json
import os
import sys

from model_pipeline import (
    REPO_ROOT,
    anchor_checks,
    atomic_write,
    build_snapshot,
    load_current_asset,
    load_json,
    print_summary,
    sha256_bytes,
    snapshot_stats,
    write_current_asset,
)


HISTORY_ROOT = os.path.join(REPO_ROOT, "data", "model-snapshots")
MANIFEST_PATH = os.path.join(HISTORY_ROOT, "manifest.json")


def load_manifest():
    if not os.path.exists(MANIFEST_PATH):
        return {"schema_version": 1, "latest": None, "versions": []}
    return load_json(MANIFEST_PATH)


def load_previous(manifest):
    latest = manifest.get("latest")
    if not latest:
        return None
    path = os.path.join(HISTORY_ROOT, latest, "cleaned.json")
    return load_json(path) if os.path.exists(path) else None


def compare_snapshots(previous, current):
    if not previous:
        return {
            "baseline": True,
            "models_added": sorted(model.get("model_name") for model in current.get("data", []) if model.get("model_name")),
            "models_removed": [],
            "models_changed": [],
            "group_ratio_changed": [],
        }

    before = {model.get("model_name"): model for model in previous.get("data", []) if model.get("model_name")}
    after = {model.get("model_name"): model for model in current.get("data", []) if model.get("model_name")}
    tracked = [
        "model_ratio", "completion_ratio", "cache_ratio", "cache_creation_5m_ratio",
        "cache_creation_1h_ratio", "quota_type", "model_price", "billing_type",
        "enable_groups", "supported_endpoint_types", "available",
    ]
    changed = []
    for name in sorted(before.keys() & after.keys()):
        fields = {}
        for field in tracked:
            if before[name].get(field) != after[name].get(field):
                fields[field] = {"before": before[name].get(field), "after": after[name].get(field)}
        if fields:
            changed.append({"model": name, "fields": fields})

    old_groups = previous.get("group_ratio", {})
    new_groups = current.get("group_ratio", {})
    group_changes = []
    for group in sorted(set(old_groups) | set(new_groups)):
        if old_groups.get(group) != new_groups.get(group):
            group_changes.append({"group": group, "before": old_groups.get(group), "after": new_groups.get(group)})

    return {
        "baseline": False,
        "models_added": sorted(after.keys() - before.keys()),
        "models_removed": sorted(before.keys() - after.keys()),
        "models_changed": changed,
        "group_ratio_changed": group_changes,
    }


def render_report(version, previous_version, stats, changes):
    lines = [
        f"# 模型数据版本 {version}",
        "",
        f"- 上一版本：{previous_version or '无（基线版本）'}",
        f"- 模型数：{stats['models']}",
        f"- 有效分组：{stats['groups']}",
        f"- 厂商数：{stats['vendors']}",
        f"- 新增模型：{len(changes['models_added'])}",
        f"- 移除模型：{len(changes['models_removed'])}",
        f"- 字段变化模型：{len(changes['models_changed'])}",
        f"- 分组倍率变化：{len(changes['group_ratio_changed'])}",
        "",
    ]
    if changes["models_added"]:
        lines.extend(["## 新增模型", "", ", ".join(changes["models_added"]), ""])
    if changes["models_removed"]:
        lines.extend(["## 移除模型", "", ", ".join(changes["models_removed"]), ""])
    lines.extend([
        "## 详细差异",
        "",
        "完整字段变化见同目录下的 `changes.json`。",
        "",
        "价格为模型广场估算值，最终以 Sheep AI Plus 实际扣费为准。",
        "",
    ])
    return "\n".join(lines)


def write_json(path, value, compact=False):
    content = json.dumps(value, ensure_ascii=False, separators=(",", ":") if compact else None, indent=None if compact else 2) + "\n"
    atomic_write(path, content)


def archive(version, snapshot, raw_bytes, source_name, raw_available):
    manifest = load_manifest()
    if version in {item.get("version") for item in manifest.get("versions", [])}:
        raise ValueError(f"版本 {version} 已存在，历史版本禁止覆盖")
    folder = os.path.join(HISTORY_ROOT, version)
    if os.path.exists(folder):
        raise ValueError(f"目录已经存在: {folder}")

    previous_version = manifest.get("latest")
    previous = load_previous(manifest)
    changes = compare_snapshots(previous, snapshot)
    stats = snapshot_stats(snapshot)
    metadata = {
        "schema_version": 1,
        "version": version,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source_name": source_name,
        "raw_available": raw_available,
        "raw_sha256": sha256_bytes(raw_bytes) if raw_available else None,
        "previous_version": previous_version,
        "stats": stats,
        "anchor_checks": anchor_checks(snapshot),
    }

    os.makedirs(folder, exist_ok=False)
    if raw_available:
        atomic_write(os.path.join(folder, "raw.json.gz"), gzip.compress(raw_bytes, compresslevel=9), binary=True)
    write_json(os.path.join(folder, "cleaned.json"), snapshot, compact=True)
    write_json(os.path.join(folder, "metadata.json"), metadata)
    write_json(os.path.join(folder, "changes.json"), changes)
    atomic_write(os.path.join(folder, "report.md"), render_report(version, previous_version, stats, changes))

    manifest.setdefault("versions", []).append({
        "version": version,
        "previous_version": previous_version,
        "models": stats["models"],
        "groups": stats["groups"],
        "raw_available": raw_available,
    })
    manifest["latest"] = version
    write_json(MANIFEST_PATH, manifest)
    write_current_asset(snapshot)
    return metadata, changes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", nargs="?", help="从 Sheep AI Plus 抓取的 pricing.json")
    parser.add_argument("--date", help="版本日期 YYYY-MM-DD，默认今天")
    parser.add_argument("--bootstrap-current", action="store_true", help="将当前 models-data.js 归档为无原始文件的基线")
    args = parser.parse_args()
    version = args.date or datetime.date.today().isoformat()

    try:
        datetime.date.fromisoformat(version)
        if args.bootstrap_current:
            if args.source:
                raise ValueError("--bootstrap-current 不能同时指定 source")
            snapshot = load_current_asset()
            version = args.date or snapshot.get("fetched_at") or version
            raw_bytes = b""
            source_name = "legacy assets/models-data.js"
            raw_available = False
        else:
            if not args.source:
                raise ValueError("请提供 pricing.json，或使用 --bootstrap-current")
            with open(args.source, "rb") as handle:
                raw_bytes = handle.read()
            raw = json.loads(raw_bytes.decode("utf-8"))
            snapshot = build_snapshot(raw, fetched_at=version)
            source_name = os.path.basename(args.source)
            raw_available = True

        metadata, changes = archive(version, snapshot, raw_bytes, source_name, raw_available)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        sys.exit(f"[错误] {exc}")

    print(f"已归档模型版本 {metadata['version']}")
    print_summary(snapshot)
    print(
        f"变化: +{len(changes['models_added'])} / -{len(changes['models_removed'])} / "
        f"{len(changes['models_changed'])} 个模型字段变化 / {len(changes['group_ratio_changed'])} 个分组倍率变化"
    )


if __name__ == "__main__":
    main()
