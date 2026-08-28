#!/usr/bin/env python3
"""Compatibility wrapper: clean pricing JSON and update the current browser snapshot.

For weekly updates with history and diff reports, use scripts/update-models.py.
"""

import os
import sys

from model_pipeline import REPO_ROOT, build_snapshot, load_json, print_summary, write_current_asset


def main():
    source = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO_ROOT, "pricing.json")
    if not os.path.exists(source):
        sys.exit(f"[错误] 找不到 {source}")
    snapshot = build_snapshot(load_json(source))
    output = write_current_asset(snapshot)
    print(f"已生成 {output}")
    print_summary(snapshot)


if __name__ == "__main__":
    main()
