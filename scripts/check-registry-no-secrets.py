#!/usr/bin/env python3
"""Reject credentials in the PUBLIC username registry.

registry.json is served from gotcos.com to anyone on the internet. It maps a
COS username to the server URL so setup can skip typing an IP. It must never
carry the API token: every user, including Miles and Queen, enters their own
token by hand, exactly like a normal install.

This is an allowlist, not a keyword blocklist. A new field fails CI until it is
consciously added below, so the next person to extend the registry cannot
reintroduce a secret by inventing a key name this script never heard of.

History: both entries shipped a live `token` until 2026-07-29. Removing it is
containment only -- those two tokens were public and remain in git history, so
each one still has to be rotated on its own machine.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REGISTRY = Path(__file__).resolve().parents[1] / "registry.json"

# Every key an entry is allowed to carry. Anything else is a failure.
ALLOWED_ENTRY_KEYS = {"url", "name", "domain", "status"}

# Defence in depth: key names that are never acceptable at any depth, even if
# somebody also adds them to ALLOWED_ENTRY_KEYS by mistake.
FORBIDDEN_KEY_PARTS = (
    "token",
    "secret",
    "password",
    "passwd",
    "bearer",
    "credential",
    "apikey",
    "api_key",
    "private",
)

# A long opaque run with no dots, slashes or spaces looks like a credential.
# Real values here are URLs, human names and dotted hostnames, so none match.
OPAQUE_VALUE = re.compile(r"^[A-Za-z0-9_\-]{20,}$")


def fail(problems: list[str]) -> None:
    print("registry.json FAILED the public-secret contract:\n", file=sys.stderr)
    for p in problems:
        print(f"  - {p}", file=sys.stderr)
    print(
        "\nThe registry is world-readable. Tokens belong on the user's own"
        "\ndevice, entered by hand. Do not put one here.",
        file=sys.stderr,
    )
    sys.exit(1)


def walk(node: object, path: str, problems: list[str]) -> None:
    if isinstance(node, dict):
        for key, value in node.items():
            lowered = key.lower()
            for part in FORBIDDEN_KEY_PARTS:
                if part in lowered:
                    problems.append(f"forbidden key {path}.{key!r} (matched {part!r})")
                    break
            walk(value, f"{path}.{key}", problems)
    elif isinstance(node, list):
        for i, value in enumerate(node):
            walk(value, f"{path}[{i}]", problems)
    elif isinstance(node, str) and OPAQUE_VALUE.match(node):
        problems.append(
            f"{path} is a {len(node)}-char opaque string, which looks like a credential"
        )


def main() -> None:
    if not REGISTRY.exists():
        print(f"registry.json not found at {REGISTRY}", file=sys.stderr)
        sys.exit(1)

    try:
        registry = json.loads(REGISTRY.read_text())
    except json.JSONDecodeError as exc:
        print(f"registry.json is not valid JSON: {exc}", file=sys.stderr)
        sys.exit(1)

    problems: list[str] = []

    if not isinstance(registry, dict):
        fail([f"top level must be an object of username -> entry, got {type(registry).__name__}"])

    for username, entry in registry.items():
        if not isinstance(entry, dict):
            problems.append(f"entry {username!r} must be an object, got {type(entry).__name__}")
            continue
        for key in entry:
            if key not in ALLOWED_ENTRY_KEYS:
                problems.append(
                    f"entry {username!r} has key {key!r}, which is not in the allowlist "
                    f"{sorted(ALLOWED_ENTRY_KEYS)}"
                )

    walk(registry, "registry", problems)

    if problems:
        fail(problems)

    entries = len(registry)
    print(f"registry.json OK: {entries} entr{'y' if entries == 1 else 'ies'}, no credentials.")


if __name__ == "__main__":
    main()
