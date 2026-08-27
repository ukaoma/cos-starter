#!/usr/bin/env python3
"""Fixtures for check-version-drift.py. Run: python3 scripts/test_check_version_drift.py"""
from __future__ import annotations

import importlib.util
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("cvd", ROOT / "check-version-drift.py")
assert SPEC and SPEC.loader
cvd = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(cvd)

STABLE = {
    "version": "0.5.86",
    "build": 124,
    "url": "https://www.gotcos.com/downloads/COS-Control-macOS-arm64-0.5.86.zip",
    "sha256": "aa" * 32,
    "serverTarget": "6.40.2",
    "notes": "Pairs with server 6.40.2.",
}

SHA = "aa" * 32

COVERS = (
    "Covers COS Glasses 6.8.437 (build 437, Hub pin 6.8.353) "
    "· server @gotcos/glasses-server 6.40.2 · COS Control 0.5.86."
)

DOCS = f"""
<!-- {COVERS} -->
<span class="sb-ver">6.8.437</span>
<span class="chip">App <b>6.8.437</b> · build 437</span>
<span class="chip">Server <b>6.40.2</b></span>
<span class="chip">Control <b>0.5.86</b></span>
<p><strong>Latest release package: Control 0.5.86, glasses 6.8.437.</strong>
COS Control 0.5.86 is the public Mac download. COS Glasses 6.8.437 is the current companion pack:
current behavior. Even Hub still lists 6.8.353. Server identity is 6.40.2.</p>
<span class="hi">Chief of Staff</span> <span class="dim">6.8.437</span>
<div class="pf-app"><b>COS GLASSES</b><i>v6.8.437 &#183; Live on G2</i></div>
<div role="img" aria-label="The COS Control menu bar panel: server managed on 6.40.2, ownership verified">
<b>Managed &#183; 6.40.2</b>
</div>
<p>Since COS Control 0.5.85 a message carrying rich media says so before you open it.
Before 0.5.85 a video was dropped silently.
and since 6.40.0 hidden thinking follows the effort you ask for.</p>
<p>glasses 6.8.437 plus server 6.40.2 is the current companion pair; Even Hub still lists 6.8.353.</p>
<p>Current supported versions are COS Control <strong>0.5.86</strong>, server <strong>6.40.2</strong>, and COS Glasses <strong>6.8.353</strong> from Even Hub.</p>
<p>Sideload <strong>6.8.437</strong> for the newest companion build; Even Hub still lists 6.8.353.</p>
<p>The package-level rollback is COS Glasses <strong>6.8.353</strong> with the same server 6.40.2.</p>
<p>Install COS Glasses <strong>6.8.353</strong> from Even Hub.</p>
<p>The current supported pair is COS Glasses 6.8.437 (Even Hub still lists 6.8.353) and server 6.40.2; COS Control 0.5.86 is recommended</p>
// NEW / UPDATED badges (grounded vs glasses 6.8.437 / Control 0.5.86 / server 6.40.2, 2026-08-27)
"""

CONTROL = f"""
<script type="application/ld+json">
{{"softwareVersion": "0.5.86", "downloadUrl": "https://www.gotcos.com/downloads/COS-Control-macOS-arm64-0.5.86.zip"}}
</script>
<div role="img" aria-label="COS Control menu-bar panel: managed server healthy on 6.40.2 with verified ownership">
<b class="cc-v ok">Managed &middot; 6.40.2</b>
</div>
<p>Managed servers reload safely; older adopted servers show the selection as pending.</p>
<a href="/downloads/COS-Control-macOS-arm64-0.5.86.zip">Download v0.5.86</a>
<p class="byline">v0.5.86 &middot; macOS 14+</p>
<code>shasum -a 256 COS-Control-macOS-arm64-0.5.86.zip</code>
<p class="sha">SHA-256<br>{SHA}</p>
"""


def run(**kwargs):
    args = dict(
        docs=DOCS,
        control=CONTROL,
        stable=dict(STABLE),
        zip_sha=SHA,
        latest_zip_sha=SHA,
        versioned_sidecar=f"{SHA}  COS-Control-macOS-arm64-0.5.86.zip\n",
        latest_sidecar=f"{SHA}  COS-Control-macOS-arm64-latest.zip\n",
        npm="6.40.2",
        zip_missing=False,
        latest_zip_missing=False,
    )
    args.update(kwargs)
    return cvd.evaluate(**args)


