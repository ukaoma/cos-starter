#!/usr/bin/env python3
"""Promote the drafted Control 0.5.353 appcast entry to the live stable channel. Run only after notarization.

What it does, in one write per file:
  - control/appcast.json: `nextStable` becomes `channels.stable` with the real url, sha256 and publishedAt. Its
    0.5.353 section goes on top of the sections stable already carries. `nextStable` is removed.
  - control/index.html: the displayed SHA-256 placeholder `__SHA256__` becomes the real value.
It refuses when a value is malformed, when the ZIP's SHA-256 (with --zip) differs from --sha256, or when a
placeholder would remain. Nothing is pushed.

    python3 release-drafts/control-353/promote_appcast.py \
        --sha256 <64 hex> --published-at 2026-10-29T18:00:00Z [--zip path/to/COS-Control-macOS-arm64-0.5.353.zip]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
VERSION = "0.5.353"
DEFAULT_URL = f"https://github.com/ukaoma/cos-starter/releases/download/control-v{VERSION}/COS-Control-macOS-arm64-{VERSION}.zip"
PLACEHOLDERS = ("__URL__", "__SHA256__", "__PUBLISHED_AT__")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--sha256", required=True)
    ap.add_argument("--published-at", required=True, help="ISO UTC, like 2026-10-29T18:00:00Z")
    ap.add_argument("--zip", type=pathlib.Path, help="the notarized ZIP; its SHA-256 must equal --sha256")
    args = ap.parse_args()

    sha = args.sha256.lower()
    if not re.fullmatch(r"[0-9a-f]{64}", sha):
        sys.exit("sha256 must be 64 hex characters")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", args.published_at):
        sys.exit("published-at must look like 2026-10-29T18:00:00Z")
    if not args.url.endswith(f"/control-v{VERSION}/COS-Control-macOS-arm64-{VERSION}.zip"):
        sys.exit(f"url must be the control-v{VERSION} release asset")
    if args.zip:
        got = hashlib.sha256(args.zip.read_bytes()).hexdigest()
        if got != sha:
            sys.exit(f"ZIP SHA-256 is {got}, not {sha}")

    appcast_path = ROOT / "control" / "appcast.json"
    appcast = json.loads(appcast_path.read_text(encoding="utf-8"))
    nxt = appcast.get("nextStable")
    if not nxt or nxt.get("version") != VERSION:
        sys.exit("appcast has no nextStable entry for " + VERSION)
    old = appcast["channels"]["stable"]
    new = dict(nxt)
    new["url"], new["sha256"], new["publishedAt"] = args.url, sha, args.published_at
    sections = [s for s in old.get("whatsNew", {}).get("sections", []) if s.get("title") != VERSION]
    new["whatsNew"] = {"summary": nxt["whatsNew"]["summary"], "sections": nxt["whatsNew"]["sections"] + sections}
    appcast["channels"]["stable"] = new
    del appcast["nextStable"]
    appcast_text = json.dumps(appcast, indent=2, ensure_ascii=False) + "\n"

    control_path = ROOT / "control" / "index.html"
    control = control_path.read_text(encoding="utf-8")
    if control.count("__SHA256__") != 1:
        sys.exit(f"control/index.html should hold __SHA256__ once, holds it {control.count('__SHA256__')} times")
    control = control.replace("__SHA256__", sha)

    for name, text in (("control/appcast.json", appcast_text), ("control/index.html", control)):
        left = [p for p in PLACEHOLDERS if p in text]
        if left:
            sys.exit(f"{name} would still hold {left}")
    appcast_path.write_text(appcast_text, encoding="utf-8")
    control_path.write_text(control, encoding="utf-8")
    print(f"stable: {old['version']} (build {old['build']}) -> {new['version']} (build {new['build']}), "
          f"serverTarget {new['serverTarget']}, {len(new['whatsNew']['sections'])} sections; control/index.html SHA filled")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
