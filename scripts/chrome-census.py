#!/usr/bin/env python3
"""Chrome parity census for gotcos.com pages.

Every content page must carry the homepage chrome: nav strip, nav pill
(with the lockup), the logo line-draw script, and the footer pages-nav.
Conversion/tool pages and approved custom shells are exempt by list.

Run before any deploy that adds or reworks a page:  python3 scripts/chrome-census.py
Exits nonzero if a content page is missing chrome.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# minimal-chrome pages: conversion/tool funnels + approved custom shells + legal
EXEMPT_NAV = {"connect", "readiness", "wizard", "docs", "privacy", "terms", "119", "miles", "queen"}

CHECKS = {
    "strip":    lambda p: "nt-tag" in p,
    "pill":     lambda p: "nav-main" in p and 'viewBox="1004 821 1944 517"' in p,
    "linedraw": lambda p: p.count("each section draws its outline") == 1,
    "footnav":  lambda p: bool(re.search(r'<nav class="foot-nav"', p)),
    "hubspot":  lambda p: 'id="hs-script-loader"' in p,  # required on EVERY page, no exemptions
}

def main() -> int:
    pages = [ROOT / "index.html"] + sorted(ROOT.glob("*/index.html"))
    bad = []
    print(f"{'page':56s} strip pill linedraw footnav hubspot")
    for f in pages:
        p = f.read_text(encoding="utf-8")
        name = f.parent.name if f.parent != ROOT else "(home)"
        r = {k: fn(p) for k, fn in CHECKS.items()}
        exempt = name in EXEMPT_NAV
        need_nav = not exempt
        ok = (r["strip"] and r["pill"] if need_nav else True) and r["linedraw"] and r["footnav"]
        flag = "  OK" if ok else ("  exempt-partial" if exempt else "  MISSING CHROME")
        if not r["hubspot"]:
            flag += "  NO HUBSPOT TAG"
        print(f"{name:56s} {int(r['strip'])}     {int(r['pill'])}    {int(r['linedraw'])}        {int(r['footnav'])}{flag}")
        if (not ok and not exempt) or not r["hubspot"]:
            bad.append(name)
    if bad:
        print(f"\nFAIL: content pages missing homepage chrome: {', '.join(bad)}")
        print("Copy nav + footer + the logo line-draw script from the CURRENT homepage (index.html).")
        return 1
    print("\nAll content pages carry the homepage chrome.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
