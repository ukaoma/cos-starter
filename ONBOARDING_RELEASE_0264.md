# Prepared release: Control 0.5.264 / build 317

Not published. This branch prepares the Mac-first website and candidate appcast. Download URLs are reserved, not uploaded. Do not merge to main until clean-Mac first launch and the interactive upgrade from the old local signer pass, then host and verify the artifacts. Replace the appcast's placeholder `publishedAt` with the actual publication time.

## Frozen Mac candidate

- Source: `a6acd99`, branch `codex/0.5.261-notarized-onboarding` in the `ctl-0.5.259` worktree.
- ZIP: `COS-Control-macOS-arm64-0.5.264.zip`, 116,375,659 bytes.
- SHA-256: `3bf9693fd41e6ec560c43ad7ab89d95cfc4927c39395f7178ef10e6052a6e4ee`.
- Apple submission: `fe47b9cb-13b1-454f-bc74-32ec65580e86`, Accepted.
- Ticket stapled and validated. App extracted from the final ZIP accepted by Gatekeeper as Notarized Developer ID, Miles Ukaoma (NV3X46LLCR).
- Versioned and latest ZIPs are byte-identical, with matching basename-correct SHA sidecars.
- Retains 0.5.263's bundled runtime, task editing fixes and Cloud Puff default; preserves existing pet choices.

## Changes

Mac companion is a top-level navigation destination across the shared marketing nav, docs and wizard. The Control page leads with a first useful task, download and installation steps; advanced features and troubleshooting follow. The wizard starts with the Mac app and signed-in provider. Voice, glasses and manual terminal setup are optional.

Open in platform now shows opening status and actionable failures inside Sessions, instead of leaving feedback only on the pet. Queue rows display recorded hold reasons. Six isolated recovery tests cover running, archived, missing transcript, missing Desktop, incomplete identifier and helper failure.

Glasses 6.10.612 (`d89f0cc`) is a separate unpublished candidate. It replaces generic fork advice with reason-specific refresh, retry, queue or original-app guidance. It does not change ownership, delivery-fence or queue eligibility rules. Do not advertise 612 as a public release or replace the Hub alias without its release gate.

## Verification

- Final ZIP: desktop-safety, resize-performance, bundled-runtime Finder PATH/retry/relocation, signing, notarization, staple and extracted Gatekeeper gates passed.
- Fresh home/cache, minimal PATH, sandbox-denied Homebrew/global tool locations: bundled Node/npm installed published server 6.65.0, then the managed server started and answered authenticated loopback health. Only the disposable test server was stopped afterward.
- Server continuation/queue tests: 442 passed. Glasses full suite: 6,427 passed, 9 skipped; typecheck, SDK gate and package build passed.
- Website: 39 checker unit tests, 39 browser/demo tests and final local artifact/version/hash checks passed. Desktop and 390px mobile renders reviewed; nav and download steps are visible without horizontal overflow.

Evidence and the installation/Chris reproduction plan are in `MU-Chief-Staff/operations/personal/wk41_2026/onboarding_session_recovery/`.

## Outstanding gates

The sandbox test does not prove launchd at login, provider authentication, first-open Gatekeeper UI, privacy permissions or a real old-signer upgrade. These require interactive installation testing before publication.

Chris's screenshot does not identify the server refusal reason or his installed versions. UI recovery defects are fixed, but the specific stalled queue is not confirmed resolved. Validate same-session send, ordered exactly-once queue drain and platform opening on his configuration. No server behavior was changed in this candidate.

Use the publication sequence from ONBOARDING_RELEASE_0261.md with version 0.5.264 and tag control-v0.5.264. Preserve every older frozen archive. Verify hosted versioned/latest bytes and sidecars with the checker without `--artifact-dir`, then publish Pages and verify live URLs. This receipt does not authorize bypassing a missing gate.
