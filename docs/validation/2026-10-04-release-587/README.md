# GotCOS release 587 documentation alignment

October 4, 2026. 587 is submitted for marketplace review per Miles, not approved. Separate 588 runtime repair is available for resubmission. The site retains that distinction.

## Coverage

- Homepage: shared Messages, Sessions, meeting and Home HUDs; looping native COS signals and pause control.
- Documentation: native provider identity; queue receipts and protected saved turns; scroll/history/Home actions; monochrome phone meeting and speaker review; offline limits; 18-state signal explorer.
- Setup wizard: four shared source-checked HUD examples and current review links.
- Control page: companion-review link, public Control stays 0.5.252/build 291.
- llms.txt: current capability and release-state descriptions.
- Historical changelog entries preserved. Public server remains 6.61.6. Marketplace last-confirmed listing is explicitly qualified, not claimed to be a fresh listing inspection.

## Evidence

440 source-contract checks passed against native formatters. 128 raster frames match the app source byte-for-byte. 39 website tests passed, including looping, terminal states, pause, visibility, reduced motion, renderer and gesture lessons. All 12 injected lesson/gesture faults were detected. 37 version-check fixtures passed; live artifact version drift, Kokoro Python and registry-secret contracts passed.

Browser review confirmed the homepage HUDs, status explorer, monochrome phone review and wizard layouts. The review caught and corrected a collapsed homepage HUD and inherited low-contrast phone labels. Responsive DOM geometry had no horizontal overflow at 487 CSS pixels. The browser's narrow-viewport screenshot returned blank, so phone-sized pixel fidelity is not claimed. Actual G2/iPhone optical and background acceptance remains a device gate.

The phone example uses fictional people and is explicitly an illustration. Audio/profile controls do not mutate real data. Green lens appearance is illustrative; signal raster bytes are native. No claim of fully durable audio across app relaunch, universal Messages/task retention, or standalone phone voice recording is made.

Publication and live hash verification are recorded in live-publication.json after deployment.
