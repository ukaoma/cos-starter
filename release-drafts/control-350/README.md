# Locally applied release candidate: Control 0.5.350 / build 404 + server 6.92.0

Local application is complete; only the release owner may publish. The selected
release is **Usage and Windu only**.
Live speaker changes and the phone candidate remain separate follow-up work.
This draft requires no server publish. The release owner confirmed 6.92.0 as the current public server when authorizing
local application.
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
  the selected Control `Resources/WhatsNew.json` exactly. Final URL, SHA-256 and
  publication timestamp are filled; application prepended the section to
  unchanged appcast history and preserved its notice.
- `apply.py`: validates anchors by default. Local `--apply` requires final metadata
  and four matching ZIP/sidecar artifacts; it cannot publish or prove availability.

Local download links, JSON-LD, displayed SHA, appcast, release coverage and wizard
metadata now name 0.5.350/build404 + server6.92.0. Public site availability is not
established by these local changes.
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

## Application procedure (completed locally; publication remains separate)

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

Before application, `python3 release-drafts/control-350/check.py` verified exact
summary/scope, anchors, in-memory future drift, historical-body preservation and
synthetic artifact accept/refusal checks. Its old-appcast guard intentionally
refuses an already-applied tree. After application, use the normal version-drift,
Node, mutation and security gates against the final artifact directory.
These use no browser/native app. Public-byte and live publication verification
remain the release owner's gate; local tests do not establish those results.

Before application, the narrowed draft passed 27 anchor/render/scope/history/artifact-fixture checks,
46 drift fixtures and 43 tests across six Node site suites passed. Receipt:
`/tmp/site-control-350-usage-windu-checks.json` (18.447 seconds). Metadata summary
and350 section matched the selected Control What's New exactly. At that point,
appcast, homepage, main docs and wizard bytes were identical to the pinned baseline;
the pre-application appcast SHA-256 was
`6789ac10a92093cda4b7aa114957e318bc444d7f787a4eb904364ee068565d37`.
That preparation run did not read a real artifact or verify npm/public bytes/live
render. The later final local run below verifies the supplied real artifact set;
the release owner retains public-download/live-page checks. No native,
UI/CUA, publish or push occurred.


## Final local application

Fresh `origin/main` was unchanged at the pinned base before application. Root
reported final signing/notarization/package checks green and authorized this
local site application; this site lane does not repeat native qualification.
Both local ZIPs are 1,258,814,572 bytes, byte-identical, with exact matching
sidecars. Final SHA-256:
`aaca599809b5acc950a0d2ba8e9f334a28d8f7f9d3f1f48fe6a38b82c4953cf9`.
Versioned URL:
`https://github.com/ukaoma/cos-starter/releases/download/control-v0.5.350/COS-Control-macOS-arm64-0.5.350.zip`.
Preparation/publication timestamp: `2026-10-26T18:59:24Z`.

The selected Control What's New summary and350 section are exact matches.
Historical349/348/345 HTML bodies, appcast historical sections and publisher
notice are preserved. No placeholders or server6.92.1 claims remain on the
applied pages. Glasses and marketplace pins stay unchanged. No push, publish,
native, UI/CUA or model invocation occurs in this site lane. Parent verifies
actual public bytes and live Pages after its publication step.


Final normal gates passed in `/tmp/site-control-350-final-checks.json`:
46 version-drift fixtures,43 Node tests across six suites,all12 in-memory fault
mutations caught,Kokoro Python guidance,registry credential allowlist and full
version drift against `/Users/ukaoma/cos-release-candidates/control-0.5.350/public`.
The normal drift check also agreed with npm server6.92.0. Total scheduler runtime
194.631seconds; exit0. HTML parser stacks matched baseline; exact historical
bodies and appcast history/notice preservation checks passed. Sitemap generation
reported21 indexable URLs and made no byte change. A second fresh origin fetch
still matched the pinned base before commit. No public-byte or live-render result
is inferred from the local-artifact checker.
