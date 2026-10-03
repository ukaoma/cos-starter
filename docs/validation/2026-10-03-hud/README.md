# Public documentation and HUD audit, October 3, 2026

## Published coverage

The artifact receipt in `artifacts.json` pins server 6.61.5, the published EHPK 6.10.573, and public Control 0.5.252/build 291. The Control download was fetched from the live site and matched the appcast hash. The Hub shipping alias and versioned 573 package match byte for byte on origin/main. The marketplace version is the last confirmed listing, not a fresh store verification.

## Surfaces reviewed

- Docs: added Send landing, offline saved turns, away questions, protected reader position, history direction, speaker preview, merged review identity and revision guards. Updated rollback precautions, minimum Even app, current settings defaults and provider/privacy wording.
- HUD examples: current version and compact clock, no duplicated battery/session IDs in conversation footers, direct Send landing, six selectable state examples, brighter text and wider reading area. Native body/footers use the app's pure formatters. The old Tasks lesson is labeled legacy; public Work behavior is separate.
- Homepage: current chat-provider wording and a link to the HUD guide.
- Control: published server fixes distinguished from the unpublished task editor/cache/resize candidate. Seven visible views checked against the published release branch; Work replaces legacy Tasks.
- Wizard: Sonnet/Luna prerequisites distinguished from local transcription tiers.
- llms.txt: corresponding current behavior and publication boundaries.
- Appcast and downloads: verified, unchanged. No Control binary was released by this documentation change. Historical introduction versions were preserved.

## Validation

- 376 app-source HUD checks: native formatters, review/gesture paths, menus, current footers, seven-row live bodies, and no-JavaScript parity.
- 35 renderer/lesson/Control tests and 37 version-drift fixtures pass.
- All 12 injected lesson defects caught by the mutation gate.
- Four HTML pages balanced; appcast JSON valid; version-drift check agrees with registry and artifacts.
- All six HUD buttons exercised in the browser. Responsive DOM measurements at 390, 767 and 1440 CSS pixels show no document overflow or clipped current footer. Standard viewport render inspected visually. Browser viewport overrides produced blank screenshot captures, so those responsive checks are geometry checks, not mobile optical evidence.
- UI frames and timings remain illustrative. This is website verification, not physical G2 or phone lifecycle acceptance.

## Reproduce

From cos-starter:

```sh
python3 scripts/test_check_version_drift.py
python3 scripts/check-version-drift.py
node --test tests/ring-3d.test.cjs tests/docs-hud-paint.test.cjs tests/ring-sync.test.cjs tests/docs-control.test.cjs
node scripts/verify-docs-lesson-mutations.cjs
```

From the app release checkout, using its installed TypeScript loader:

```sh
node --import tsx ../cos-starter/scripts/verify-docs-hud.mjs "$PWD"
```

After fixture edits, regenerate static examples with `node scripts/sync-docs-hud-fallbacks.cjs`.
