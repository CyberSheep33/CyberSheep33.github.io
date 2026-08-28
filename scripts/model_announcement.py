#!/usr/bin/env python3
"""Generate a visual HTML announcement from an archived model snapshot diff."""

import argparse
import collections
import html
import json
import os
import subprocess
import sys

from model_pipeline import REPO_ROOT, atomic_write, load_json


HISTORY_ROOT = os.path.join(REPO_ROOT, "data", "model-snapshots")
ANNOUNCEMENTS_PATH = os.path.join(REPO_ROOT, "data", "announcements.json")
PRICE_FIELDS = {
    "model_ratio": "输入倍率",
    "completion_ratio": "输出倍率",
    "cache_ratio": "缓存倍率",
    "cache_creation_5m_ratio": "5 分钟缓存写入倍率",
    "cache_creation_1h_ratio": "1 小时缓存写入倍率",
    "quota_type": "计费单位",
    "model_price": "固定价格",
    "billing_type": "计费类型",
    "step_ratios": "阶梯计费",
    "image_ratio": "图像倍率",
    "audio_ratio": "音频输入倍率",
    "audio_completion_ratio": "音频输出倍率",
}


def esc(value):
    return html.escape(str(value if value is not None else ""), quote=True)


def slug_for(version):
    return f"models-update-{version}"


def short_description(value, limit=180):
    text = " ".join(str(value or "暂无描述").split())
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def format_value(value):
    if value is None:
        return "未设置"
    if isinstance(value, bool):
        return "可用" if value else "不可用"
    if isinstance(value, (dict, list)):
        text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        return text if len(text) <= 90 else text[:87] + "…"
    return str(value)


def summarize_changes(changes):
    price_rows = []
    group_rows = []
    endpoint_rows = []
    status_rows = []
    gains = collections.Counter()
    losses = collections.Counter()

    for item in changes.get("models_changed", []):
        model = item.get("model", "未知模型")
        fields = item.get("fields", {})
        for field, values in fields.items():
            if field in PRICE_FIELDS:
                price_rows.append({
                    "model": model,
                    "field": PRICE_FIELDS[field],
                    "before": format_value(values.get("before")),
                    "after": format_value(values.get("after")),
                })
            elif field == "enable_groups":
                before = set(values.get("before") or [])
                after = set(values.get("after") or [])
                added = sorted(after - before)
                removed = sorted(before - after)
                gains.update(added)
                losses.update(removed)
                group_rows.append({"model": model, "added": added, "removed": removed})
            elif field == "supported_endpoint_types":
                before = set(values.get("before") or [])
                after = set(values.get("after") or [])
                endpoint_rows.append({
                    "model": model,
                    "added": sorted(after - before),
                    "removed": sorted(before - after),
                })
            else:
                status_rows.append({
                    "model": model,
                    "field": field,
                    "before": format_value(values.get("before")),
                    "after": format_value(values.get("after")),
                })

    return {
        "price_rows": price_rows,
        "group_rows": group_rows,
        "endpoint_rows": endpoint_rows,
        "status_rows": status_rows,
        "gains": gains,
        "losses": losses,
    }


def title_for(version, changes):
    added = changes.get("models_added", [])
    removed = changes.get("models_removed", [])
    if added:
        if len(added) == 1:
            subject = added[0]
        elif len(added) == 2:
            subject = "、".join(added)
        else:
            subject = f"{added[0]} 等 {len(added)} 个模型"
        return f"模型广场更新：新增 {subject}"
    if removed:
        return f"模型广场更新：下架 {len(removed)} 个旧模型"
    return f"模型广场数据更新：{version}"


def excerpt_for(metadata, changes):
    return (
        f"本期收录 {metadata['stats']['models']} 个模型，新增 {len(changes.get('models_added', []))} 个、"
        f"下架 {len(changes.get('models_removed', []))} 个，"
        f"{len(changes.get('models_changed', []))} 个模型的配置字段发生变化。"
    )


