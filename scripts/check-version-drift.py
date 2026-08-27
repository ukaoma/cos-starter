#!/usr/bin/env python3
"""Fail when the public pages drift from what is actually shipping.

Written after gotcos.com/docs sat three releases stale on every axis while the
release itself was fine, and after the /control page published a verify-SHA that
did not match the artifact it was telling people to verify. Both are invisible
to a human reader: the page looks authoritative either way.

WHAT THIS CAN PROVE, and therefore what it checks:
  1. docs server version   == npm dist-tags.latest        (public registry)
  2. docs Control version  == control/appcast.json        (same repo, authoritative)
  3. /control page version == control/appcast.json
  4. /control verify-SHA   == sha256 of the staged zip    (the defect that shipped)
  5. appcast sha256        == sha256 of the staged zip
  6. appcast url filename  == the version it advertises
  7. appcast serverTarget  == docs current server (always) and npm latest
     (when the registry answers — same skip contract as check 1)
  8. CURRENT-claim surfaces that are not the Covers line — hero chips,
     Latest-release sentences, both Managed mocks (HTML-entity aware),
     compatibility pair, FAQ pair, badge grounding — agree with Covers.
     A Covers-only bump used to go green while those still lied.
  9. Current glasses version, build, and Even Hub pin claims agree internally.
     Historical 6.8.x introduction facts remain outside this comparison.
 10. Control JSON-LD, visible version labels, verify command, required latest
     alias, and both .sha256 sidecars agree with the appcast and staged bytes.

WHAT IT CANNOT PROVE, stated rather than silently skipped:
  - The COS Glasses app version. Its truth lives in another repo and there is no
    token here. Only internal consistency across the page is checked.
  - The Even Hub marketplace listing pin. Not machine-readable from CI.
A check that cannot fail is decoration, so these are reported, never asserted.

Do not search raw HTML for a unicode middot in `Managed · X`. Control uses
`&middot;` and docs uses `&#183;`. Unescape first, then compare. Cron on this
workflow re-runs the checker; it does not write docs.
"""
from __future__ import annotations

import hashlib
import html as html_lib
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
PKG = "@gotcos/glasses-server"

