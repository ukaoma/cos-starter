# COS Control 0.5.266 / build 319 publication receipt

Publication authorized by Miles on October 7, 2026. Supersedes the unpublished, frozen 0.5.265 candidate after release QA found two branding defects in its new meeting-task picker: an unthemed completed-task toggle and a top-aligned selection icon. Both are fixed in 0.5.266. No glasses packages are changed by this publication.

## Scope and source

- Native source: `0d92133`, branch `codex/0.5.261-notarized-onboarding` in `ukaoma/cos-control-macos`.
- Meetings and Speakers offer Link to existing task with cross-domain search, an optional completed-task filter, canonical meeting references, and revision-guarded writes. Prior task identity, content, status, and links are preserved. References and attached files join the next Work handoff; linking never messages a running session.
- Includes bundled Node/npm setup, responsive branded task editing, protected drafts, Cloud Puff for new users, existing pet preservation, and visible session-opening errors/queue hold reasons.
- Website navigation, home, Control, docs, and wizard make the Mac companion a primary starting point. Old instant-queue-delivery promises were corrected.

## QA evidence

- Native suite executed in consecutive segments. Initial run passed desktop safety, onboarding, resize, task editor, helper transports, full app compile, models, Cloud Puff, session-opening recovery, meeting linking, and pet contracts.
- Changelog headings and a stale assertion were corrected. The assertion now requires both the server-held and opening-in-progress button guards.
- Work tracking, card/meeting files, search, and Activity home checks passed before the branding defects were found. The corrected styling reruns the branding guard, alignment guard, meeting-link tests and remaining release suite.
- The 0.5.265 package's strict signature, staple, Gatekeeper acceptance, bundled-runtime retry/relocation, and actual server 6.65.0 installation without global Homebrew/Node/npm/npx passed. The 0.5.266 final package receives fresh signing and package validation; prior acceptance is not substituted for its own notarization.
- Local logs: `/tmp/control-265-native-suite.log`, `/tmp/control-265-native-resume.log`, `/tmp/control-265-native-resume2.log`, `/tmp/control-266-native-remaining2.log`, `/tmp/control-266-meeting-link.log`, `/tmp/control-266-public-build.log`.

## Remaining physical acceptance

Interactive first-open/privacy/provider/login and old-local-signer upgrade on a separate clean Mac are unverified. Isolated runtime/server tests are bounded integration evidence, not proof of those physical flows. The app is not installed on the user's Mac by this publication. Existing active-work/restart guards remain in place.

## Publication

Apple acceptance and anonymous public asset checksum verification passed. Website and stable appcast are promoted together; live Pages and packaged-updater checks follow deployment. Historical versioned packages are preserved; the 0.5.265 GitHub release remains a draft.

## Final package evidence

- ZIP size: 116,502,732 bytes. SHA-256: `83df0c0815aef295338c0d7899429833774686bfab3d73c4b40747c49afb9e47`.
- Apple submission `c1f244c5-18bb-4d63-ab80-1feddb0ba339`: Accepted. Staple and extracted archive validation passed; Gatekeeper accepted Notarized Developer ID, team NV3X46LLCR. Bundled-runtime tests passed on the new final package.
- Remaining native suite passed. Stale tests were updated for the persistent Activity window sheet, availability-aware queue copy, and the injected helper constructor; no runtime routes or protections were removed. Test-only follow-up source: `b565559`.

- Exact 0.5.266 archive passed isolated server 6.65.0 installation and authenticated loopback health with Homebrew/global tools blocked. Evidence: `/tmp/cos-clean-install-1y10xq5a`.
- GitHub Release published at 2026-10-07T19:28:54Z: https://github.com/ukaoma/cos-starter/releases/tag/control-v0.5.266. Both ZIP assets match the final archive; public HTTP verification follows before Pages promotion.

- Public HTTP checker passed for both versioned/latest ZIPs and their basename-correct sidecars. Website checker unit tests and 35 UI contract tests passed. No local-artifact override was used for the hosted verification.
