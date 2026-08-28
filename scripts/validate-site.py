#!/usr/bin/env python3
"""Run deterministic validation for the static CyberSheep site."""

import ast
import json
import os
import re
import subprocess
import sys
from html.parser import HTMLParser
from urllib.parse import urlsplit


REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "__pycache__"}


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.external_blank = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for key in ("href", "src"):
            if values.get(key):
                self.references.append(values[key])
        href = values.get("href", "")
        if tag == "a" and href.startswith(("https://", "http://")) and values.get("target") == "_blank":
            rel = set((values.get("rel") or "").split())
            if "noopener" not in rel:
                self.external_blank.append(href)


def walk_files(suffix):
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [name for name in dirs if name not in SKIP_DIRS]
        for name in files:
            if name.endswith(suffix):
                yield os.path.join(root, name)


def relative(path):
    return os.path.relpath(path, REPO_ROOT)


def validate_json_and_python(errors):
    for path in walk_files(".json"):
        try:
            with open(path, encoding="utf-8") as handle:
                json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"JSON 无效 {relative(path)}: {exc}")
    for path in walk_files(".py"):
        try:
            with open(path, encoding="utf-8") as handle:
                ast.parse(handle.read(), filename=path)
        except (OSError, SyntaxError) as exc:
            errors.append(f"Python 无效 {relative(path)}: {exc}")


def validate_javascript(errors):
    for path in walk_files(".js"):
        result = subprocess.run(["node", "--check", path], capture_output=True, text=True, check=False)
        if result.returncode:
            errors.append(f"JavaScript 无效 {relative(path)}: {result.stderr.strip()}")


def local_target(page, reference):
    parts = urlsplit(reference)
    if parts.scheme or reference.startswith(("#", "mailto:", "data:", "ccswitch:", "javascript:")):
        return None
    target = parts.path
    if not target:
        return None
    if target.startswith("/"):
        return os.path.join(REPO_ROOT, target.lstrip("/"))
    return os.path.normpath(os.path.join(os.path.dirname(page), target))


def validate_html(errors):
    for page in walk_files(".html"):
        with open(page, encoding="utf-8") as handle:
            text = handle.read()
        parser = ReferenceParser()
        parser.feed(text)
        for reference in parser.references:
            target = local_target(page, reference)
            if target and not os.path.exists(target):
                errors.append(f"站内引用不存在 {relative(page)} -> {reference}")
        for href in parser.external_blank:
            errors.append(f"外链缺少 rel=noopener {relative(page)} -> {href}")

        if "js/site.js" in text:
            data_match = re.search(r'<script\s+src=["\'][^"\']*assets/site-data\.js["\']', text)
            site_match = re.search(r'<script\s+src=["\'][^"\']*js/site\.js["\']', text)
            data_pos = data_match.start() if data_match else -1
            site_pos = site_match.start() if site_match else -1
            if data_pos < 0 or data_pos > site_pos:
                errors.append(f"全站数据加载顺序错误: {relative(page)}")

        if "js/announcements.js" in text:
            data_match = re.search(r'<script\s+src=["\'][^"\']*assets/site-data\.js["\']', text)
            script_match = re.search(r'<script\s+src=["\'][^"\']*js/announcements\.js["\']', text)
            data_pos = data_match.start() if data_match else -1
            script_pos = script_match.start() if script_match else -1
            if data_pos < 0 or data_pos > script_pos:
                errors.append(f"公告数据加载顺序错误: {relative(page)}")


def validate_generated_data(errors):
    result = subprocess.run(
        [sys.executable, os.path.join(REPO_ROOT, "scripts", "build-site-data.py"), "--check"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        errors.append(result.stderr.strip() or result.stdout.strip())

    manifest_path = os.path.join(REPO_ROOT, "data", "model-snapshots", "manifest.json")
    if not os.path.exists(manifest_path):
        errors.append("缺少模型历史清单 data/model-snapshots/manifest.json")
        return
    with open(manifest_path, encoding="utf-8") as handle:
        manifest = json.load(handle)
    latest = manifest.get("latest")
    if not latest:
        errors.append("模型历史清单没有 latest")
        return
    cleaned_path = os.path.join(REPO_ROOT, "data", "model-snapshots", latest, "cleaned.json")
    if not os.path.exists(cleaned_path):
        errors.append(f"最新模型历史不存在: {relative(cleaned_path)}")
        return

    sys.path.insert(0, os.path.join(REPO_ROOT, "scripts"))
    from model_pipeline import load_current_asset  # pylint: disable=import-outside-toplevel

    with open(cleaned_path, encoding="utf-8") as handle:
        cleaned = json.load(handle)
    current = load_current_asset()
    if cleaned != current:
        errors.append("assets/models-data.js 与最新历史快照不同步")


def validate_secrets(errors):
    pattern = re.compile(r"\bsk-[A-Za-z0-9_-]{16,}\b")
    for suffix in (".html", ".js", ".json"):
        for path in walk_files(suffix):
            if relative(path).startswith("data/model-snapshots/"):
                continue
            with open(path, encoding="utf-8", errors="replace") as handle:
                if pattern.search(handle.read()):
                    errors.append(f"疑似真实 API Key: {relative(path)}")


def main():
    errors = []
    validate_json_and_python(errors)
    validate_javascript(errors)
    validate_html(errors)
    validate_generated_data(errors)
    validate_secrets(errors)
    if errors:
        print("站点校验失败：", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        sys.exit(1)
    html_count = sum(1 for _ in walk_files(".html"))
    print(f"站点校验通过：{html_count} 个 HTML 页面，数据、脚本、站内链接与模型历史均有效。")


if __name__ == "__main__":
    main()
