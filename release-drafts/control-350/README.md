# Draft only: Control 0.5.350 / build 404 + server 6.92.1

Do not publish this branch yet. It prepares the next release; it does not establish that its app or server artifacts are public. Base site: `origin/main` at `1ae2d5a0a957ec465ce31205596ee656128347b3`.

## Prepared surfaces

- `control/index.html`: Usage's 7/30/90-day calendar windows and inclusive custom dates, provider/model lines or stacked bars, provider/token/day breakdowns and limitations; anonymous Mac voice numbers and text-only renaming; native Windu one-session cadence and failed-load retry.
- `control/docs/index.html`: the same user paths with source/fallback details, the two-observation anonymous voice requirement, conservative finalization, no Mac profile training, pricing/coverage limitations and failed-load recovery boundary.
- `llms.txt`: the Sessions feature summary. Its old **current** `Public COS Control is 0.5.345` sentence is corrected only by the final metadata patch below. Historical 0.5.345 facts remain.
- `patches.json`: 35 reviewed unique anchors for the remaining Control/docs/wizard/llms current-version fields, current byline and release-note insertions. Every historical 349/348/345 release block and older minimum/since fact stays intact. The final release body is shared between the main docs and Mac guide.
- `metadata.json`: future stable appcast fields and the new What's New section. Applying prepends it to the unchanged historical sections from the pinned appcast. **URL, SHA-256 and publishedAt are null.** No notice is removed.
- `apply.py`: validates anchors without writing by default. `--apply` requires all final metadata and four matching local artifacts; this is local preparation only and cannot publish or verify public availability.

The existing current download, JSON-LD, displayed SHA, appcast, release coverage, managed mocks and wizard links still advertise 0.5.349 / build 403 + server 6.92.0. Do not treat that deliberately unchanged metadata as qualification of the new feature copy. Publish only after the release owner finalizes and validates the complete set.

## Source grounding

Frozen release sources reported by the release owner: Control `/Users/ukaoma/cos-worktrees/ctl-350-recording-usage` at `f9de801`, server `/Users/ukaoma/cos-worktrees/mac-speaker-labels-20261026` at `6414dcc`. Feature review began at Control `e52c32d6da6e98589d1b228ff8ddfe2e88533c2e` and server `a359fc8`; version/artifact verification remains a separate gate. The owner reports synthetic same-voice positive cases passed, while archived natural short audio stayed Ext. No claim promises that every speaker receives a number.

- `Sources/SessionUsageCore.swift:122` selects inclusive reporting-zone calendar dates; `Sources/SessionUsageView.swift:41` defaults to Last 30 days, `:142` supplies ranges, `:159` distinguishes them from rolling 24h, `:261` describes unknown-price omissions, `:289` explains absent balances/reset/environment/session counts. `docs/usage-refinement-20261026.md` records source contracts and bounded/offscreen validation.
- `server/lib/mac-live-voices.ts:33` requires separate raw chunks and audio hashes before confirmation, with conservative capture-local matching; `server/lib/nemotron-live.ts:186` requires sufficiently long/exclusive speech. `server/routes/transcribe-stream.ts:2551` owns Mac-only continuity; strict named recognition and no-training guards remain. `server/lib/nemotron-final.ts:1136` withholds contradictory crosswalks. `docs/meeting-speaker-policy.md` states these are not acoustic calibration guarantees.
- `Sources/LiveTranscript.swift:777` retains Voice N as distinct anonymous participant chips. `Sources/Models.swift:5869` describes Mac rename as text only, without enrollment/training.
- `docs/qa/windu-motion-350.md`: matching .48s Session 1 run bursts and shorter raised-saber hold; failed async load becomes eligible to retry after 5s on a later refresh; healthy art does not reload. The existing running app's reported repeated lineup was **not reproduced**. The recovery test demonstrates a plausible failure path, not its historical diagnosis; integrated actual-app repeat acceptance remains the release owner's gate.
- `Sources/ActivityWindow.swift:329` exposes eight Activity views (Work occupies the old Tasks slot). Homepage tiles, Control tabs and prose retain the same eight views. No pane was added for Usage.

Phone microphone candidate `4487b7db` is excluded. No phone meeting-microphone, native iOS, call capture, system-audio or voice-training feature is advertised here. Glasses companion 6.10.654/build 654, Even Hub pin 6.10.653 and all marketplace/history facts remain untouched. The website's existing pet artwork is not replaced or offered as evidence of native loader recovery.

## Final artifact fields and release-owner steps

1. Finish integrated Control/server release QA, signing/notarization/stapling/Gatekeeper checks and the actual-app gates. Confirm target versions 0.5.350/build 404 and 6.92.1 from the resulting artifacts; source labels alone are insufficient.
2. Fill `metadata.json` with the final versioned release `url`, final stapled ZIP `sha256`, and timezone-qualified `publishedAt`. Keep the reviewed tuple; reconcile this draft if it changes.
3. Supply a directory containing `COS-Control-macOS-arm64-0.5.350.zip`, its `.sha256`, `COS-Control-macOS-arm64-latest.zip`, and its `.sha256`. The aliases must have byte-identical ZIP contents. Each sidecar must name its own download filename exactly.
4. Review `python3 release-drafts/control-350/apply.py --check`. Once artifact gates pass, run `python3 release-drafts/control-350/apply.py --apply --artifact-dir /absolute/final-artifact-directory`. The script validates all anchors and artifact metadata before writing; changed appcast contents require reconciliation, preserving any newer notice/history. No network, Git push or publication occurs.
5. Re-run `python3 scripts/test_check_version_drift.py`, applicable Node site tests and HTML checks. Run the complete `scripts/check-version-drift.py --artifact-dir ...` against the final local set (npm must agree with the release state). After authorized artifact/site publication, run the normal public-byte drift checker and verify live pages with cache-busting URLs. Both public ZIP aliases and sidecars must pass HTTPS checks. This draft does not waive or replace those gates.

Any new release note must avoid promising acoustic accuracy, named recognition of every voice, Mac playback enrollment/training, fixed repeated-lineup behavior, rolling 24h/account billing/plan utilization or unsupported phone recording. Keep server 6.92.0/older introduction facts at their true historical versions.


## Bounded verification of this draft

- `scripts/test_check_version_drift.py`: 46 tests passed.
- Six Node site suites (`ring-3d`, `docs-hud-paint`, `ring-sync`, `docs-control`, `docs-signals`, `pet-cast`): 43 tests passed. These are source/fixture checks and do not open a browser or native app.
- All 35 final-patch anchors validate sequentially. In-memory future-page rendering passed the checker's current-claim, pane, wizard and Mac-guide consistency functions with synthetic metadata. This does not establish the future artifact's existence, signatures or public availability.
- Synthetic local artifact fixtures accepted matching ZIP/alias/sidecar bytes and rejected a wrong hash and a different alias. No real app archive was read, installed or launched.
- Historical 349/348/345 release bodies remain byte-identical in the future rendering. Draft and future HTML parser stacks match their baseline; JSON and whitespace checks passed. Current appcast stayed at 349/403 + server 6.92.0.
- No public-byte drift check, live render, publication, native compilation, UI/CUA or desktop input automation was performed. Real artifact/hash/signing/public HTTPS/live-page gates remain for the release owner.
