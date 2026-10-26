# Control 0.5.351 (build 405) / server 6.93.0 site draft

Local draft. Never publish before the final signed ZIP, GitHub release assets and npm 6.93.0 exist.

## Placeholders to fill at release

- `__SHA351__` in `control/appcast.json` (`sha256`) and `control/index.html` (displayed SHA-256, one place).
- `__PUBLISHED351__` in `control/appcast.json` (`publishedAt`, ISO UTC like `2026-10-27T18:00:00Z`).
- The URL is already the standard asset path: `.../control-v0.5.351/COS-Control-macOS-arm64-0.5.351.zip`.

## Unverified sentences

Every sentence about a feature that was not yet merged when this draft was written carries
`<!-- verify-against-0.5.351 -->` (grep for it in `control/index.html`, `control/docs/index.html`,
`docs/index.html`, `llms.txt`). `control/appcast.json` cannot carry comments; its 0.5.351 items must
match `Resources/WhatsNew.json` in cos-control-macos at the release commit, word for word.
Verify each marked sentence against the merged app and server, edit or delete it, then remove the marker.
Branches behind the markers: quick save + Recover reconcile (`claude/control-351-quick-save`), capture stall
+ SIGTERM stop (`claude/control-351-capture-stall`), the companion Meeting microphone picker
(`claude/6.10.655-iphone-mic`, not part of the Control or server integration branches), and the default-on
`COS_MAC_VOICE_LABELS` sentence (Miles decides before npm latest).

## Expected failures until publication

`scripts/check-version-drift.py` fails on the public artifact 404 and on `serverTarget 6.93.0` vs npm latest 6.92.0.
With a fake candidate ZIP and a dummy SHA, those two npm lines were the only failures.
Do not name 6.93.0 anywhere else until `npm view @gotcos/glasses-server@latest version` says 6.93.0.

## Left alone on purpose (since-facts)

Older release notes (`release-345` to `release-350`), "The line needs server 6.92.0", "Server 6.92.0 keeps polish
steadier", and every historical 6.8.x and 6.9.x glasses version. Glasses stays 6.10.654 (Hub pin 6.10.653);
the 6.10.655 companion is mentioned only inside marked sentences.
