# gotcos.com for COS Control 0.5.353 (build 407)

Local branch `claude/site-0.5.353`, based on origin/main 1b8e841. Not pushed. The live appcast `channels.stable`
(0.5.352, build 406, its url, sha256, publishedAt, notes, whatsNew) is byte-for-byte unchanged.

**Source of truth:** cos-control-macos worktree `ctl-review-352`, branch `claude/control-352-review`, commit **90ee4de**
(built on the shipped 0.5.352, 9f5ca05). `Resources/WhatsNew.json` supplies the summary and the 0.5.353 items, copied
word for word into the appcast. `CHANGELOG.md` and `docs/session-usage.md` there supplied the UI names used in the copy.
Server: `serverTarget` 6.94.2 (current npm latest). Minimum pairing stays "Pairs with COS server 6.93.0", as in 0.5.352.
Glasses, Hub pin and companion pack claims are untouched.

## What changed, per file

| File | Change |
|---|---|
| `control/appcast.json` | New top-level `nextStable` after `channels`: version 0.5.353, build 407, url `.../control-v0.5.353/COS-Control-macOS-arm64-0.5.353.zip`, sha256 `__SHA256__`, minMacOS 14.0, serverTarget 6.94.2, publishedAt `__PUBLISHED_AT__`, one-line `notes` ending "Pairs with COS server 6.93.0.", `whatsNew.summary` and the 0.5.353 section verbatim from WhatsNew.json. The Control helper reads only `channels.stable`, so `nextStable` is inert until promoted. |
| `release-drafts/control-353/promote_appcast.py` | Copy of the 0.5.352 script, `VERSION = "0.5.353"`, docstring and example date updated. Every rule kept (hex check, ISO check, url suffix check, optional `--zip` hash check, one `__SHA256__` on /control, no placeholder left, 0.5.353 section on top of stable's sections, `nextStable` deleted). |
| `control/index.html` | JSON-LD version and downloadUrl, four download hrefs, "Download v0.5.353" label, both bylines, verify command filename, displayed SHA (now `__SHA256__` once), New-in byline rewritten, Usage paragraph on the Sessions pane. |
| `control/docs/index.html` | Covers comment, grounded-in range, JSON-LD, sidebar version, hero chip with build 407, What's new list (0.5.353 on top, 0.5.349 line dropped to keep four), Usage section (series, buckets, new "Slice, compare and copy" paragraph), loading-outline paragraph, new `#release-353` note above 0.5.352. |
| `docs/index.html` | Covers comment, Control chip, What's new (Mac app 0.5.353 on top, Mac app 0.5.338 line dropped; its note stays in Release notes), Latest release package (two mentions), Current supported versions, recommended-on-Apple-silicon line, badge comment (also dated 2026-10-29), new `#release-353` details above `#release-352`. |
| `wizard/index.html` | Download link only. |
| `llms.txt` | "Public COS Control is 0.5.353", a short 0.5.353 sentence ahead of the 0.5.352 sentence, and the Sessions Usage sentence. |

Not edited because they carry no 0.5.352 claim: `assets/docs-control.js`, `challenge/index.html`, `index.html`
(homepage `#control` carries no version by design). The 0.5.352 commits touched the first two only for setting labels.
The latest alias: 0.5.352 left no site link to a `-latest.zip`; the checker reads `COS-Control-macOS-arm64-latest.zip`
and its `.sha256` from the same `control-v<version>` release, so the release must carry all four files.

## Current claims replaced (each by a unique anchor, count asserted to be 1)

control/index.html
- `"softwareVersion": "0.5.352",`
- `"downloadUrl": ".../control-v0.5.352/...0.5.352.zip",`
- Hero download href (anchored with the following `href="#install"`), Install section href (anchored with `href="/control/docs/"`), href `<p><a class="btn primary" href=...>Download for Mac</a></p>`, `Download v0.5.352` button
- `<p class="byline">New in 0.5.352: ...` (rewritten), `<p class="byline">v0.5.352 &middot; macOS 14+ &middot; Apple Silicon<br>`, `<p class="byline">v0.5.352 &middot; ... &middot; open source</p>`
- `<code>shasum -a 256 COS-Control-macOS-arm64-0.5.352.zip</code>`
- `<p class="sha">SHA-256<br>450e52f5...a298</p>` to `__SHA256__`
- Usage paragraph sentence "Choose 7, 30 or 90 calendar days ... Monthly buckets follow ..."

control/docs/index.html
- `Covers COS Control 0.5.352 (build 406) ...`, `0.5.317 to 0.5.352 app source`, `"softwareVersion": "0.5.352",`, `<span class="sb-ver">Control 0.5.352</span>`, `Control <b>0.5.352</b> · build 406`
- Usage: "Switch between provider and model series ... daily and monthly buckets ... Boundary months", the loading paragraph sentence "a Meeting Ask answer draws its outline in the line where it will appear ... nothing changes size"

docs/index.html
- `... · COS Control 0.5.352.` (Covers), `Control <b>0.5.352</b>` chip, `Latest release package: Control 0.5.352 ...` and `COS Control 0.5.352 is the public Mac download`, `COS Control <strong>0.5.352</strong>` (supported versions), `COS Control 0.5.352 is recommended on Apple silicon`, badge comment `Control 0.5.352 / server 6.94.2, 2026-10-28`

wizard/index.html: the Download COS Control href.

llms.txt: `Public COS Control is 0.5.352, ...`.

The Managed mock row (`Managed &middot;` / `Managed &#183;`) carries the server version, not Control, so it was not touched (server stays 6.94.2).

## Copy changes beyond version strings

- **Usage (control/index.html, control/docs):** days, weeks or months; tokens, API value or records; provider, model or token-category series; daily average, peak day and comparison with the period before over the same dates; click the peak day, a bar or a table row to inspect or filter; sortable Models and Daily tables; Copy CSV and Copy JSON of the active slice. control/docs gets a new "Slice, compare and copy (Control 0.5.353)" paragraph that also says Categories is not offered with Records (from `docs/session-usage.md`).
- **Loading outlines (control/docs "Since 0.5.343" paragraph):** the 0.5.343 fact stays. The old claim "a Meeting Ask answer draws its outline in the line where it will appear ... nothing changes size" was incomplete after 0.5.353, so it now says that since 0.5.353 the outline takes the size of what replaces it, Sessions and Tasks keep their numbers row in place with dashes, and a question asked in a meeting shows a Working line and an answer-sized block.
- **What's new / release notes:** 0.5.353 added to control/docs (hero list and `#release-353` note) and /docs (Mac app list and `#release-353` details) in the existing styles; llms.txt gets one sentence.

## Since-facts and history left alone (audit of every remaining `0.5.35x`)

All remaining mentions were printed with context and checked.
- 0.5.352 in control/docs: "Since 0.5.352, Settings opens in Activity...", "A setting renamed in 0.5.352...", "Since 0.5.352 this works on macOS 27.2", the What's new line, `#release-352` note. /docs: What's new line and `#release-352` details. llms.txt: the "0.5.352 sorts Settings..." sentence. All introduction facts.
- 0.5.351: "Update COS Control to 0.5.351 before the server", "Keep Control at 0.5.351 or newer first" (minimums), What's new lines and notes. 0.5.350 and 0.5.349 mentions inside the 0.5.351 note, the 0.5.350 note, What's new lines. All history.
- control/appcast.json: `channels.stable` 0.5.352 with its url and sha, its 0.5.352, 0.5.351 and 0.5.350 sections, and "Plus everything in 0.5.352" in the new summary. Stable stays 0.5.352 until promotion.
- 0.5.343 to 0.5.345 mentions in llms.txt and the 0.5.343 notes: history.
- `docs/previews/*/canary.js` matched `406` only as an obfuscated-code index; not a claim.

## Checks (2026-10-29, on this branch)

| Check | Result |
|---|---|
| `scripts/check-version-drift.py` | **13 failures, all expected before release.** Every one compares a page claim (0.5.353 / 407 / `__SHA256__`) with `channels.stable` (still 0.5.352 / 406): docs grounding line; control JSON-LD softwareVersion and downloadUrl; control download hrefs, "Download v" label, bylines, verify filename; control displayed verify-SHA is the placeholder; wizard download differs from appcast; control/docs Covers line, Control chip, sidebar version, JSON-LD. No npm failure (6.94.2 = npm latest). |
| `scripts/test_check_version_drift.py` | 47 of 48 pass. `test_live_guide_matches_the_live_appcast` fails for the same reason (guide says 0.5.353, live appcast 0.5.352). |
| Same two checks after a simulated release in a scratch copy (random fake ZIP, matching sidecars and latest alias, `promote_appcast.py`, `check-version-drift.py --artifact-dir`) | Checker passes ("candidate pages agree with local artifacts"), 48 of 48 tests pass. `stable` becomes 0.5.353 build 407 serverTarget 6.94.2 with sections 0.5.353, 0.5.352, 0.5.351, 0.5.350..., `nextStable` is gone, no `__` placeholder left in appcast or /control. |
| node tests (7 files, as CI) | 47 of 47 pass. |
| HTML balance, duplicate ids, in-page anchors (control, control/docs, docs, wizard) | 0 unclosed, 0 duplicates, 0 missing anchors; `#release-353` exists on both guides. |
| Em dashes, en dashes, arrows in added lines | 0. |
| `python3 -m json.tool control/appcast.json` | Valid. |

## Release steps

1. Build, sign, notarize 0.5.353 (build 407). Create GitHub release `control-v0.5.353` with the versioned ZIP, its `.sha256`, the `-latest.zip` alias and its `.sha256`; confirm the two ZIPs are byte-identical.
2. From this worktree root:
   ```
   python3 release-drafts/control-353/promote_appcast.py \
     --sha256 <sha256 of the notarized ZIP> \
     --published-at <ISO UTC, e.g. 2026-10-29T18:00:00Z> \
     --zip <path to COS-Control-macOS-arm64-0.5.353.zip>
   ```
3. Run `python3 scripts/check-version-drift.py` (it now fetches the hosted bytes), `python3 scripts/test_check_version_drift.py`, and the node tests. Expect all green.
4. Push needs Miles's go. Then verify live with `?cb=<timestamp>`: /control download href, SHA and byline; /control/docs chip and `#release-353`; /docs Covers line and `#release-353`; `/control/appcast.json` shows 0.5.353 build 407.
5. Hold rule: 0.5.353 must not be named on the live site until the release assets exist. This branch is a draft for that reason.
