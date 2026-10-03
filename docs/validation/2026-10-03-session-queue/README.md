# Session queue release documentation

Glasses 6.10.577 / server 6.61.6. Control 0.5.252 binary and marketplace pin 6.9.538 are unchanged.

- Updated current version claims, server target, queue instructions, and the Sessions animation. Queue is the third footer-menu row, between Home and Continue. The animation now shows six choices and retains the reader body while highlighting them.
- Native Codex waiting messages remain visible after COS hands them off. Plain messages edit in place; unknown counts and failed reads never imply empty. Attachment-bearing native messages stay in Codex.
- Historical introduction versions are preserved. The older Control editor's cancel-and-park behavior is still described separately; this release does not retrofit that binary.
- Homepage pane set, wizard setup, downloads, registry, and hosted app: unchanged because this release changes the glasses Sessions queue contract, not provisioning, pane count, binaries or tenant behavior. Appcast server target now pairs the existing Control with the backward-compatible server update.
- Validation: 419 checks against app source formatters, 35 rendered interaction/sync tests, 37 version fixtures, and all 12 lesson mutation probes pass. Source-contract checks now derive the menu from the app's action definitions instead of duplicating the labels.
- Physical G2 testing remains separate. Publication and live-byte receipts are recorded in the app release ledger.

Browser preview: selected Highlight Queue in the rendered lesson and verified Queue at 3/6, the preserved session body, the six-item intro, and the screenshot at standard desktop size. This is illustrative HUD verification, not device acceptance.
