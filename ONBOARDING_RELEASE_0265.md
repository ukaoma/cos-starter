# Control 0.5.265 / build 318 publication receipt

Superseded before publication by 0.5.266 / build 319. Release QA found an unthemed completed-task toggle in the meeting-link picker. The 0.5.265 signed archive stays frozen; its GitHub release remains a draft and was never offered by the public appcast. See ONBOARDING_RELEASE_0266.md.

- Source: `a5373a2` in `/Users/ukaoma/cos-worktrees/ctl-0.5.259`.
- ZIP: `COS-Control-macOS-arm64-0.5.265.zip`, 116,502,046 bytes.
- SHA-256: `8b6feba4753d5e6544d435f4251498fa952cbce38bf11c37feda356a6d8d49e4`.
- Apple submission `a7fbf3f0-30a1-4b8b-a80c-f537dbb697b9`: Accepted, ticket stapled and validated, final extracted app accepted by Gatekeeper as Notarized Developer ID, Miles Ukaoma (NV3X46LLCR).
- Versioned and latest ZIPs match, with basename-correct SHA sidecars. Previous frozen archives are unchanged.

Meetings and Speakers now offer Link to existing task. The searchable picker reuses canonical meeting references and the revision-guarded task writer, preserving the task's identity, title, stage and previous links. The meeting reference and attached files become part of the next Work handoff. Linking does not copy the full transcript into the task or message a running session.

Native filtering, duplicate/stale guards, canonical write payload, refused writes and context-revision checks passed. Light/dark isolated renders passed with bundled brand fonts. Server Work board tests: 23 passed. Release desktop-safety, resize, packaged-runtime and signing gates passed. Local website artifact/version/hash validation passed. A fresh isolated installation of the exact 0.5.265 archive also passed: Homebrew/global Node/npm/npx blocked, bundled tools installed server 6.65.0 and the new server answered authenticated loopback health.

Glasses packaging is separate from this Control publication. The current alignment-only EHPK is 6.10.615, rebuilt from 6.10.611 with its assets preserved; 6.10.614 was withdrawn. This publication changes no glasses artifacts or aliases.

Clean-Mac first-open/provider/login/privacy testing and interactive old-signer upgrade remain outstanding. Chris's supplied report identifies Control 0.5.252 and server 6.45.2, with a blocked meeting save; his glasses version is absent. The tested late-response race is fixed, but confirmation on his device is still needed. Do not bypass his safeToRestart=false gate.

Evidence and acceptance plan: `MU-Chief-Staff/operations/personal/wk41_2026/meeting_task_link/`. Follow the publication order in ONBOARDING_RELEASE_0264.md using version/tag 0.5.265, and verify hosted bytes before Pages promotion.

## Publication verification

- Native source `a5373a2` pushed to `ukaoma/cos-control-macos`, branch `codex/0.5.261-notarized-onboarding`.
- Fresh extracted-archive verification: strict/deep signature valid, staple valid, Gatekeeper accepted Notarized Developer ID with team NV3X46LLCR. Apple submission remains Accepted.
- Fresh bundled-runtime retry/relocation and isolated server installation passed for the exact 265 archive.
- Website checker unit tests, UI contracts and local artifact/hash consistency passed.
- The old Pages-hosted latest ZIP remains a historical artifact because this bundled runtime exceeds GitHub regular-file limits. Current website and appcast links use the GitHub Release assets; versioned and latest release aliases are both verified before promotion.
- Physical first-open/privacy/login and interactive old-signer upgrade acceptance are still unverified; publication authorization does not convert them into passed tests.

- Native suite initially stopped on changelog heading format, then on an obsolete source assertion for the session-opening disable condition. Documentation and the assertion were corrected to retain both the server-held and duplicate-click guards; executable source and frozen ZIP bytes are unchanged. Passed portions are retained in `/tmp/control-265-native-suite.log` and `/tmp/control-265-native-resume.log`; remaining checks resume in `/tmp/control-265-native-resume2.log`.