def model_cards(snapshot, names):
    models = {item.get("model_name"): item for item in snapshot.get("data", [])}
    cards = []
    for name in names:
        model = models.get(name, {})
        tags = [part.strip() for part in str(model.get("tags", "")).split(",") if part.strip()]
        tag_html = "".join(f"<span>{esc(tag)}</span>" for tag in tags[:4])
        cards.append(
            '<article class="mu-model-card">'
            f'<div class="mu-model-top"><code>{esc(name)}</code><span>{esc(model.get("model_type") or "模型")}</span></div>'
            f'<p>{esc(short_description(model.get("description")))}</p>'
            f'<div class="mu-model-meta"><span>{len(model.get("enable_groups", []))} 个可用分组</span>'
            f'<span>{esc(model.get("billing_type") or "基础计费")}</span></div>'
            f'<div class="mu-tags">{tag_html or "<span>待分类</span>"}</div>'
            '</article>'
        )
    return "".join(cards)


def change_table(rows, include_field=False):
    if not rows:
        return ""
    head = "<th>模型</th>" + ("<th>字段</th>" if include_field else "") + "<th>此前</th><th>现在</th>"
    body = []
    for row in rows:
        body.append(
            "<tr>"
            f'<td><code>{esc(row["model"])}</code></td>'
            + (f'<td>{esc(row["field"])}</td>' if include_field else "")
            + f'<td>{esc(row["before"])}</td><td>{esc(row["after"])}</td>'
            "</tr>"
        )
    return f'<div class="mu-table-wrap"><table><thead><tr>{head}</tr></thead><tbody>{"".join(body)}</tbody></table></div>'


def group_bars(counter, label):
    if not counter:
        return f'<div class="mu-empty"><strong>{esc(label)}：无</strong><span>本期没有对应变化。</span></div>'
    top = counter.most_common(8)
    maximum = max(value for _, value in top)
    items = "".join(
        '<li>'
        f'<div><code>{esc(name)}</code><b>{value} 个模型</b></div>'
        f'<meter min="0" max="{maximum}" value="{value}">{value}</meter>'
        '</li>'
        for name, value in top
    )
    return f'<div class="mu-bars"><h3>{esc(label)}</h3><ol>{items}</ol></div>'


def group_detail(rows):
    body = []
    for row in rows:
        added = ", ".join(row["added"]) or "—"
        removed = ", ".join(row["removed"]) or "—"
        body.append(
            f'<tr><td><code>{esc(row["model"])}</code></td><td>{esc(added)}</td><td>{esc(removed)}</td></tr>'
        )
    return (
        '<details class="mu-details">'
        f'<summary>查看全部 {len(rows)} 个模型的分组变化</summary>'
        '<div class="mu-table-wrap"><table><thead><tr><th>模型</th><th>新增分组</th><th>移除分组</th></tr></thead>'
        f'<tbody>{"".join(body)}</tbody></table></div></details>'
    ) if rows else ""