class VersionDriftTests(unittest.TestCase):
    def test_happy_path_entity_mocks(self):
        fail, note = run()
        self.assertEqual(fail, [], fail)
        self.assertTrue(any("6.8.437" in n for n in note))

    def test_raw_html_has_no_unicode_managed_dot(self):
        """The trap: searching source for unicode Managed · misses both pages."""
        self.assertNotIn("Managed ·", CONTROL)
        self.assertNotIn("Managed ·", DOCS)
        self.assertIn("Managed &middot; 6.40.2", CONTROL)
        self.assertIn("Managed &#183; 6.40.2", DOCS)
        fail, _ = run()
        self.assertEqual(fail, [])

    def test_stale_control_managed_mock_fails(self):
        stale = CONTROL.replace("Managed &middot; 6.40.2", "Managed &middot; 6.40.0")
        fail, _ = run(control=stale)
        self.assertTrue(any("control Managed mock" in f for f in fail), fail)

    def test_stale_docs_managed_mock_fails(self):
        stale = DOCS.replace("Managed &#183; 6.40.2", "Managed &#183; 6.40.0")
        fail, _ = run(docs=stale)
        self.assertTrue(any("docs Managed mock" in f for f in fail), fail)

    def test_stale_hero_chip_fails_even_when_covers_is_current(self):
        stale = DOCS.replace('<span class="chip">Server <b>6.40.2</b></span>',
                             '<span class="chip">Server <b>6.40.0</b></span>')
        fail, _ = run(docs=stale)
        self.assertTrue(any("hero Server chip" in f for f in fail), fail)

    def test_since_facts_are_not_current_claims(self):
        fail, _ = run()
        self.assertEqual(fail, [])
        self.assertIn("Since COS Control 0.5.85", DOCS)
        self.assertIn("since 6.40.0 hidden thinking", DOCS)

    def test_missing_server_target_fails(self):
        stable = dict(STABLE)
        del stable["serverTarget"]
        fail, _ = run(stable=stable)
        self.assertTrue(any("serverTarget is missing" in f for f in fail), fail)

    def test_server_target_vs_npm_fails_when_registry_answers(self):
        fail, _ = run(npm="6.40.9")
        self.assertTrue(any("npm latest is 6.40.9" in f for f in fail), fail)

    def test_npm_outage_skips_registry_compares_not_docs_internal(self):
        fail, _ = run(npm=None)
        self.assertFalse(any("npm latest" in f for f in fail), fail)

    def test_server_target_vs_docs_fails_without_npm(self):
        stable = dict(STABLE)
        stable["serverTarget"] = "6.39.0"
        fail, _ = run(stable=stable, npm=None)
        self.assertTrue(any("docs current server" in f for f in fail), fail)

    def test_managed_servers_reload_is_not_a_version_row(self):
        fail, _ = run()
        self.assertEqual(fail, [])
        self.assertIn("Managed servers reload", CONTROL)

    def test_unicode_middot_search_on_raw_html_is_the_old_bug(self):
        import re
        raw_hits = re.findall(r"Managed · (\d+\.\d+\.\d+)", CONTROL + DOCS)
        self.assertEqual(raw_hits, [], "raw HTML must not contain unicode Managed ·")
        fail, _ = run()
        self.assertEqual(fail, [], "unescape path must still see both mocks")

    def test_every_docs_current_claim_is_enforced(self):
        mutations = [
            ('<span class="sb-ver">6.8.437</span>', '<span class="sb-ver">6.8.999</span>', "sidebar app"),
            ('App <b>6.8.437</b> · build 437', 'App <b>6.8.999</b> · build 437', "hero App version"),
            ('App <b>6.8.437</b> · build 437', 'App <b>6.8.437</b> · build 999', "hero App build"),
            ('<span class="chip">Server <b>6.40.2</b></span>', '<span class="chip">Server <b>6.40.9</b></span>', "hero Server"),
            ('<span class="chip">Control <b>0.5.86</b></span>', '<span class="chip">Control <b>0.5.99</b></span>', "hero Control"),
            ('<span class="dim">6.8.437</span>', '<span class="dim">6.8.999</span>', "G2 HUD"),
            ('<div class="pf-app"><b>COS GLASSES</b><i>v6.8.437', '<div class="pf-app"><b>COS GLASSES</b><i>v6.8.999', "phone companion"),
            ('Latest release package: Control 0.5.86, glasses 6.8.437', 'Latest release package: Control 0.5.99, glasses 6.8.437', "Latest release Control"),
            ('Latest release package: Control 0.5.86, glasses 6.8.437', 'Latest release package: Control 0.5.86, glasses 6.8.999', "Latest release glasses"),
            ('COS Control 0.5.86 is the public Mac download', 'COS Control 0.5.99 is the public Mac download', "public Mac download"),
            ('COS Glasses 6.8.437 is the current companion pack', 'COS Glasses 6.8.999 is the current companion pack', "companion pack"),
            ('current behavior. Even Hub still lists 6.8.353. Server identity', 'current behavior. Even Hub still lists 6.8.999. Server identity', "Latest-release Hub pin"),
            ('Server identity is 6.40.2', 'Server identity is 6.40.9', "Server identity"),
            ('glasses 6.8.437 plus server 6.40.2 is the current companion pair', 'glasses 6.8.999 plus server 6.40.2 is the current companion pair', "companion-pair glasses"),
            ('glasses 6.8.437 plus server 6.40.2 is the current companion pair', 'glasses 6.8.437 plus server 6.40.9 is the current companion pair', "companion-pair server"),
            ('current companion pair; Even Hub still lists 6.8.353', 'current companion pair; Even Hub still lists 6.8.999', "companion-pair Hub pin"),
            ('Current supported versions are COS Control <strong>0.5.86</strong>', 'Current supported versions are COS Control <strong>0.5.99</strong>', "supported-versions Control"),
            ('server <strong>6.40.2</strong>, and COS Glasses', 'server <strong>6.40.9</strong>, and COS Glasses', "supported-versions server"),
            ('COS Glasses <strong>6.8.353</strong> from Even Hub', 'COS Glasses <strong>6.8.999</strong> from Even Hub', "supported-versions Even Hub"),
            ('Sideload <strong>6.8.437</strong>', 'Sideload <strong>6.8.999</strong>', "Updating sideload"),
            ('newest companion build; Even Hub still lists 6.8.353', 'newest companion build; Even Hub still lists 6.8.999', "Updating Hub pin"),
            ('package-level rollback is COS Glasses <strong>6.8.353</strong>', 'package-level rollback is COS Glasses <strong>6.8.999</strong>', "rollback glasses"),
            ('with the same server 6.40.2', 'with the same server 6.40.9', "rollback server"),
            ('Install COS Glasses <strong>6.8.353</strong> from Even Hub', 'Install COS Glasses <strong>6.8.999</strong> from Even Hub', "Even Hub remediation"),
            ('The current supported pair is COS Glasses 6.8.437', 'The current supported pair is COS Glasses 6.8.999', "FAQ current glasses"),
            ('(Even Hub still lists 6.8.353) and server', '(Even Hub still lists 6.8.999) and server', "FAQ Hub pin"),
            ('and server 6.40.2; COS Control', 'and server 6.40.9; COS Control', "FAQ server"),
            ('COS Control 0.5.86 is recommended', 'COS Control 0.5.99 is recommended', "FAQ Control"),
            ('grounded vs glasses 6.8.437', 'grounded vs glasses 6.8.999', "badge grounding glasses"),
            ('/ Control 0.5.86 / server', '/ Control 0.5.99 / server', "badge grounding Control"),
            ('/ server 6.40.2, 2026', '/ server 6.40.9, 2026', "badge grounding server"),
            ('server managed on 6.40.2', 'server managed on 6.40.9', "docs mock aria-label"),
        ]
        for old, new, label in mutations:
            with self.subTest(label=label):
                self.assertIn(old, DOCS)
                fail, _ = run(docs=DOCS.replace(old, new, 1))
                self.assertTrue(fail, f"{label} mutation stayed green")

    def test_covers_build_must_equal_app_patch_even_when_both_build_claims_agree(self):
        docs = DOCS.replace("(build 437, Hub pin", "(build 999, Hub pin", 1)
        docs = docs.replace("App <b>6.8.437</b> · build 437", "App <b>6.8.437</b> · build 999", 1)
        fail, _ = run(docs=docs)
        self.assertTrue(any("app build convention requires 437" in f for f in fail), fail)

    def test_every_control_current_claim_is_enforced(self):
        mutations = [
            ('"softwareVersion": "0.5.86"', '"softwareVersion": "0.5.99"', "JSON-LD softwareVersion"),
            ('"downloadUrl": "https://www.gotcos.com/downloads/COS-Control-macOS-arm64-0.5.86.zip"', '"downloadUrl": "https://www.gotcos.com/downloads/COS-Control-macOS-arm64-0.5.99.zip"', "JSON-LD downloadUrl"),
            ('href="/downloads/COS-Control-macOS-arm64-0.5.86.zip"', 'href="/downloads/COS-Control-macOS-arm64-0.5.99.zip"', "download href"),
            ('Download v0.5.86', 'Download v0.5.99', "Download label"),
            ('v0.5.86 &middot; macOS 14+', 'v0.5.99 &middot; macOS 14+', "byline"),
            ('shasum -a 256 COS-Control-macOS-arm64-0.5.86.zip', 'shasum -a 256 COS-Control-macOS-arm64-0.5.99.zip', "verify command"),
            (f'<p class="sha">SHA-256<br>{SHA}</p>', f'<p class="sha">SHA-256<br>{"bb" * 32}</p>', "verify SHA"),
            ('managed server healthy on 6.40.2', 'managed server healthy on 6.40.9', "control aria-label"),
        ]
        for old, new, label in mutations:
            with self.subTest(label=label):
                self.assertIn(old, CONTROL)
                fail, _ = run(control=CONTROL.replace(old, new, 1))
                self.assertTrue(fail, f"{label} mutation stayed green")

    def test_required_control_claims_cannot_be_deleted(self):
        without_download = CONTROL.replace(
            '<a href="/downloads/COS-Control-macOS-arm64-0.5.86.zip">Download v0.5.86</a>', ""
        )
        fail, _ = run(control=without_download)
        self.assertTrue(any("download hrefs are gone" in f for f in fail), fail)

        without_byline = CONTROL.replace('<p class="byline">v0.5.86 &middot; macOS 14+</p>', "")
        fail, _ = run(control=without_byline)
        self.assertTrue(any("version bylines are gone" in f for f in fail), fail)

    def test_duplicate_canonical_claims_fail(self):
        fail, _ = run(docs=DOCS + f"\n<!-- {COVERS} -->")
        self.assertTrue(any("Covers grounding line matched 2 times" in f for f in fail), fail)

        duplicate_mock = CONTROL + '\n<b>Managed &middot; 6.40.2</b>'
        fail, _ = run(control=duplicate_mock)
        self.assertTrue(any("control Managed mock" in f and "matched 2 times" in f for f in fail), fail)

        faq = (
            '<p>The current supported pair is COS Glasses 6.8.437 '
            '(Even Hub still lists 6.8.353) and server 6.40.2; '
            'COS Control 0.5.86 is recommended</p>'
        )
        fail, _ = run(docs=DOCS + faq)
        self.assertTrue(any("FAQ current supported pair matched 2 times" in f for f in fail), fail)

    def test_required_multifield_claim_cannot_be_deleted(self):
        latest = "Latest release package: Control 0.5.86, glasses 6.8.437"
        fail, _ = run(docs=DOCS.replace(latest, "Latest package"))
        self.assertTrue(any("Latest release package is gone" in f for f in fail), fail)

    def test_appcast_notes_pair_must_match_server_target(self):
        stable = dict(STABLE)
        stable["notes"] = "Pairs with server 6.40.0."
        fail, _ = run(stable=stable)
        self.assertTrue(any("appcast notes pair" in f for f in fail), fail)

    def test_required_artifact_alias_and_sidecars_are_enforced(self):
        cases = [
            ({"zip_missing": True, "zip_sha": None}, "staged zip is missing"),
            ({"latest_zip_missing": True, "latest_zip_sha": None}, "latest.zip is missing"),
            ({"latest_zip_sha": "bb" * 32}, "latest.zip does not match"),
            ({"versioned_sidecar": None}, "0.5.86.zip.sha256 is missing"),
            ({"latest_sidecar": None}, "latest.zip.sha256 is missing"),
            ({"versioned_sidecar": f'{"bb" * 32}  COS-Control-macOS-arm64-0.5.86.zip\n'}, "0.5.86.zip.sha256 hash"),
            ({"latest_sidecar": f'{SHA}  wrong-name.zip\n'}, "latest.zip.sha256 names"),
        ]
        for kwargs, expected in cases:
            with self.subTest(expected=expected):
                fail, _ = run(**kwargs)
                self.assertTrue(any(expected in f for f in fail), fail)


if __name__ == "__main__":
    unittest.main()
