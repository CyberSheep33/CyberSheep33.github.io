#!/usr/bin/env python3
"""Validate maintainable source data and build the browser-side data snapshot."""

import argparse
import json
import os
import sys


REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO_ROOT, "data")
OUTPUT = os.path.join(REPO_ROOT, "assets", "site-data.js")


def load(name):
    path = os.path.join(DATA_DIR, name)
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def index_unique(items, label):
    result = {}
    for item in items:
        item_id = item.get("id")
        if not item_id:
            raise ValueError(f"{label} 存在缺少 id 的条目")
        if item_id in result:
            raise ValueError(f"{label} id 重复: {item_id}")
        result[item_id] = item
    return result


def require_web_url(value, label):
    if not isinstance(value, str) or not value.startswith(("https://", "http://")):
        raise ValueError(f"{label} 不是有效 Web URL: {value}")


def build_data():
    site = load("site.json")
    projects = load("projects.json").get("items", [])
    announcements = load("announcements.json").get("items", [])
    tools = load("tutorial-tools.json").get("items", [])
    models = load("tutorial-models.json").get("items", [])
    methods = load("tutorial-methods.json").get("items", [])
    route_doc = load("tutorial-routes.json")
    routes = route_doc.get("items", [])
    support_links = route_doc.get("support_links", [])
    blogs = load("blogs.json")

    project_ids = index_unique(projects, "项目")
    tool_ids = index_unique(tools, "教程工具")
    model_ids = index_unique(models, "教程模型")
    method_ids = index_unique(methods, "配置方式")
    route_ids = index_unique(routes, "教程路线")
    index_unique(support_links, "教程辅助入口")

    if len(project_ids) != len(projects) or len(route_ids) != len(routes):
        raise ValueError("数据索引异常")

    for project in projects:
        if project.get("source") not in {"official", "curated"}:
            raise ValueError(f"项目 source 非法: {project.get('id')}")
        require_web_url(project.get("repo_url"), f"项目 {project.get('id')}")

    announcement_slugs = set()
    for item in announcements:
        slug = item.get("slug")
        if not slug or slug in announcement_slugs:
            raise ValueError(f"公告 slug 缺失或重复: {slug}")
        announcement_slugs.add(slug)
        page = os.path.join(REPO_ROOT, "announcements", slug + ".html")
        if not os.path.exists(page):
            raise ValueError(f"公告详情页不存在: announcements/{slug}.html")

    for route in routes:
        tool = tool_ids.get(route.get("tool"))
        model = model_ids.get(route.get("model"))
        method = method_ids.get(route.get("method"))
        if not tool or not model or not method:
            raise ValueError(f"教程路线引用无效: {route.get('id')}")
        supported = method.get("supported_families", [])
        if supported and tool.get("family") not in supported:
            raise ValueError(
                f"教程路线不兼容: {route.get('id')} -> {method.get('id')} 不支持 {tool.get('family')}"
            )
        if route.get("status") == "published":
            page = os.path.join(REPO_ROOT, route.get("url", ""))
            if not os.path.isfile(page):
                raise ValueError(f"已发布教程页面不存在: {route.get('url')}")

    for link in support_links:
        page = os.path.join(REPO_ROOT, link.get("url", ""))
        if not os.path.isfile(page):
            raise ValueError(f"教程辅助页面不存在: {link.get('url')}")

    for platform in blogs.get("platforms", []):
        require_web_url(platform.get("url"), f"博客平台 {platform.get('id')}")
    for creator in blogs.get("creators", []):
        for link in creator.get("links", []):
            require_web_url(link.get("url"), f"博主 {creator.get('id')}")
    for article in blogs.get("articles", []):
        require_web_url(article.get("url"), f"博文 {article.get('id')}")

    return {
        "site": site,
        "projects": sorted(projects, key=lambda item: item.get("order", 9999)),
        "announcements": announcements,
        "tutorials": {
            "tools": sorted(tools, key=lambda item: item.get("order", 9999)),
            "models": sorted(models, key=lambda item: item.get("order", 9999)),
            "methods": sorted(methods, key=lambda item: item.get("order", 9999)),
            "routes": routes,
            "support_links": support_links,
        },
        "blogs": blogs,
    }


def render(data):
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    return "/* 由 scripts/build-site-data.py 生成，请勿手动编辑。 */\nwindow.CYBERSHEEP_DATA = " + payload + ";\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="只检查生成文件是否同步")
    args = parser.parse_args()

    try:
        result = render(build_data())
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        sys.exit(f"[错误] {exc}")

    if args.check:
        current = ""
        if os.path.exists(OUTPUT):
            with open(OUTPUT, encoding="utf-8") as handle:
                current = handle.read()
        if current != result:
            sys.exit("[错误] assets/site-data.js 与 data/*.json 不同步，请运行 build-site-data.py")
        print("站点数据校验通过，生成文件已同步。")
        return

    with open(OUTPUT, "w", encoding="utf-8") as handle:
        handle.write(result)
    print(f"已生成 {OUTPUT}")


if __name__ == "__main__":
    main()