def render_page(version, metadata, changes, snapshot):
    slug = slug_for(version)
    root = f".announcement-content--{slug}"
    title = title_for(version, changes)
    excerpt = excerpt_for(metadata, changes)
    summary = summarize_changes(changes)
    added = changes.get("models_added", [])
    removed = changes.get("models_removed", [])
    group_ratio_rows = changes.get("group_ratio_changed", [])
    all_price_rows = summary["price_rows"] + [
        {
            "model": f"分组：{item.get('group')}",
            "field": "分组倍率",
            "before": format_value(item.get("before")),
            "after": format_value(item.get("after")),
        }
        for item in group_ratio_rows
    ]
    previous = metadata.get("previous_version") or "基线"
    removed_html = "".join(f"<li><code>{esc(name)}</code></li>" for name in removed)
    endpoint_table = change_table([
        {
            "model": row["model"],
            "before": ", ".join(row["removed"]) or "—",
            "after": ", ".join(row["added"]) or "—",
        }
        for row in summary["endpoint_rows"]
    ])

    css = """
__ROOT__ { --mu-surface: var(--panel-strong); --mu-soft: var(--tag-bg); color: var(--fg); }
__ROOT__ .mu-hero { position: relative; overflow: hidden; padding: clamp(24px, 4vw, 40px); border: 1px solid var(--border-strong); border-radius: 24px; background: radial-gradient(circle at 88% 18%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 38%), radial-gradient(circle at 8% 92%, color-mix(in srgb, var(--primary-3) 12%, transparent), transparent 40%), var(--mu-surface); box-shadow: var(--shadow); }
__ROOT__ .mu-eyebrow { position: relative; z-index: 1; display: inline-flex; align-items: center; padding: 7px 11px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--mu-soft); color: var(--primary); font-size: .75rem; font-weight: 850; }
__ROOT__ h1 { position: relative; z-index: 1; max-width: 680px; margin: 16px 0 10px; color: var(--fg); font-size: clamp(1.8rem, 4.6vw, 2.9rem); line-height: 1.14; letter-spacing: -.035em; text-wrap: balance; }
__ROOT__ .mu-lead { position: relative; z-index: 1; max-width: 64ch; margin: 0; color: var(--muted); font-size: .96rem; line-height: 1.8; text-wrap: pretty; }
__ROOT__ .mu-version { position: relative; z-index: 1; display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
__ROOT__ .mu-version span { padding: 6px 9px; border: 1px solid var(--border); border-radius: 8px; background: color-mix(in srgb, var(--panel) 82%, transparent); color: var(--muted); font-family: var(--font-mono); font-size: .7rem; }
__ROOT__ .mu-version span[aria-hidden] { padding-inline: 2px; border: 0; background: transparent; color: var(--primary); font-weight: 900; }
__ROOT__ .mu-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 16px 0 0; }
__ROOT__ .mu-stat { min-width: 0; padding: 16px; border: 1px solid var(--border); border-radius: 15px; background: var(--mu-surface); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08); transition: border-color 180ms ease, transform 180ms ease; }
__ROOT__ .mu-stat:first-child { background: var(--mu-soft); }
__ROOT__ .mu-stat:hover { border-color: var(--border-strong); transform: translateY(-1px); }
__ROOT__ .mu-stat span { display: block; color: var(--soft); font-size: .7rem; font-weight: 750; }
__ROOT__ .mu-stat strong { display: block; margin-top: 8px; color: var(--primary); font-family: var(--font-mono); font-size: clamp(1.45rem, 3vw, 1.95rem); line-height: 1.1; font-variant-numeric: tabular-nums; }
__ROOT__ .mu-stat small { display: block; margin-top: 7px; color: var(--muted); font-size: .68rem; line-height: 1.5; }
__ROOT__ .mu-section { margin-top: 26px; padding-top: 24px; border-top: 1px solid var(--divider); }
__ROOT__ .mu-section-head { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 11px; align-items: start; margin-bottom: 14px; }
__ROOT__ .mu-section-head > span { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid var(--border); border-radius: 10px; background: color-mix(in srgb, var(--primary) 11%, var(--mu-surface)); color: var(--primary); font-family: var(--font-mono); font-size: .68rem; font-weight: 900; }
__ROOT__ .mu-section-head h2 { margin: 1px 0 0; color: var(--fg); font-size: 1.25rem; line-height: 1.35; }
__ROOT__ .mu-section-head p { max-width: 62ch; margin: 4px 0 0; color: var(--muted); font-size: .84rem; line-height: 1.7; }
__ROOT__ .mu-model-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
__ROOT__ .mu-model-card { display: flex; flex-direction: column; min-width: 0; padding: 18px; border: 1px solid var(--border); border-radius: 16px; background: var(--mu-surface); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08); }
__ROOT__ .mu-model-top, __ROOT__ .mu-model-meta { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
__ROOT__ .mu-model-top code { overflow-wrap: anywhere; color: var(--fg); font-size: .85rem; font-weight: 850; }
__ROOT__ .mu-model-top > span { flex: 0 0 auto; color: var(--primary); font-size: .7rem; font-weight: 800; }
__ROOT__ .mu-model-card p { margin: 13px 0 16px; color: var(--muted); font-size: .84rem; line-height: 1.7; }
__ROOT__ .mu-model-meta { margin-top: auto; color: var(--soft); font-size: .7rem; }
__ROOT__ .mu-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
__ROOT__ .mu-tags span { padding: 4px 7px; border-radius: 7px; background: var(--mu-soft); color: var(--muted); font-size: .66rem; }
__ROOT__ .mu-status { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 12px; align-items: center; padding: 15px; border: 1px solid var(--border); border-radius: 13px; background: var(--mu-soft); }
__ROOT__ .mu-status > span { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 11px; background: color-mix(in srgb, var(--primary) 13%, var(--mu-surface)); color: var(--primary); font-size: 1rem; font-weight: 900; }
__ROOT__ .mu-status strong { display: block; color: var(--fg); font-size: .9rem; }
__ROOT__ .mu-status p { margin: 3px 0 0; color: var(--muted); font-size: .82rem; line-height: 1.65; }
__ROOT__ .mu-group-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
__ROOT__ .mu-bars { padding: 16px; border: 1px solid var(--border); border-radius: 15px; background: var(--mu-surface); }
__ROOT__ .mu-bars h3 { margin: 0 0 13px; color: var(--fg); font-size: .9rem; }
__ROOT__ .mu-bars ol { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
__ROOT__ .mu-bars li > div { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
__ROOT__ .mu-bars code { overflow-wrap: anywhere; color: var(--fg); font-size: .69rem; }
__ROOT__ .mu-bars b { flex: 0 0 auto; color: var(--soft); font-size: .66rem; }
__ROOT__ meter { display: block; width: 100%; height: 7px; border: 0; background: var(--mu-soft); }
__ROOT__ meter::-webkit-meter-bar { border: 0; border-radius: 7px; background: var(--mu-soft); }
__ROOT__ meter::-webkit-meter-optimum-value { border-radius: 7px; background: var(--primary); }
__ROOT__ meter::-moz-meter-bar { border-radius: 7px; background: var(--primary); }
__ROOT__ .mu-details { margin-top: 12px; border: 1px solid var(--border); border-radius: 13px; background: var(--mu-surface); }
__ROOT__ .mu-details summary { padding: 13px 15px; color: var(--fg); font-size: .84rem; font-weight: 800; cursor: pointer; }
__ROOT__ .mu-details summary:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
__ROOT__ .mu-table-wrap { overflow-x: auto; border-top: 1px solid var(--divider); }
__ROOT__ table { width: 100%; min-width: 620px; border-collapse: collapse; font-size: .76rem; }
__ROOT__ th, __ROOT__ td { padding: 11px 12px; border-bottom: 1px solid var(--divider); text-align: left; vertical-align: top; }
__ROOT__ th { color: var(--soft); font-size: .66rem; letter-spacing: .04em; }
__ROOT__ td { color: var(--muted); }
__ROOT__ td code { color: var(--fg); overflow-wrap: anywhere; }
__ROOT__ .mu-removed { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 0; padding: 0; list-style: none; }
__ROOT__ .mu-removed li { min-width: 0; padding: 10px 12px; border-left: 2px solid var(--border-strong); background: var(--mu-soft); }
__ROOT__ .mu-removed code { color: var(--muted); font-size: .73rem; overflow-wrap: anywhere; }
__ROOT__ .mu-closing { padding: 18px; border: 1px solid var(--border); border-radius: 16px; background: var(--mu-soft); }
__ROOT__ .mu-closing strong { display: block; color: var(--fg); font-size: 1rem; }
__ROOT__ .mu-closing p { margin: 6px 0 0; color: var(--muted); font-size: .84rem; line-height: 1.7; }
__ROOT__ .mu-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
__ROOT__ .mu-empty { padding: 15px; border: 1px dashed var(--border); border-radius: 13px; background: var(--mu-soft); }
__ROOT__ .mu-empty strong, __ROOT__ .mu-empty span { display: block; }
__ROOT__ .mu-empty span { margin-top: 4px; color: var(--muted); font-size: .8rem; }
@media (max-width: 640px) { __ROOT__ .mu-model-grid, __ROOT__ .mu-group-grid { grid-template-columns: 1fr; } }
@media (max-width: 520px) { __ROOT__ .mu-hero { padding: 24px 18px; border-radius: 19px; } __ROOT__ h1 { font-size: 1.9rem; } __ROOT__ .mu-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } __ROOT__ .mu-stat { padding: 14px; } __ROOT__ .mu-removed { grid-template-columns: 1fr; } }
""".replace("__ROOT__", root).strip()

    price_content = change_table(all_price_rows, include_field=True) if all_price_rows else (
        '<div class="mu-status"><span aria-hidden="true">✓</span><div><strong>本期未检测到价格或倍率变化</strong>'
        '<p>已有模型的价格字段与分组倍率保持不变；新增模型按最新数据展示。</p></div></div>'
    )
    group_content = (
        '<div class="mu-group-grid">'
        + group_bars(summary["gains"], "覆盖增加最多的分组")
        + group_bars(summary["losses"], "覆盖减少最多的分组")
        + '</div>'
        + group_detail(summary["group_rows"])
    ) if summary["group_rows"] else '<div class="mu-empty"><strong>本期无模型分组变化</strong><span>可用分组保持不变。</span></div>'

    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{esc(excerpt)}">
  <meta name="author" content="CyberSheep">
  <meta name="theme-color" content="#f7fbfa">
  <title>{esc(title)} — CyberSheep 赛博小羊公告</title>
  <link rel="stylesheet" href="../css/style.css">
  <style>\n{css}\n  </style>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🐑</text></svg>">
