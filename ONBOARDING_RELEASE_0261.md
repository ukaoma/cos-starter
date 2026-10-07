# Prepared release: Control 0.5.261 / build 314

**Not published. Do not merge this branch to main until the two interactive gates below pass.** The public website still offers 0.5.252. This branch describes the integrated, notarized 0.5.261 candidate and reserves its future public release URLs.

The homepage hero and navigation lead to the Mac download and installation steps. Control, wizard, docs, llms.txt, and the public server skill distinguish bundled core setup from optional voice dependencies. Current download/version claims advance together; historical introductions remain unchanged.

## Verified candidate

- ZIP SHA-256: `506281b757b931ca2067d58d2c2a11fa54052dbe37c1eaad14ac5284e2d02c59` (116,351,085 bytes).
- Apple submission `f46bc87b-b11a-4f59-b8a6-86aac22b5dd0`: Accepted; ticket stapled; extracted ZIP passed Gatekeeper as Notarized Developer ID.
- Bundled runtime preparation/retry/relocation; real server 6.65.0 npm install and CLI help in an isolated home with bundled tools and no global tools in PATH.
- Old local-signed 0.5.260 copied into an isolated installation staged, swapped and completed 0.5.261; rollback copy retained; new signature, ticket and Gatekeeper passed. No installed app or live server changed by that canary.
- Onboarding states, task-editor regression, safety/resize gates; 39 website checker tests, 35 UI/demo contracts, balanced HTML, and local browser checks passed.

## Remaining gates

1. On an Apple silicon Mac without Homebrew/Node/npm/npx, download through a browser (quarantine intact), move to Applications, open, connect a signed-in provider, Get started, then Open Sessions. Confirm the server runs after relaunch and login. Test a lost connection and Try again. No terminal server install or quarantine removal should be needed.
2. Upgrade a real existing local-signed installation. Confirm the app relaunches, any macOS permissions can be granted normally, saved work/pairing survives, server ownership stays unchanged, and rollback works. The isolated swap test does not prove TCC/first-launch behavior.

## Publication order after those gates

1. Push the reviewed app source branch and record its commit. Do not overwrite accepted candidate bytes. Changed runtime code needs a new unused version/build and notarization.
2. Upload the verified versioned ZIP, its SHA sidecar, the byte-identical `COS-Control-macOS-arm64-latest.zip` alias and its basename-correct sidecar as assets of the public `ukaoma/cos-starter` release tag `control-v0.5.261`. These files exceed GitHub's regular-file limit; never add them to the website Git tree.
3. Set appcast `publishedAt` to the actual publication timestamp. Run `python3 scripts/check-version-drift.py` with no overrides; it downloads and hashes the public release assets and fails if missing/mismatched. `--artifact-dir` validates local candidates only and is not publication proof.
4. Merge/push the website changes to main only after asset verification succeeds. Verify Pages with cache-busted URLs and the served appcast/ZIP hash. Never publish this branch while the reserved download links return 404.
5. Existing `/downloads/...-latest.zip` is the historical GitHub Pages alias. New pages use the release asset alias. Preserve old versioned artifacts; assess stale external latest links explicitly before closure.

No npm, glasses EHPK, or marketplace change is part of this Control-only candidate. Server target remains 6.65.0.
