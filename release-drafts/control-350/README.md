# Draft only: Control 0.5.350 / build 404 + existing server 6.92.0

Do not publish this branch yet. The selected release is **Usage and Windu only**.
Live speaker changes and the phone candidate remain separate follow-up work.
This draft requires no server publish. The release owner will independently verify
that 6.92.0 remains the current public server before applying final metadata.
Base site: `origin/main` at `1ae2d5a0a957ec465ce31205596ee656128347b3`.

## Prepared surfaces

- `control/index.html`: Usage 7/30/90-day calendar windows and inclusive custom
  dates; provider/model lines or stacked bars and detailed breakdowns; Windu
  one-session cadence and failed-load retry. Existing Speakers copy is preserved.
- `control/docs/index.html`: the same Usage paths, truthful pricing/coverage
  limitations and the bounded Windu retry behavior. No new live-voice section.
- `llms.txt`: the Sessions Usage feature summary. Its stale current 0.5.345
  sentence changes only in the final patch; historical introduction facts stay.
- `patches.json`: 27 reviewed unique anchors for final Control/docs/wizard/llms
  metadata and release notes. Server mocks, compatibility and rollback stay at
  6.92.0. Historical 349/348/345 bodies and older since-facts stay intact.
- `metadata.json`: 350/404 paired with 6.92.0. Summary and the new section mirror
  the selected Control `Resources/WhatsNew.json` exactly. **URL, SHA-256 and
  publishedAt remain null**. Applying prepends the section to unchanged appcast
  history; no notice is removed.
- `apply.py`: validates anchors by default. Local `--apply` requires final metadata
  and four matching ZIP/sidecar artifacts; it cannot publish or prove availability.

Current download links, JSON-LD, displayed SHA, appcast, release coverage and
wizard metadata remain 0.5.349/build403 + server6.92.0 until final application.
Glasses6.10.654/build654, Even Hub pin6.10.653, marketplace/history facts and the
website's existing pet art are unchanged. A branch edit is not a shipped claim.

## Grounding and limits

Usage source: `Sources/SessionUsageCore.swift` and `Sources/SessionUsageView.swift`
in `/Users/ukaoma/cos-worktrees/ctl-350-recording-usage`; its
`docs/usage-refinement-20261026.md` records the source contracts and validation.
Calendar windows include today in the reporting timezone; custom endpoints are
inclusive. No rolling24h, subscription balance, distinct-session count or billing
claim is added. Unknown cost/coverage remain visible.

`docs/qa/windu-motion-350.md` grounds matching Session1 run cadence, shorter
raised-saber hold and retry eligibility five seconds after an async load failure
on a later refresh. Healthy art is retained. The reported repeated lineup was not
reproduced; retry evidence does not establish its historical cause. Actual-app
acceptance remains the release owner's gate. No new speaker/ASR/training behavior
is advertised in this release; existing display-only safeguards are not new engine
capability claims. The eight Activity views remain the same.

## Final artifact fields and release-owner steps

1. Finish selected Control QA, signing/notarization/stapling/Gatekeeper and actual
   app gates. Confirm 0.5.350/build404 from the final app and public server6.92.0.
2. Fill final versioned HTTPS `url`, stapled ZIP `sha256`, and timezone-qualified
   `publishedAt`; leave the reviewed pair unchanged.
3. Provide `COS-Control-macOS-arm64-0.5.350.zip`, its `.sha256`, the byte-identical
   `COS-Control-macOS-arm64-latest.zip` and its correctly named `.sha256`.
4. Run `python3 release-drafts/control-350/apply.py --check`, then after artifact
   gates run `--apply --artifact-dir /absolute/final-artifact-directory`. Changed
   appcast bytes require reconciliation so history and notice stay intact.
5. Run full drift with final local artifacts, then after separately authorized
   publication verify public HTTPS ZIP/sidecar bytes and live pages with cache
   busting. This draft neither performs nor waives those gates.

## Bounded draft checks

Run `python3 release-drafts/control-350/check.py` for exact summary/scope, anchors,
in-memory future drift, historical-body preservation and synthetic artifact
accept/refusal checks. Also run the version-drift fixtures and six Node site suites.
These use no browser/native app. Current appcast remains unchanged. Public-byte
checks, signing, actual-app acceptance and live publication are still outstanding.

Verified this narrowed draft: 27 anchor/render/scope/history/artifact-fixture checks,
46 drift fixtures and 43 tests across six Node site suites passed. Receipt:
`/tmp/site-control-350-usage-windu-checks.json` (18.447 seconds). Metadata summary
and 350 section match the selected Control What's New exactly. Current appcast,
homepage, main docs and wizard bytes remain identical to the pinned baseline;
appcast SHA-256 is
`6789ac10a92093cda4b7aa114957e318bc444d7f787a4eb904364ee068565d37`.
No real artifact, public-byte, live-render or npm verification was run by this
site preparation lane; the release owner owns those final checks. No native,
UI/CUA, publish or push occurred.