</head>
<body>
  <header class="site-header" id="siteHeader"></header>
  <main>
    <div class="section announce-page">
      <div class="section-card announce-body">
        <a class="announce-back" href="index.html">← 返回全部公告</a>
        <article class="announcement-content announcement-content--{esc(slug)}">
        <header class="mu-hero">
          <span class="mu-eyebrow">模型广场数据周报 · {esc(version)}</span>
          <h1>{esc(title)}</h1>
          <p class="mu-lead">{esc(excerpt)}</p>
          <div class="mu-version"><span>{esc(previous)}</span><span aria-hidden="true">→</span><span>{esc(version)}</span></div>
        </header>

        <section class="mu-stats" aria-label="本期数据概览">
          <div class="mu-stat"><span>当前模型</span><strong>{metadata['stats']['models']}</strong><small>{metadata['stats']['vendors']} 个厂商 · {metadata['stats']['groups']} 个分组</small></div>
          <div class="mu-stat"><span>新增</span><strong>+{len(added)}</strong><small>首次进入模型广场</small></div>
          <div class="mu-stat"><span>下架</span><strong>-{len(removed)}</strong><small>不再出现在当前列表</small></div>
          <div class="mu-stat"><span>配置变化</span><strong>{len(changes.get('models_changed', []))}</strong><small>价格、分组或端点字段</small></div>
        </section>

        <section class="mu-section" aria-labelledby="mu-added-title">
          <header class="mu-section-head"><span>01</span><div><h2 id="mu-added-title">新增模型</h2><p>新模型已进入模型广场，可进一步查看可用分组与调用端点。</p></div></header>
          {f'<div class="mu-model-grid">{model_cards(snapshot, added)}</div>' if added else '<div class="mu-empty"><strong>本期无新增模型</strong><span>模型目录保持稳定。</span></div>'}
        </section>

        <section class="mu-section" aria-labelledby="mu-price-title">
          <header class="mu-section-head"><span>02</span><div><h2 id="mu-price-title">价格与倍率</h2><p>单独核对输入、输出、缓存、阶梯计费和分组倍率，便于判断使用成本是否变化。</p></div></header>
          {price_content}
        </section>

        <section class="mu-section" aria-labelledby="mu-group-title">
          <header class="mu-section-head"><span>03</span><div><h2 id="mu-group-title">可用分组变化</h2><p>图表展示影响模型数量最多的分组；完整明细保留在折叠表格中。</p></div></header>
          {group_content}
        </section>

        <section class="mu-section" aria-labelledby="mu-endpoint-title">
          <header class="mu-section-head"><span>04</span><div><h2 id="mu-endpoint-title">调用端点变化</h2><p>端点类型决定模型能够通过哪些兼容协议调用。</p></div></header>
          {endpoint_table or '<div class="mu-status"><span aria-hidden="true">✓</span><div><strong>本期无端点变化</strong><p>已有模型的兼容调用方式保持不变。</p></div></div>'}
        </section>

        <section class="mu-section" aria-labelledby="mu-removed-title">
          <header class="mu-section-head"><span>05</span><div><h2 id="mu-removed-title">下架模型</h2><p>这些模型不再出现在当前目录。已有配置如引用它们，应在使用前确认替代模型。</p></div></header>
          {f'<ul class="mu-removed">{removed_html}</ul>' if removed else '<div class="mu-empty"><strong>本期无下架模型</strong><span>现有模型均继续保留。</span></div>'}
        </section>

        <section class="mu-section" aria-labelledby="mu-next-title">
          <header class="mu-section-head"><span>06</span><div><h2 id="mu-next-title">查看最新模型</h2><p>模型广场已经同步本期数据，可以按厂商、类型和调用端点继续筛选。</p></div></header>
          <div class="mu-closing">
            <strong>使用前请以平台实时状态为准</strong>
            <p>公告用于说明目录变化；模型可用性和实际扣费可能随平台策略调整。</p>
            <div class="mu-actions"><a class="btn btn-primary" href="../models/index.html">进入模型广场 →</a></div>
          </div>
        </section>

        <nav class="announce-nav" id="announceNav" aria-label="公告导航"></nav>
        </article>
      </div>
    </div>
  </main>
  <footer class="site-footer" id="siteFooter"></footer>
  <script src="../assets/site-data.js"></script>
  <script src="../js/site.js"></script>
  <script src="../js/main.js"></script>
  <script src="../js/announcements.js"></script>
