# Prepared release: Control 0.5.263 / build 316

Not published. Do not merge this branch to main until clean-Mac onboarding and an interactive upgrade from the old local signer pass. The website and appcast now reserve the 0.5.263 asset URLs; those assets have not been uploaded.

## Candidate

- Cloud Puff is bundled for offline first launch. Existing pets, including an explicitly chosen COS robot, stay selected. Use Cloud Puff restores the default.
- Includes 0.5.261 onboarding and the 0.5.260 task-editor fixes.
- ZIP: `COS-Control-macOS-arm64-0.5.263.zip`; 116,363,437 bytes.
- SHA-256: `fbe92d34989ced8fb14b1fcb56e3bad5935523089b052c9897589852e89bcf64`.
- Apple submission: `71925e32-322a-4cfe-a88c-006893f6f6a6`, Accepted; stapled; extracted ZIP accepted by Gatekeeper as Notarized Developer ID.
- The bundled-runtime Finder-PATH/retry/relocation checks and desktop-safety/resize gates passed on this package.
- Cloud Puff's unmodified thumbnail, source URL, hash and upstream license notice ship in Resources/StarterPet. No separate artwork license is present in the catalog/package; attribution records that distinction.

## Pet verification

The native first-run fixture passed: exact bundled Cloud Puff on first load and reload, preservation of the selected robot, all four Jedi and custom artwork, explicit default restoration, and retry after missing bundled artwork. Light/dark rendering passed. ModelsContract passed; 39 website checker unit tests passed; local final-archive/version/hash checks passed.

## Publication

Use the publication order in ONBOARDING_RELEASE_0261.md with version 0.5.263 and tag control-v0.5.263. Preserve every older frozen archive. Upload the versioned ZIP, byte-identical latest alias, and both basename-correct SHA sidecars as GitHub Release assets. Set publishedAt to the actual publication time. Verify hosted bytes using scripts/check-version-drift.py without local overrides before publishing Pages. Local --artifact-dir checks do not prove public availability.

Clean-Mac first launch and interactive upgrade/privacy-permission checks remain outstanding. The 0.5.261 isolated managed-swap test is baseline evidence, not proof of a real user upgrade to this candidate. Nothing here installs the app, restarts the live server or publishes the site.
