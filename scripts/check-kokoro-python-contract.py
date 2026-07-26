#!/usr/bin/env python3
"""Fail when public gotcos.com content recommends incompatible Kokoro Python."""

from __future__ import annotations

from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_SUFFIXES = {".html", ".md", ".json", ".xml", ".txt"}
EXCLUDED_PARTS = {".git", ".github", "downloads", "node_modules", "scripts"}

INCOMPATIBLE = {
    "python@3.13": re.compile(r"python@3\.13", re.IGNORECASE),
    "Python 3.13": re.compile(r"python\s+3\.13", re.IGNORECASE),
    "Python 3.11 through 3.13": re.compile(
        r"3\.11(?:\s|&(?:ndash|mdash);|[-–—]){0,12}3\.13",
        re.IGNORECASE,
    ),
    "Kokoro paired with 3.13": re.compile(
        r"(?:kokoro.{0,160}3\.13|3\.13.{0,160}kokoro)",
        re.IGNORECASE | re.DOTALL,
    ),
}

SUPPORTED_GUIDANCE = re.compile(
    r"(?:python@3\.12|python\s+3\.11\s+or\s+3\.12)",
    re.IGNORECASE,
)


def public_text_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*")
        if path.is_file()
        and path.suffix.lower() in PUBLIC_SUFFIXES
        and not EXCLUDED_PARTS.intersection(path.relative_to(ROOT).parts)
    )


def main() -> int:
    failures: list[str] = []
    supported_locations: list[str] = []

    for path in public_text_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        relative = path.relative_to(ROOT).as_posix()
        for label, pattern in INCOMPATIBLE.items():
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                failures.append(f"{relative}:{line}: {label}")
        if "kokoro" in text.lower() and SUPPORTED_GUIDANCE.search(text):
            supported_locations.append(relative)

    if failures:
        print("Incompatible Kokoro Python guidance found:", file=sys.stderr)
        for failure in failures:
            print(f"  {failure}", file=sys.stderr)
        return 1

    if not supported_locations:
        print("No public Kokoro Python 3.11/3.12 guidance found.", file=sys.stderr)
        return 1

    print(
        "Kokoro Python contract: PASS. "
        f"No 3.13 guidance; supported instructions in {', '.join(supported_locations)}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
