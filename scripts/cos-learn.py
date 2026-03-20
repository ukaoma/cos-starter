#!/usr/bin/env python3
"""
COS Learn -- Lightweight Correction Tracker

Tracks corrections with deterministic dedup and occurrence counting.
Promotes recurring patterns to permanent rules.

Usage:
    python cos-learn.py check "rule text"          # Check for duplicates
    python cos-learn.py add "wrong" "right" "rule" # Add new correction
    python cos-learn.py hit <id>                   # Record repeat occurrence
    python cos-learn.py list                       # Show all corrections
    python cos-learn.py promote <id>               # Promote to permanent rule
"""

import argparse
import json
import sys
from datetime import datetime
from difflib import SequenceMatcher
from pathlib import Path

JOURNAL = Path(__file__).parent.parent / ".corrections.json"
RULES_DIR = Path(__file__).parent.parent / ".claude" / "rules"
RULES_FILE = RULES_DIR / "corrections.md"
SIMILARITY = 0.7


def load():
    if not JOURNAL.exists():
        return {"patterns": [], "promoted": []}
    return json.loads(JOURNAL.read_text())


def save(data):
    JOURNAL.write_text(json.dumps(data, indent=2))


def gen_id():
    return f"c_{datetime.now().strftime('%Y%m%d_%H%M%S')}"


def similar(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def find_match(rule, patterns):
    for p in patterns:
        if similar(rule, p["rule"]) > SIMILARITY:
            return p
    return None


def cmd_check(args):
    data = load()
    match = find_match(args.rule, data["patterns"])
    if match:
        print(f"EXISTING: {match['id']} (seen {match['count']}x)")
        print(f"  Rule: {match['rule']}")
    else:
        for p in data.get("promoted", []):
            if similar(args.rule, p["rule"]) > SIMILARITY:
                print("PROMOTED: Already a permanent rule")
                print(f"  Rule: {p['rule']}")
                return
        print("NEW: No matching correction found")


def cmd_add(args):
    data = load()
    match = find_match(args.rule, data["patterns"])
    if match:
        match["count"] += 1
        match["last_seen"] = datetime.now().isoformat()
        save(data)
        print(f"UPDATED: {match['id']} (now seen {match['count']}x)")
        if match["count"] >= 2:
            print(f"  Ready for promotion. Run: python cos-learn.py promote {match['id']}")
        return

    entry = {
        "id": gen_id(),
        "wrong": args.wrong,
        "right": args.right,
        "rule": args.rule,
        "count": 1,
        "created": datetime.now().isoformat(),
        "last_seen": datetime.now().isoformat(),
    }
    data["patterns"].append(entry)
    save(data)
    print(f"ADDED: {entry['id']}")
    print(f"  Rule: {entry['rule']}")


def cmd_hit(args):
    data = load()
    for p in data["patterns"]:
        if p["id"] == args.id:
            p["count"] += 1
            p["last_seen"] = datetime.now().isoformat()
            save(data)
            print(f"UPDATED: {p['id']} (now seen {p['count']}x)")
            if p["count"] >= 2:
                print(f"  Ready for promotion. Run: python cos-learn.py promote {p['id']}")
            return
    print(f"ERROR: Pattern {args.id} not found", file=sys.stderr)
    sys.exit(1)


def cmd_list(args):
    data = load()
    if not data["patterns"] and not data.get("promoted"):
        print("No corrections tracked yet.")
        return

    if data["patterns"]:
        print(f"## Active Corrections ({len(data['patterns'])})\n")
        print(f"{'ID':<22} {'Count':>5}  {'Rule'}")
        print(f"{'-'*22} {'-'*5}  {'-'*40}")
        for p in sorted(data["patterns"], key=lambda x: x["count"], reverse=True):
            flag = " *" if p["count"] >= 2 else ""
            print(f"{p['id']:<22} {p['count']:>5}  {p['rule'][:60]}{flag}")

    if data.get("promoted"):
        print(f"\n## Promoted ({len(data['promoted'])})\n")
        for p in data["promoted"]:
            print(f"  - {p['rule'][:70]}")

    promotable = [p for p in data["patterns"] if p["count"] >= 2]
    if promotable:
        print(f"\n* = Ready for promotion ({len(promotable)} patterns)")


def cmd_promote(args):
    data = load()
    target = None
    for i, p in enumerate(data["patterns"]):
        if p["id"] == args.id:
            target = data["patterns"].pop(i)
            break

    if not target:
        print(f"ERROR: Pattern {args.id} not found", file=sys.stderr)
        sys.exit(1)

    RULES_DIR.mkdir(parents=True, exist_ok=True)
    if not RULES_FILE.exists():
        RULES_FILE.write_text("# Corrections\n\nPromoted patterns from /learn.\n\n---\n\n")

    with open(RULES_FILE, "a") as f:
        f.write(f"- **{target['rule']}** (seen {target['count']}x, promoted {datetime.now().strftime('%Y-%m-%d')})\n")

    data.setdefault("promoted", []).append({
        "id": target["id"],
        "rule": target["rule"],
        "count": target["count"],
        "promoted_at": datetime.now().isoformat(),
    })
    save(data)
    print(f"PROMOTED: {target['id']}")
    print(f"  Rule written to: {RULES_FILE}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="COS Learn -- Correction Tracker")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("check", help="Check if a rule already exists")
    p.add_argument("rule")

    p = sub.add_parser("add", help="Add a new correction")
    p.add_argument("wrong", help="What was done incorrectly")
    p.add_argument("right", help="What the correct behavior is")
    p.add_argument("rule", help="Generalizable prevention rule")

    p = sub.add_parser("hit", help="Record a repeat occurrence")
    p.add_argument("id", help="Pattern ID")

    sub.add_parser("list", help="Show all corrections")

    p = sub.add_parser("promote", help="Promote to permanent rule")
    p.add_argument("id", help="Pattern ID")

    args = parser.parse_args()
    {"check": cmd_check, "add": cmd_add, "hit": cmd_hit, "list": cmd_list, "promote": cmd_promote}[args.cmd](args)
