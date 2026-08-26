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

WHAT IT CANNOT PROVE, stated rather than silently skipped:
  - The COS Glasses app version. Its truth lives in another repo and there is no
    token here. Only internal consistency across the page is checked.
  - The Even Hub marketplace listing pin. Not machine-readable from CI.
A check that cannot fail is decoration, so these are reported, never asserted.
"""
import hashlib
import json
import pathlib
import re
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
PKG = "@gotcos/glasses-server"
fail: list[str] = []
note: list[str] = []


def npm_latest(pkg: str) -> str | None:
    url = f"https://registry.npmjs.org/{pkg.replace('/', '%2f')}"
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return json.load(r)["dist-tags"]["latest"]
    except (urllib.error.URLError, KeyError, ValueError, TimeoutError) as e:
        # Network trouble is a different axis from version drift. Warn loudly and
        # keep the other five checks meaningful rather than blocking a typo fix.
        note.append(f"could not reach the npm registry ({e}); server-version check SKIPPED")
        return None


docs = (ROOT / "docs" / "index.html").read_text(encoding="utf-8")
control = (ROOT / "control" / "index.html").read_text(encoding="utf-8")
appcast = json.loads((ROOT / "control" / "appcast.json").read_text(encoding="utf-8"))
stable = appcast["channels"]["stable"]
ac_version, ac_build, ac_sha = stable["version"], stable["build"], stable["sha256"]

# --- 1/2. the page's CURRENT-STATE claims ------------------------------------
# Deliberately NOT "every version-shaped string": the docs correctly cite history
# ("added in 0.5.67", "since 6.14.1"), and flagging those trains people to ignore
# this check. Assert the lines that claim what is current, and nothing else.
covers = re.search(
    r"Covers COS Glasses (\d+\.\d+\.\d+).*?@gotcos/glasses-server (\d+\.\d+\.\d+).*?COS Control (\d+\.\d+\.\d+)",
    docs, re.S)
if not covers:
    fail.append("docs/index.html: the 'Covers ... · server ... · COS Control ...' grounding line is gone; "
                "it is what this check reads, so restore it rather than deleting it")
else:
    docs_app, docs_server, docs_control = covers.groups()
    latest = npm_latest(PKG)
    if latest and docs_server != latest:
        fail.append(f"docs grounding line says server {docs_server}; npm latest is {latest}")
    if docs_control != ac_version:
        fail.append(f"docs grounding line says Control {docs_control}; appcast ships {ac_version}")

    supported = re.search(
        r"Current supported versions are COS Control <strong>(\d+\.\d+\.\d+)</strong>, "
        r"server <strong>(\d+\.\d+\.\d+)</strong>", docs)
    if not supported:
        note.append("docs: 'Current supported versions are ...' sentence not found in its expected shape")
    else:
        s_control, s_server = supported.groups()
        if s_control != docs_control:
            fail.append(f"docs disagrees with itself on Control: grounding {docs_control} vs supported-versions {s_control}")
        if s_server != docs_server:
            fail.append(f"docs disagrees with itself on server: grounding {docs_server} vs supported-versions {s_server}")

# --- 3. the /control page's own current-state claims --------------------------
dl = set(re.findall(r"COS-Control-macOS-arm64-(\d+\.\d+\.\d+)\.zip", control))
if not dl:
    note.append("control/index.html links no versioned download")
elif dl != {ac_version}:
    fail.append(f"control/index.html offers download(s) {sorted(dl)} but the appcast ships {ac_version}")
byline = set(re.findall(r"v(\d+\.\d+\.\d+) &middot;", control))
if byline and byline != {ac_version}:
    fail.append(f"control/index.html byline reads {sorted(byline)}; appcast ships {ac_version}")

# --- 4/5/6. the artifact actually served ---------------------------------------
zip_path = ROOT / "downloads" / f"COS-Control-macOS-arm64-{ac_version}.zip"
if not zip_path.exists():
    fail.append(f"appcast advertises {ac_version} but {zip_path.relative_to(ROOT)} is missing")
else:
    real = hashlib.sha256(zip_path.read_bytes()).hexdigest()
    if real != ac_sha:
        fail.append(f"appcast sha256 {ac_sha[:16]}... != actual {real[:16]}... (auto-update would reject)")
    page_shas = re.findall(r"[0-9a-f]{64}", control)
    if not page_shas:
        note.append("control/index.html publishes no verify-SHA")
    elif real not in page_shas:
        fail.append(
            f"control/index.html verify-SHA {page_shas[0][:16]}... != actual {real[:16]}... "
            "(readers following the verify steps are told their download was tampered with)"
        )
    latest_zip = ROOT / "downloads" / "COS-Control-macOS-arm64-latest.zip"
    if latest_zip.exists() and hashlib.sha256(latest_zip.read_bytes()).hexdigest() != real:
        fail.append("downloads/...-latest.zip does not match the version the appcast advertises")

if not stable["url"].endswith(f"{ac_version}.zip"):
    fail.append(f"appcast url {stable['url']} does not name version {ac_version}")

# --- app version: consistency only, and say so ---------------------------------
app_versions = set(re.findall(r"\b6\.8\.\d+\b", docs))
note.append(
    f"COS Glasses app version(s) on /docs: {sorted(app_versions) or 'none'} (build {ac_build} Control). "
    "NOT verified against the app repo or the Even Hub listing; no token here. Confirm by hand at release."
)

for n in note:
    print(f"  note: {n}")
if fail:
    print("\nVersion drift on the public pages:", file=sys.stderr)
    for f in fail:
        print(f"  - {f}", file=sys.stderr)
    sys.exit(1)
print("  public pages agree with the appcast, the staged artifact, and npm latest")