COVERS_RE = re.compile(
    r"Covers COS Glasses (\d+\.\d+\.\d+) \(build (\d+), Hub pin (\d+\.\d+\.\d+)\) "
    r"· server @gotcos/glasses-server (\d+\.\d+\.\d+) · COS Control (\d+\.\d+\.\d+)",
)
SUPPORTED_RE = re.compile(
    r"Current supported versions are COS Control <strong>(\d+\.\d+\.\d+)</strong>, "
    r"server <strong>(\d+\.\d+\.\d+)</strong>, and COS Glasses "
    r"<strong>(\d+\.\d+\.\d+)</strong> from Even Hub",
)
SIDEBAR_APP_RE = re.compile(r'<span class="sb-ver">(\d+\.\d+\.\d+)</span>')
HERO_APP_CHIP_RE = re.compile(
    r'<span class="chip">App <b>(\d+\.\d+\.\d+)</b> · build (\d+)</span>'
)
HERO_SERVER_CHIP_RE = re.compile(r'<span class="chip">Server <b>(\d+\.\d+\.\d+)</b></span>')
HERO_CONTROL_CHIP_RE = re.compile(r'<span class="chip">Control <b>(\d+\.\d+\.\d+)</b></span>')
PHONE_MOCK_APP_RE = re.compile(
    r'<span class="hi">Chief of Staff</span> <span class="dim">(\d+\.\d+\.\d+)</span>'
)
PHONE_COMPANION_APP_RE = re.compile(
    r'<div class="pf-app"><b>COS GLASSES</b><i>v(\d+\.\d+\.\d+) &#183; Live on G2</i></div>'
)
LATEST_RELEASE_RE = re.compile(
    r"Latest release package: Control (\d+\.\d+\.\d+), glasses (\d+\.\d+\.\d+)"
)
PUBLIC_DOWNLOAD_RE = re.compile(r"COS Control (\d+\.\d+\.\d+) is the public Mac download")
CURRENT_COMPANION_PACK_RE = re.compile(
    r"COS Glasses (\d+\.\d+\.\d+) is the current companion pack"
)
LATEST_HUB_PIN_RE = re.compile(
    r"COS Glasses \d+\.\d+\.\d+ is the current companion pack:.*?Even Hub still lists "
    r"(\d+\.\d+\.\d+)\. Server identity",
    re.S,
)
SERVER_IDENTITY_RE = re.compile(r"Server identity is (\d+\.\d+\.\d+)")
COMPANION_PAIR_RE = re.compile(
    r"glasses (\d+\.\d+\.\d+) plus server (\d+\.\d+\.\d+) is the current companion pair; "
    r"Even Hub still lists (\d+\.\d+\.\d+)"
)
SIDELOAD_RE = re.compile(
    r"Sideload <strong>(\d+\.\d+\.\d+)</strong> for the newest companion build; "
    r"Even Hub still lists (\d+\.\d+\.\d+)"
)
FAQ_PAIR_RE = re.compile(
    r"The current supported pair is COS Glasses (\d+\.\d+\.\d+) "
    r"\(Even Hub still lists (\d+\.\d+\.\d+)\) "
    r"and server (\d+\.\d+\.\d+); COS Control (\d+\.\d+\.\d+) is recommended"
)
BADGE_GROUNDING_RE = re.compile(
    r"NEW / UPDATED badges \(grounded vs glasses (\d+\.\d+\.\d+) / Control "
    r"(\d+\.\d+\.\d+) / server (\d+\.\d+\.\d+)"
)
MANAGED_MOCK_RE = re.compile(r"Managed · (\d+\.\d+\.\d+)")
CONTROL_ARIA_RE = re.compile(r"managed server healthy on (\d+\.\d+\.\d+)")
DOCS_ARIA_RE = re.compile(r"server managed on (\d+\.\d+\.\d+)")
ROLLBACK_PAIR_RE = re.compile(
    r"package-level rollback is COS Glasses <strong>(\d+\.\d+\.\d+)</strong> "
    r"with the same server (\d+\.\d+\.\d+)"
)
HUB_REMEDIATION_RE = re.compile(
    r"Install COS Glasses <strong>(\d+\.\d+\.\d+)</strong> from Even Hub"
)
JSONLD_VERSION_RE = re.compile(r'"softwareVersion": "(\d+\.\d+\.\d+)"')
JSONLD_DOWNLOAD_RE = re.compile(
    r'"downloadUrl": "[^"]*COS-Control-macOS-arm64-(\d+\.\d+\.\d+)\.zip"'
)
CONTROL_DOWNLOAD_HREF_RE = re.compile(
    r'href="[^"]*COS-Control-macOS-arm64-(\d+\.\d+\.\d+)\.zip"'
)
CONTROL_DOWNLOAD_LABEL_RE = re.compile(r">Download v(\d+\.\d+\.\d+)<")
CONTROL_BYLINE_RE = re.compile(r"v(\d+\.\d+\.\d+) &middot; macOS 14\+")
VERIFY_COMMAND_RE = re.compile(
    r"shasum -a 256 COS-Control-macOS-arm64-(\d+\.\d+\.\d+)\.zip"
)
VERIFY_SHA_RE = re.compile(r'<p class="sha">SHA-256<br>([0-9a-f]{64})</p>')
SIDECAR_RE = re.compile(r"^([0-9a-f]{64})  ([^\r\n]+)\r?\n?$")