</body>
</html>
'''


def update_index(version, metadata, changes):
    document = load_json(ANNOUNCEMENTS_PATH)
    items = document.setdefault("items", [])
    slug = slug_for(version)
    entry = {
        "date": version,
        "title": title_for(version, changes),
        "excerpt": excerpt_for(metadata, changes),
        "slug": slug,
        "type": "update",
        "category": "模型更新",
        "keywords": ["模型广场", "模型更新", "上架", "下架", "价格", "分组"] + changes.get("models_added", []),
        "featured": True,
        "related_guides": [],
        "related_models": changes.get("models_added", []),
        "generated_from": f"data/model-snapshots/{version}/changes.json",
    }
    items[:] = [item for item in items if item.get("slug") != slug]
    items.append(entry)
    items.sort(key=lambda item: (item.get("date", ""), item.get("slug", "")), reverse=True)
    atomic_write(ANNOUNCEMENTS_PATH, json.dumps(document, ensure_ascii=False, indent=2) + "\n")


def publish(version, metadata, changes, snapshot, rebuild_site_data=True):
    slug = slug_for(version)
    output = os.path.join(REPO_ROOT, "announcements", slug + ".html")
    atomic_write(output, render_page(version, metadata, changes, snapshot))
    update_index(version, metadata, changes)
    if rebuild_site_data:
        subprocess.run(
            [sys.executable, os.path.join(REPO_ROOT, "scripts", "build-site-data.py")],
            cwd=REPO_ROOT,
            check=True,
        )
    return output


def load_version(version):
    folder = os.path.join(HISTORY_ROOT, version)
    return (
        load_json(os.path.join(folder, "metadata.json")),
        load_json(os.path.join(folder, "changes.json")),
        load_json(os.path.join(folder, "cleaned.json")),
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", required=True, help="已归档的模型版本 YYYY-MM-DD")
    args = parser.parse_args()
    try:
        metadata, changes, snapshot = load_version(args.version)
        output = publish(args.version, metadata, changes, snapshot)
    except (OSError, ValueError, json.JSONDecodeError, subprocess.CalledProcessError) as exc:
        sys.exit(f"[错误] {exc}")
    print(f"已生成模型更新公告 {output}")


if __name__ == "__main__":
    main()