def npm_latest(pkg: str) -> tuple[str | None, str | None]:
    """Return (latest, skip_note). skip_note is set when the registry is unreachable."""
    url = f"https://registry.npmjs.org/{pkg.replace('/', '%2f')}"
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                return json.load(r)["dist-tags"]["latest"], None
        except (urllib.error.URLError, KeyError, ValueError, TimeoutError) as e:
            last_error = e
            if attempt < 2:
                time.sleep((0.25, 0.75)[attempt])
    # Network trouble is a different axis from version drift. Warn loudly and
    # keep the other checks meaningful rather than blocking a typo fix.
    return None, f"could not reach the npm registry after 3 attempts ({last_error}); server-version check SKIPPED"


def _one(pattern: re.Pattern[str], text: str, label: str, fail: list[str]) -> str | None:
    matches = pattern.findall(text)
    if not matches:
        fail.append(f"{label} is gone; restore it rather than deleting it")
        return None
    if len(matches) != 1:
        fail.append(f"{label} matched {len(matches)} times; keep it a unique current-claim")
        return None
    value = matches[0]
    if not isinstance(value, str):
        raise TypeError(f"{label} must use a single-capture regex")
    return value


def _one_groups(
    pattern: re.Pattern[str], text: str, label: str, fail: list[str]
) -> tuple[str, ...] | None:
    matches = list(pattern.finditer(text))
    if not matches:
        fail.append(f"{label} is gone; restore it rather than deleting it")
        return None
    if len(matches) != 1:
        fail.append(f"{label} matched {len(matches)} times; keep it a unique current-claim")
        return None
    return matches[0].groups()


def _require(label: str, got: str | None, expected: str, fail: list[str]) -> None:
    if got is None:
        return
    if got != expected:
        fail.append(f"{label} says {got}; current claim is {expected}")


def _require_sidecar(
    *, label: str, content: str | None, expected_sha: str, expected_name: str, fail: list[str]
) -> None:
    if content is None:
        fail.append(f"{label} is missing")
        return
    match = SIDECAR_RE.fullmatch(content)
    if not match:
        fail.append(f"{label} must contain '<sha256>  <filename>' on one line")
        return
    sidecar_sha, sidecar_name = match.groups()
    if sidecar_sha != expected_sha:
        fail.append(f"{label} hash {sidecar_sha[:16]}... != actual {expected_sha[:16]}...")
    if sidecar_name != expected_name:
        fail.append(f"{label} names {sidecar_name}; expected {expected_name}")


def evaluate(
    *,
    docs: str,
    control: str,
    stable: dict,
    zip_sha: str | None,
    latest_zip_sha: str | None,
    versioned_sidecar: str | None,
    latest_sidecar: str | None,
    npm: str | None,
    zip_missing: bool = False,
    latest_zip_missing: bool = False,
) -> tuple[list[str], list[str]]:
    """Return (fail, note). Pure: no I/O. Tests call this with fixtures."""
    fail: list[str] = []
    note: list[str] = []

    ac_version = stable["version"]
    ac_build = stable["build"]
    ac_sha = stable["sha256"]
    ac_url = stable["url"]
    target = stable.get("serverTarget")

    covers = _one_groups(COVERS_RE, docs, "docs Covers grounding line", fail)
    docs_app = docs_build = docs_hub = docs_server = docs_control = None
    if covers:
        docs_app, docs_build, docs_hub, docs_server, docs_control = covers
        app_patch = docs_app.rsplit(".", 1)[-1]
        if docs_build != app_patch:
            fail.append(
                f"docs Covers says glasses {docs_app} is build {docs_build}; "
                f"the app build convention requires {app_patch}"
            )
        if npm and docs_server != npm:
            fail.append(f"docs grounding line says server {docs_server}; npm latest is {npm}")
        if docs_control != ac_version:
            fail.append(f"docs grounding line says Control {docs_control}; appcast ships {ac_version}")

        supported = _one_groups(SUPPORTED_RE, docs, "docs Current supported versions sentence", fail)
        if supported:
            s_control, s_server, s_hub = supported
            _require("docs supported-versions Control", s_control, docs_control, fail)
            _require("docs supported-versions server", s_server, docs_server, fail)
            _require("docs supported-versions Even Hub app", s_hub, docs_hub, fail)

    if target is None or target == "":
        fail.append("appcast stable.serverTarget is missing")
    else:
        if docs_server and target != docs_server:
            fail.append(f"appcast serverTarget is {target}; docs current server is {docs_server}")
        if npm and target != npm:
            fail.append(f"appcast serverTarget is {target}; npm latest is {npm}")

    if docs_app and docs_build and docs_hub and docs_server and docs_control:
        _require(
            "docs sidebar app version",
            _one(SIDEBAR_APP_RE, docs, "docs sidebar app version", fail),
            docs_app,
            fail,
        )
        hero_app = _one_groups(HERO_APP_CHIP_RE, docs, "docs hero App chip", fail)
        if hero_app:
            hero_version, hero_build = hero_app
            _require("docs hero App version", hero_version, docs_app, fail)
            _require("docs hero App build", hero_build, docs_build, fail)
        _require("docs hero Server chip", _one(HERO_SERVER_CHIP_RE, docs, "docs hero Server chip", fail), docs_server, fail)
        _require("docs hero Control chip", _one(HERO_CONTROL_CHIP_RE, docs, "docs hero Control chip", fail), docs_control, fail)
        _require(
            "docs G2 HUD app version",
            _one(PHONE_MOCK_APP_RE, docs, "docs G2 HUD app version", fail),
            docs_app,
            fail,
        )
        _require(
            "docs phone companion app version",
            _one(PHONE_COMPANION_APP_RE, docs, "docs phone companion app version", fail),
            docs_app,
            fail,
        )
        latest_release = _one_groups(LATEST_RELEASE_RE, docs, "docs Latest release package", fail)
        if latest_release:
            latest_control, latest_app = latest_release
            _require("docs Latest release Control", latest_control, docs_control, fail)
            _require("docs Latest release glasses", latest_app, docs_app, fail)
        _require("docs public Mac download sentence", _one(PUBLIC_DOWNLOAD_RE, docs, "docs public Mac download sentence", fail), docs_control, fail)
        _require(
            "docs current companion pack",
            _one(CURRENT_COMPANION_PACK_RE, docs, "docs current companion pack", fail),
            docs_app,
            fail,
        )
        _require(
            "docs Latest-release Even Hub pin",
            _one(LATEST_HUB_PIN_RE, docs, "docs Latest-release Even Hub pin", fail),
            docs_hub,
            fail,
        )
        _require("docs Server identity", _one(SERVER_IDENTITY_RE, docs, "docs Server identity", fail), docs_server, fail)
        companion = _one_groups(COMPANION_PAIR_RE, docs, "docs current companion pair", fail)
        if companion:
            pair_app, pair_server, pair_hub = companion
            _require("docs companion-pair glasses", pair_app, docs_app, fail)
            _require("docs companion-pair server", pair_server, docs_server, fail)
            _require("docs companion-pair Even Hub pin", pair_hub, docs_hub, fail)

        sideload = _one_groups(SIDELOAD_RE, docs, "docs Updating sideload sentence", fail)
        if sideload:
            sideload_app, sideload_hub = sideload
            _require("docs Updating sideload app", sideload_app, docs_app, fail)
            _require("docs Updating Even Hub pin", sideload_hub, docs_hub, fail)

        rollback = _one_groups(ROLLBACK_PAIR_RE, docs, "docs rollback pair", fail)
        if rollback:
            rollback_app, rollback_server = rollback
            _require("docs rollback glasses", rollback_app, docs_hub, fail)
            _require("docs rollback same-server", rollback_server, docs_server, fail)

        _require(
            "docs Even Hub remediation version",
            _one(HUB_REMEDIATION_RE, docs, "docs Even Hub remediation version", fail),
            docs_hub,
            fail,
        )

        faq = _one_groups(FAQ_PAIR_RE, docs, "docs FAQ current supported pair", fail)
        if faq:
            faq_app, faq_hub, faq_server, faq_control = faq
            _require("docs FAQ current glasses", faq_app, docs_app, fail)
            _require("docs FAQ Even Hub pin", faq_hub, docs_hub, fail)
            _require("docs FAQ current server", faq_server, docs_server, fail)
            _require("docs FAQ current Control", faq_control, docs_control, fail)

        badge = _one_groups(BADGE_GROUNDING_RE, docs, "docs NEW/UPDATED badge grounding", fail)
        if badge:
            badge_app, badge_control, badge_server = badge
            _require("docs badge grounding glasses", badge_app, docs_app, fail)
            _require("docs badge grounding Control", badge_control, docs_control, fail)
            _require("docs badge grounding server", badge_server, docs_server, fail)

        # Entity-aware Managed mocks. Raw HTML uses &middot; (control) and &#183;
        # (docs). A unicode-middot search against source matches nothing forever.
        docs_plain = html_lib.unescape(docs)
        control_plain = html_lib.unescape(control)

        _require(
            "docs Managed mock",
            _one(MANAGED_MOCK_RE, docs_plain, "docs Managed mock after HTML unescape", fail),
            docs_server,
            fail,
        )
        _require(
            "control Managed mock",
            _one(MANAGED_MOCK_RE, control_plain, "control Managed mock after HTML unescape", fail),
            docs_server,
            fail,
        )

        _require(
            "control mock aria-label server",
            _one(CONTROL_ARIA_RE, control_plain, "control mock aria-label server", fail),
            docs_server,
            fail,
        )
        _require(
            "docs mock aria-label server",
            _one(DOCS_ARIA_RE, docs_plain, "docs mock aria-label server", fail),
            docs_server,
            fail,
        )

    # --- /control page's own current-state Control version claims --------------
    _require(
        "control JSON-LD softwareVersion",
        _one(JSONLD_VERSION_RE, control, "control JSON-LD softwareVersion", fail),
        ac_version,
        fail,
    )
    _require(
        "control JSON-LD downloadUrl",
        _one(JSONLD_DOWNLOAD_RE, control, "control JSON-LD downloadUrl", fail),
        ac_version,
        fail,
    )
    href_versions = CONTROL_DOWNLOAD_HREF_RE.findall(control)
    if not href_versions:
        fail.append("control versioned download hrefs are gone; keep at least one public versioned link")
    elif set(href_versions) != {ac_version}:
        fail.append(f"control download hrefs say {sorted(set(href_versions))}; appcast ships {ac_version}")
    _require(
        "control displayed Download v label",
        _one(CONTROL_DOWNLOAD_LABEL_RE, control, "control displayed Download v label", fail),
        ac_version,
        fail,
    )
    bylines = CONTROL_BYLINE_RE.findall(control)
    if not bylines:
        fail.append("control version bylines are gone; keep the visible current-version claim")
    elif set(bylines) != {ac_version}:
        fail.append(f"control bylines say {sorted(set(bylines))}; appcast ships {ac_version}")
    _require(
        "control verify command filename",
        _one(VERIFY_COMMAND_RE, control, "control verify command filename", fail),
        ac_version,
        fail,
    )

    # --- the artifact actually served ------------------------------------------
    if zip_missing:
        fail.append(f"appcast advertises {ac_version} but the staged zip is missing")
    elif zip_sha is not None:
        if zip_sha != ac_sha:
            fail.append(f"appcast sha256 {ac_sha[:16]}... != actual {zip_sha[:16]}... (auto-update would reject)")
        _require(
            "control displayed verify-SHA",
            _one(VERIFY_SHA_RE, control, "control displayed verify-SHA", fail),
            zip_sha,
            fail,
        )
        _require_sidecar(
            label=f"downloads/COS-Control-macOS-arm64-{ac_version}.zip.sha256",
            content=versioned_sidecar,
            expected_sha=zip_sha,
            expected_name=f"COS-Control-macOS-arm64-{ac_version}.zip",
            fail=fail,
        )

    if latest_zip_missing:
        fail.append("downloads/COS-Control-macOS-arm64-latest.zip is missing")
    elif latest_zip_sha is not None:
        if zip_sha is not None and latest_zip_sha != zip_sha:
            fail.append("downloads/...-latest.zip does not match the version the appcast advertises")
        _require_sidecar(
            label="downloads/COS-Control-macOS-arm64-latest.zip.sha256",
            content=latest_sidecar,
            expected_sha=latest_zip_sha,
            expected_name="COS-Control-macOS-arm64-latest.zip",
            fail=fail,
        )

    if not ac_url.endswith(f"{ac_version}.zip"):
        fail.append(f"appcast url {ac_url} does not name version {ac_version}")

    note_pairs = re.findall(r"Pairs with server (\d+\.\d+\.\d+)", stable.get("notes", ""))
    if note_pairs and (target is None or set(note_pairs) != {target}):
        fail.append(f"appcast notes pair with server {sorted(set(note_pairs))}; serverTarget is {target}")

    app_versions = set(re.findall(r"\b6\.8\.\d+\b", docs))
    note.append(
        f"COS Glasses app version(s) on /docs: {sorted(app_versions) or 'none'} (build {ac_build} Control). "
        "Current app/build/Hub-pin claims are internally checked, but the app repo and Even Hub listing "
        "are not machine-readable here. Confirm those two external facts by hand at release."
    )
    return fail, note


def main() -> int:
    docs = (ROOT / "docs" / "index.html").read_text(encoding="utf-8")
    control = (ROOT / "control" / "index.html").read_text(encoding="utf-8")
    appcast = json.loads((ROOT / "control" / "appcast.json").read_text(encoding="utf-8"))
    stable = appcast["channels"]["stable"]
    ac_version, ac_sha = stable["version"], stable["sha256"]

    npm, npm_note = npm_latest(PKG)
    note_prefix: list[str] = []
    if npm_note:
        note_prefix.append(npm_note)

    zip_path = ROOT / "downloads" / f"COS-Control-macOS-arm64-{ac_version}.zip"
    zip_missing = not zip_path.exists()
    zip_sha = None if zip_missing else hashlib.sha256(zip_path.read_bytes()).hexdigest()
    versioned_sidecar_path = zip_path.with_suffix(zip_path.suffix + ".sha256")
    versioned_sidecar = (
        versioned_sidecar_path.read_text(encoding="utf-8") if versioned_sidecar_path.exists() else None
    )
    latest_zip = ROOT / "downloads" / "COS-Control-macOS-arm64-latest.zip"
    latest_zip_missing = not latest_zip.exists()
    latest_zip_sha = (
        None if latest_zip_missing else hashlib.sha256(latest_zip.read_bytes()).hexdigest()
    )
    latest_sidecar_path = latest_zip.with_suffix(latest_zip.suffix + ".sha256")
    latest_sidecar = (
        latest_sidecar_path.read_text(encoding="utf-8") if latest_sidecar_path.exists() else None
    )

    fail, note = evaluate(
        docs=docs,
        control=control,
        stable=stable,
        zip_sha=zip_sha,
        latest_zip_sha=latest_zip_sha,
        versioned_sidecar=versioned_sidecar,
        latest_sidecar=latest_sidecar,
        npm=npm,
        zip_missing=zip_missing,
        latest_zip_missing=latest_zip_missing,
    )
    note = note_prefix + note

    for n in note:
        print(f"  note: {n}")
    if fail:
        print("\nVersion drift on the public pages:", file=sys.stderr)
        for f in fail:
            print(f"  - {f}", file=sys.stderr)
        return 1
    if npm is None:
        print("  public pages agree with the appcast and staged artifacts; npm latest UNVERIFIED")
    else:
        print("  public pages agree with the appcast, the staged artifacts, and npm latest")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
