# gotcos.com for COS Control 0.5.352 (build 406)

Local branch `claude/site-0.5.352`, based on origin/main 7879f48. Not pushed. The live appcast `channels.stable`
(version, build, url, sha256, publishedAt, notes, whatsNew) is byte-for-byte unchanged.

**Source of truth for labels:** cos-control-macos `claude/control-settings-release` at **bed3d66**, the commit the
release builds from (lead, 2026-10-28). Labels and categories come from `Sources/SettingsHubCatalog.swift`, visible
button and row text from `Sources/Views.swift` and the other Sources, all read through `git show` (no worktree
touched). The first draft was built against 9d9d8b3; "Final strings check (bed3d66)" below records the re-check.

**What changed, in short:**
- Setting labels renamed to the 0.5.352 names, and "under Tools" / "Settings, Advanced" replaced with the new
  category names, on /control, /control/docs, /docs, /wizard, llms.txt, /challenge and the /docs Control exhibit script.
- /control/docs: a four-line What's new in the hero, a new Settings sub-section in chapter 3, a pet-drag bullet,
  and a 0.5.352 release note at the top of Release notes (body identical to the /docs note).
- /docs: a 0.5.352 note at the top of the Mac app group, and the What's new list swaps in 0.5.352 and drops the
  oldest Mac line (0.5.335, whose note stays in Release notes).
- Every current version claim says 0.5.352 / build 406. Download links point at
  `control-v0.5.352/COS-Control-macOS-arm64-0.5.352.zip`. The displayed SHA-256 on /control is `__SHA256__`.
- control/appcast.json: a new top-level `nextStable` object holds the drafted 0.5.352 entry (version 0.5.352,
  build 406, `__URL__`, `__SHA256__`, `__PUBLISHED_AT__`, serverTarget 6.93.0 like 0.5.351, notes, summary and a
  0.5.352 section). The Control helper reads only `channels.stable`, so `nextStable` is inert until promoted.
- `release-drafts/control-352/promote_appcast.py` does the promotion in one step (see release steps).

## Release steps (in order)

1. **Labels: done against bed3d66.** Only if the release ends up building from a commit other than bed3d66, run in
   cos-control-macos `git diff bed3d66 <release-sha> -- Sources` and repeat the final strings check for any changed
   user-facing literal.
2. **Version.** The release branch's Info.plist still says 0.5.351 / 405 at bed3d66; the lead bumps it at release
   time. The site is drafted for 0.5.352 / build 406, so nothing changes here unless the build number does.
3. **Lead: match the app's bundled notes.** `Resources/WhatsNew.json` in cos-control-macos is the lead's at
   version-bump time. Paste the "WhatsNew.json draft" section below; it is word for word the appcast `nextStable` text.
4. **Lead: the default-on list for Miles before promotion** (the lead has it from QA).
5. **After notarization and the GitHub release exist** (`control-v0.5.352` with `COS-Control-macOS-arm64-0.5.352.zip`,
   its `.sha256`, and the `latest` alias plus sidecar), run from the worktree root:
   ```
   python3 release-drafts/control-352/promote_appcast.py \
     --sha256 <sha256 of the notarized ZIP> \
     --published-at <ISO UTC, e.g. 2026-10-28T18:00:00Z> \
     --zip <path to COS-Control-macOS-arm64-0.5.352.zip>
   ```
   It switches exactly these: `channels.stable` becomes the `nextStable` object with url, sha256 and publishedAt
   filled (version 0.5.351 to 0.5.352, build 405 to 406, notes, whatsNew.summary), puts the 0.5.352 section on top of
   the existing sections, deletes `nextStable`, and replaces `__SHA256__` on /control. It refuses a malformed value,
   a ZIP whose hash differs, or any placeholder left behind. `--url` defaults to the standard asset path.
6. **Run the checks:** `python3 scripts/check-version-drift.py`, `python3 scripts/test_check_version_drift.py`, and
   the node tests (`node --test tests/ring-3d.test.cjs tests/docs-hud-paint.test.cjs tests/ring-sync.test.cjs
   tests/docs-control.test.cjs tests/docs-signals.test.cjs tests/pet-cast.test.cjs tests/unstuck-nav.test.cjs`).
   Expect only the two npm lines below unless the server pages move to 6.94.1.
7. **Commit and push** (needs Miles's go for the push). Note: in `~/Documents/GitHub/cos-starter`, `git fetch`
   currently fails with `fatal: bad object refs/heads/main 2` (iCloud ref copies `refs/heads/main 2`,
   `refs/remotes/origin/main 2`, `refs/stash 2`). The canonical `origin/main` resolved and matched the remote
   (7879f48), so this branch is correct, but fetch stays broken until those copies are removed.
8. Verify live: /control download, SHA and byline; /control/docs hero chip, What's new and #release-352;
   /docs Covers line and #release-352; the appcast served at /control/appcast.json; a phone-width look at the
   /control/docs What's new list (the headless check below could not go narrower than about 500 px).

## Check results (on this branch, 2026-10-28)

| Check | Result |
|---|---|
| `scripts/check-version-drift.py` (rerun after the bed3d66 fixes) | Fails, as expected before release. Two failures are pre-existing on origin/main: npm latest is 6.94.1 while the docs and appcast say server 6.93.0. The rest are "pages say 0.5.352, appcast says 0.5.351" and the `__SHA256__` placeholder. |
| Same check after a simulated release (scratch copy, fake ZIP and sidecars, `promote_appcast.py`, `--artifact-dir`), rerun after the bed3d66 fixes | Only the two pre-existing npm 6.94.1 failures remain. Every Control version, download, byline, SHA and sidecar claim agrees, and no placeholder is left in the appcast or /control. |
| `scripts/test_check_version_drift.py` | 45 of 46 pass. `test_live_guide_matches_the_live_appcast` fails only because the guide says 0.5.352 and the live appcast 0.5.351; all 46 pass in the promoted copy. |
| node tests (7 files, as CI) | 47 of 47 pass (same as origin/main). |
| `scripts/verify-docs-lesson-mutations.cjs` | All mutants caught. |
| Kokoro contract, registry secrets | Pass. |
| HTML balance, duplicate ids, in-page anchors (5 edited pages) | 0 errors, 0 duplicates, 0 missing anchors; /control links to `/control/docs/#release-352`, which exists. The balance check was mutation-tested (removing one `</ul>` is caught). |
| Em dashes and arrows in added page lines | 0. Two pre-existing ones on lines I touched were fixed (docs `Activity &rarr; Meetings`, docs `401 &mdash; copy`). |
| Render | Headless Chrome at 1280 px: the What's new block and chips render as intended. At narrow widths headless Chrome lays out at about 500 px for origin/main too, so phone width is unverified. |

## Deliberately skipped, and why

- **Historical release notes and dated entries:** /control/docs #release-notes, /docs #releases, /docs dated
  entries (lines 1190, 1194, 1195), and every existing appcast section. This covers the copy-pass rows that point
  inside notes (docs 2120 to 2147, control/docs 1272 to 1325: "Set in .env", "Spell words the way the text box has
  them", "Paste right away, then polish in place", "New Today home", and the dictation labels inside notes).
- **Setup guide path in /wizard:** wizard:680 ("Open Activity, Settings, Setup guide, then Local voice") is left; in
  the hub the Voice setup row sits in Transcription and voice. (The Welcome rows themselves now read Show AI sessions
  and Continue sessions in bed3d66, so control/docs:512 and :1037 were updated.)
- **Labels the lead said to keep:** Update Server, Repair Whisper, Create Folders, Answer with your own key, Allow
  pairing on this Wi-Fi. "Transcription" stays where it names the Transcription card (control/docs:1116, /control:698),
  the chapter, the category "Transcription and voice", the engine, and the panel status row "Transcription tier"
  (both panel mocks; bed3d66 Views.swift:1587 still reads "Transcription tier"); only the tier picker is "Quality tier". Also "Remove saved keys" (control/docs:1151): that row (KL-03) keeps its name;
  only the Jev key's "Remove saved key" became "Remove Jev key", and the site never names that one outside notes.
- **Server, glasses and phone features:** "Cursor CLI" and "agent CLIs" on /docs (983, 990, 1804, 1833, 1881, 1943,
  1947), wizard:610 and llms.txt:42 describe the server and companion; docs:1663 "Idle Metal HQ" is the server
  feature heading; docs:2053 "Adaptive replay" is the server health field; docs:1415 "Clear stranded video uploads"
  is the companion's Recovery Center; docs:1742 "Meeting preview" is the phone's.
- **Since-facts:** control/docs:938 and :948 ("Update COS Control to 0.5.351 before the server", "Keep Control at
  0.5.351 or newer") are minimum versions, not the current version.
- **Generic tool names:** control/docs:1130 "the Claude, Codex and Cursor CLIs" lists what Run checks tests.
- **Generic "Default":** removed as a Control literal (the decision-provider picker), but the four page hits
  (docs:1804, wizard:645, :719, :1152) are glasses and wizard words, not Control labels.
- **Tier pages that do not name the picker:** /control:941 ("Choose Balanced or Max") and docs:1144 ("Balanced or
  Max decides which Whisper model...") name the choices, not the picker, so they stay as written.
- **/control/docs release-notes format:** kept as expanded `section.note` blocks, the existing format. Collapsing them
  like /docs is a separate design change.

## Final strings check (bed3d66)

Method, all read-only through git in cos-control-macos:
1. Every Swift string literal in `Sources` at 82b12c8 (shipped 0.5.351) and at bed3d66 (final 0.5.352), comments
   excluded: 7,367 and 8,581 literals. 160 literals exist only at 82b12c8 (removed or reworded), 1,374 only at bed3d66.
2. Each removed literal, split at interpolations, searched in the current copy of /control, /control/docs, /docs,
   /wizard, llms.txt, the homepage, /challenge and the /docs Control exhibit script, outside historical release notes.
3. Every label inside `<strong>`, `<b>` or a mock row that my edits introduced (77 distinct) looked up in the bed3d66
   literals. All UI labels were found; the 19 misses are headings, version strings, the interpolated `Turbo · On`,
   note titles and the pre-existing "Restart Safely".
4. The catalog's 50 former labels (`SettingsHubCatalog.formerLabels`) searched in current copy, and the catalog's
   labels, groups and Advanced flags diffed 9d9d8b3 to bed3d66: no category moved; the only flag change is Clear stuck
   uploads leaving Advanced, which the site does not locate.
5. Confirmed in bed3d66: the pet-drag commits (f34bcb4, fb0e74c) and the hub (72d304d) are in, 2dbadec is not;
   `Use new Settings`, the hub rollback confirmation, the ⌘F search hint and "On this page" exist, so the drafted
   notes and the WhatsNew.json draft stay accurate unchanged.

Mismatches found and fixed (10 replacements, two round-one edits amended):

| Page | Was | Now (bed3d66 string) |
|---|---|---|
| control/docs:512 (Welcome rows) | Show your AI sessions, Continue agent threads | Show AI sessions, Continue sessions |
| control/docs:1037 | or use Show your AI sessions in the setup guide | Show AI sessions |
| control/docs:1087 | `<strong>Transcription</strong>`: Balanced or Max | `<strong>Quality tier</strong>` |
| control/docs (Unsaved, two places) | Unsaved captures; "A capture that never saved" | Unsaved recordings; "A recording that never saved" |
| control/docs (pet Accessibility, two places) | Grant | Allow (Views.swift:1334, same view in the hub) |
| control/docs (AI polish) | Wait for &#8984; or &#8963; to be released before swapping in polish | Wait for held keys, in Settings, Dictation |
| control/docs (server card) | Restart and Update Server are locked while... | are off while... (build: "Restart is off until they finish.") |
| control/docs:533 (Adopt, amended) | offers Adopt server for a stopped one | offers Adopt server, which replaces a stopped one with the latest COS server (build: "COS Control can replace this stopped older server with the latest COS server.") |
| /control:950 (Work folder, added) | Managed servers reload safely; older adopted servers show the selection as pending until a safe restart is available. | Changing it restarts the server when no work is running. If it is saved but not yet in use, the panel says so. (build help text and the "Saved. Restart the server when no work is running to use it." line) |
| docs:1145 (Control exhibit) | Fast meeting preview | Fast preview |

After the fixes the removed-literal sweep finds only the generic "Default" words above and docs:2053, the server's
`Adaptive replay` health field. Both are intended.

## WhatsNew.json draft

For `Resources/WhatsNew.json` in cos-control-macos (lead, at version-bump time). Generated from the appcast
`nextStable` entry on this branch, so the two match word for word. Set `version` to 0.5.352, replace `summary`, and put
the 0.5.352 section on top of the existing `sections` (keep 0.5.351 and everything below it, as the 0.5.351 file does).
If a fact changes after QA, change it here and in `control/appcast.json` `nextStable` together.

Summary (494 characters; the app caps it at 1200):

> Settings is now sorted into ten categories, with search and an On this page list. Many settings have shorter, clearer names, and search still finds them by their old names. Use classic Settings, in General, Advanced, brings back the old page. Roll back server asks first, and the session pet can be dragged again on macOS 27.2. Plus everything in 0.5.351: quick save for Mac recordings, stalled-capture restart, a Recover that checks the server, and speaker ID on by default for Mac recordings.

Items of the 0.5.352 section (7):

1. Settings opens in Activity with ten categories on the left: General, AI and accounts, Glasses and iPhone, Meetings, Dictation, Transcription and voice, Work and agents, Privacy and permissions, Pet and appearance, and System and updates.
2. Each category is a set of cards. The settings you rarely need sit under Advanced in each card. On this page lists the cards in the category and jumps to the one you pick.
3. Many settings have clearer, shorter names, for example Run checks for Run Doctor and Notes folder for COS Data. Search settings (Command-F) finds a setting by its new or its old name and says where it is. Your saved preferences do not change.
4. Command-comma, the Dock menu, the pet, the welcome window and links from other views open the new Settings at the right place.
5. To go back, turn on Use classic Settings in General, Advanced. The old one-page Settings returns, and each opener goes where it did before. Use new Settings, at the top of that page, switches back.
6. Roll back server, in System and updates, Advanced, now asks before it changes the server.
7. macOS 27.2 stopped the session pet from being dragged. COS Control now moves the pet itself, on every macOS version, and a pet dropped partly off a screen moves back inside it.

The same, as JSON to paste (only the 0.5.352 section is shown; the older sections stay as they are):

```json
{
  "version": "0.5.352",
  "whatsNew": {
    "summary": "Settings is now sorted into ten categories, with search and an On this page list. Many settings have shorter, clearer names, and search still finds them by their old names. Use classic Settings, in General, Advanced, brings back the old page. Roll back server asks first, and the session pet can be dragged again on macOS 27.2. Plus everything in 0.5.351: quick save for Mac recordings, stalled-capture restart, a Recover that checks the server, and speaker ID on by default for Mac recordings.",
    "sections": [
      {
        "title": "0.5.352",
        "items": [
          "Settings opens in Activity with ten categories on the left: General, AI and accounts, Glasses and iPhone, Meetings, Dictation, Transcription and voice, Work and agents, Privacy and permissions, Pet and appearance, and System and updates.",
          "Each category is a set of cards. The settings you rarely need sit under Advanced in each card. On this page lists the cards in the category and jumps to the one you pick.",
          "Many settings have clearer, shorter names, for example Run checks for Run Doctor and Notes folder for COS Data. Search settings (Command-F) finds a setting by its new or its old name and says where it is. Your saved preferences do not change.",
          "Command-comma, the Dock menu, the pet, the welcome window and links from other views open the new Settings at the right place.",
          "To go back, turn on Use classic Settings in General, Advanced. The old one-page Settings returns, and each opener goes where it did before. Use new Settings, at the top of that page, switches back.",
          "Roll back server, in System and updates, Advanced, now asks before it changes the server.",
          "macOS 27.2 stopped the session pet from being dragged. COS Control now moves the pet itself, on every macOS version, and a pet dropped partly off a screen moves back inside it."
        ]
      }
    ]
  }
}
```

## Left for the lead

1. **Tier picker: resolved, "Quality tier"** (lead, 2026-10-28, final build bed3d66). control/docs:1087 now reads
   `<strong>Quality tier</strong>: Balanced or Max`, in the list headed "These are in Settings, Transcription and
   voice". "Transcription" stays for the card, chapter, category, engine and the "Transcription tier" status row.
2. **2dbadec: resolved, not in 0.5.352** (lead, 2026-10-28). See "Held for 0.5.353" below.
3. **"Restart Safely"** in the /docs panel mock (docs:1075 and its aria-label) is not a label anywhere in the final
   source. Pre-existing, not on any edit list, left alone.
4. **Dictation menu routing:** control/docs:612 says the Dictation menu's Settings… "opens Activity, Dictation,
   Settings". Every Settings opener now lands in the hub, but I did not confirm where that menu item lands, so the
   sentence is unchanged.
5. **npm latest is 6.94.1** while every page and the appcast say server 6.93.0. That drift check already fails on
   origin/main; serverTarget stays 6.93.0 as asked.

## Held for 0.5.353 (not in this release)

`claude/control-352` 2dbadec (the Work suggestions re-check and Unstuck on a failed update download) is not in
0.5.352: its review fixes were never committed, so it is held for 0.5.353 (lead, 2026-10-28). No page, release note or
appcast text on this branch mentions it. Drafted lines for the 0.5.353 notes, unverified against that build:
- "The setup guide's Work suggestions row checks again when the server comes up, says which key is in use, and offers Add a key only when no key is saved."
- "If an update download fails or times out, the update banner and What's New offer Unstuck beside Try again."

## Edit counts

| File | Label and location edits | Version and release edits | New blocks |
|---|---|---|---|
| assets/docs-control.js | 1 | 0 | 0 |
| challenge/index.html | 1 | 0 | 0 |
| control/docs/index.html | 60 | 5 | 5 |
| control/index.html | 22 | 12 | 0 |
| docs/index.html | 22 | 8 | 1 |
| llms.txt | 2 | 1 | 0 |
| wizard/index.html | 18 | 1 | 0 |
| control/appcast.json | 0 | 1 (new top-level `nextStable`; `channels.stable` untouched) | 0 |
| release-drafts/control-352/promote_appcast.py | | new file | |
| **Total** | **126** | **28** | **6** |

## Every edit (path:line on origin/main 7879f48, old, new)

159 rows: 153 replacements and 6 inserts, both rounds (9d9d8b3 draft plus the bed3d66 fixes). Line numbers are the ORIGINAL line on origin/main, so they match the QA table. Replacements quote the exact text matched; each was asserted to occur the stated number of times before anything was written. Inserts go immediately before the line given.

### control/docs/index.html

| Line | Old | New |
|---|---|---|
| control/docs/index.html:40 | `Covers COS Control 0.5.351 (build 405) · server @gotcos/glasses-server 6.93.0.` | `Covers COS Control 0.5.352 (build 406) · server @gotcos/glasses-server 6.93.0.` |
| control/docs/index.html:41 | `grounded in the 0.5.317 to 0.5.351 app source` | `grounded in the 0.5.317 to 0.5.352 app source` |
| control/docs/index.html:64 | `"softwareVersion": "0.5.351",` | `"softwareVersion": "0.5.352",` |
| control/docs/index.html:192 | (insert) | What's new CSS, copied from /docs. Text: `/* What's new in the hero: the /docs pattern, four lines that link to their notes */ ⏎ .whatsnew{margin-top:26px;border-left:2px solid var(--gold);padding:2px 0 2px 18px;max-width:62ch} ⏎ .whatsnew h2{font-family:var(--body);font-size:1rem;font-weight:600;letter-s…` |
| control/docs/index.html:423 | `<span class="sb-ver">Control 0.5.351</span>` | `<span class="sb-ver">Control 0.5.352</span>` |
| control/docs/index.html:452 | `<span class="chip">Control <b>0.5.351</b> · build 405</span>` | `<span class="chip">Control <b>0.5.352</b> · build 406</span>` |
| control/docs/index.html:457 | (insert) | What's new block in the hero (four lines), linking to the notes. Text: `  <div class="whatsnew" aria-labelledby="wn-h"> ⏎     <h2 id="wn-h">What&rsquo;s new</h2> ⏎     <ul class="wn-list"> ⏎       <li><a href="#release-352"><b>0.5.352</b><span>Settings in categories with search and an On this page list, shorter labels, and pet dragging …` |
| control/docs/index.html:474 | `health, Doctor and tools.</span></a>` | `health, checks and repair.</span></a>` |
| control/docs/index.html:512 | `<li><strong>Settings for your AI</strong>: Show your AI sessions, Continue agent threads, Jev (TypeSafe) and Permissions.</li>` | `<li><strong>Settings for your AI</strong>: Show AI sessions, Continue sessions, Jev (TypeSafe) and Permissions.</li>` |
| control/docs/index.html:533 | `the panel offers <strong>Adopt Safely</strong>: <strong>Manage in place</strong> keeps your server, and <strong>Install managed server</strong> replaces it.` | `the panel offers <strong>Adopt server</strong>, which replaces a stopped one with the latest COS server. For a running one, <strong>Manage in place</strong> keeps it and <strong>Replace server</strong> replaces it.` |
| control/docs/index.html:548 | `or <strong>Allow insertion into other apps…</strong> under dictation.` | `or <strong>Allow typing in apps…</strong> under dictation.` |
| control/docs/index.html:554 | `The switch is <strong>Launch COS Control at login</strong> in Settings.` | `The switch is <strong>Open at login</strong> in Settings, General.` |
| control/docs/index.html:568 | `In COS Control: <strong>Settings, Session pet, Reset and add again</strong>` | `In COS Control: <strong>Settings, Pet and appearance, Reset and add again</strong>` |
| control/docs/index.html:600 | `<strong>Update Server</strong> or <strong>Install Server</strong>.` | `<strong>Update Server</strong> or <strong>Install server</strong>.` |
| control/docs/index.html:607 | (insert) | new Settings sub-section in chapter 3. Text: `  <div class="sub" id="settings"> ⏎     <h3>Settings</h3> ⏎     <p>Since 0.5.352, Settings opens in Activity with ten categories on the left: General; AI and accounts; Glasses and iPhone; Meetings; Dictation; Transcription and voice; Work and agents; Privacy and p…` |
| control/docs/index.html:613 | `Turn on <strong>Show in menu bar only</strong> in Settings.` | `Turn on <strong>Menu bar only</strong> in Settings, General.` |
| control/docs/index.html:614 | `<li><strong>Open Activity with</strong> in Settings sets` | `<li><strong>Activity shortcut</strong> in Settings, General, sets` |
| control/docs/index.html:637 | (insert) | pet drag bullet in the session pet list. Text: `      <li><strong>Move the pet</strong> by dragging the figure or the line under it. Since 0.5.352 this works on macOS 27.2, and a pet dropped partly off a screen moves back inside it.</li> ⏎ ` |
| control/docs/index.html:642 | `Under Settings, Session pet you can choose` | `Under Settings, Pet and appearance you can choose` |
| control/docs/index.html:646 | `<strong>Jump to session needs Accessibility</strong>, with <strong>Grant</strong> and` | `<strong>Jump to session needs Accessibility</strong>, with <strong>Allow</strong> and` |
| control/docs/index.html:699 | `Choose the 24-hour clock under Settings, Advanced, <strong>Clock</strong>.` | `Choose 24-hour under Settings, General, <strong>Time format</strong>.` |
| control/docs/index.html:706 | `Memories reads the folder set under <strong>COS Data</strong>` | `Memories reads the folder set under <strong>Notes folder</strong>` |
| control/docs/index.html:711 | `choose <strong>COS Data</strong> in the panel to connect your library` | `choose <strong>Notes folder</strong> in Settings, Work and agents, to connect your library` |
| control/docs/index.html:738 | `Choose <strong>Allow insertion into other apps…</strong> so COS can type for you.` | `Choose <strong>Allow typing in apps…</strong> so COS can type for you.` |
| control/docs/index.html:744 | `<td data-label="Shortcut"><strong>Start / stop</strong></td>` | `<td data-label="Shortcut"><strong>Start and stop</strong></td>` |
| control/docs/index.html:763 | `Choose the engine in Settings, Transcription, <strong>Dictation engine</strong>.` | `Choose the engine in Settings, Dictation, <strong>Dictation engine</strong>.` |
| control/docs/index.html:764 | `<strong>Install Parakeet (654 MB)</strong> appears in Settings, Transcription, in a Dictation row` | `<strong>Install Parakeet (654 MB)</strong> appears in Settings, Transcription and voice, in a Dictation row` |
| control/docs/index.html:774 | `<li><strong>Restore my clipboard after pasting</strong> is on by default` | `<li><strong>Restore clipboard</strong> is on by default` |
| control/docs/index.html:803 | `<strong>If the microphone fails, try another one</strong> in Set` | `<strong>Microphone fallback</strong> in Set` |
| control/docs/index.html:809 | `<strong>Remove filler sounds (um, uh) before typing</strong> in Settings, Dictation, is on by default.` | `<strong>Remove um and uh</strong> in Settings, Dictation, is on by default.` |
| control/docs/index.html:810 | `<strong>Capitalize the start of a sentence</strong> in Settings, Dictation, is on by default.` | `<strong>Capitalize sentences</strong> in Settings, Dictation, is on by default.` |
| control/docs/index.html:816 | `<strong>Wait for &#8984; or &#8963; to be released before swapping in polish</strong> is on by default.` | `<strong>Wait for held keys</strong>, in Settings, Dictation, is on by default.` |
| control/docs/index.html:847 | `<li><strong>Learn my style from edits</strong> is the switch. Off keeps your rules and stops applying them, on this Mac and on G2.</li>` | `<li><strong>Learn my style</strong> is the switch. Off keeps your rules and stops applying them, on this Mac and on the glasses.</li>` |
| control/docs/index.html:900 | `<p>In Settings, <strong>Suggest recording when a meeting starts</strong> (on by default) has a switch per app, the Never list with Remove, and <strong>Show the recording notice again</strong>.` | `<p>In Settings, Meetings, <strong>Suggest recording</strong> (on by default) has a switch per app, the Never list with Remove, and <strong>Show recording notice again</strong>.` |
| control/docs/index.html:910 | `<li><strong>Show live meeting transcript</strong> in Settings (on by default) turns the live view off.</li>` | `<li><strong>Live transcript</strong> in Settings, Meetings (on by default) turns the live view off.</li>` |
| control/docs/index.html:922 | `<li>A capture that never saved appears under <strong>Unsaved captures</strong>` | `<li>A recording that never saved appears under <strong>Unsaved recordings</strong>` |
| control/docs/index.html:1001 | `<strong>Send plans without review</strong> in Settings, Work is off by default.` | `<strong>Send plans without review</strong> in Settings, Work and agents, is off by default.` |
| control/docs/index.html:1005 | `<h4>When earlier work is still open</h4>` | `<h4>When work is open</h4>` |
| control/docs/index.html:1006 | `In Settings, Work, <strong>When earlier work is still open</strong> is` | `In Settings, Work and agents, <strong>When work is open</strong> is` |
| control/docs/index.html:1018 | `<li><strong>Open new sessions in the app</strong> (on):` | `<li><strong>Open new sessions</strong> (on):` |
| control/docs/index.html:1037 | `In Settings, under Tools, switch on <strong>Show Claude sessions</strong> and choose <strong>Apply</strong>, or use` | `In Settings, Work and agents, switch on <strong>Show AI sessions</strong> and choose <strong>Apply</strong>, or use` |
| control/docs/index.html:1037 | `or use <strong>Show your AI sessions</strong> in the setup guide.` | `or use <strong>Show AI sessions</strong> in the setup guide.` |
| control/docs/index.html:1052 | `This needs <strong>Continue agent threads</strong> in Settings, which is on by default.` | `This needs <strong>Continue sessions</strong> in Settings, Work and agents, which is on by default.` |
| control/docs/index.html:1085 | `<h3>Tier, preview and replay (under Tools)</h3> ⏎     <ul>` | `<h3>Tier, preview and playback cleanup</h3> ⏎     <p>These are in Settings, Transcription and voice, except Fast preview, which is in Settings, Meetings, Advanced.</p> ⏎     <ul>` |
| control/docs/index.html:1087 | `<li><strong>Transcription</strong>: <strong>Balanced</strong> or <strong>Max</strong>, then <strong>Apply</strong>.` | `<li><strong>Quality tier</strong>: <strong>Balanced</strong> or <strong>Max</strong>, then <strong>Apply</strong>.` |
| control/docs/index.html:1088 | `<li><strong>Meeting Turbo preview</strong> shows fast provisional meeting text` | `<li><strong>Fast preview</strong> shows fast provisional meeting text` |
| control/docs/index.html:1089 | `<li><strong>Adaptive audio cleanup</strong> is off by default. It cleans retained audio only when you press Play; the raw recording is never changed.</li>` | `<li><strong>Playback cleanup</strong> is off by default. It cleans retained audio only when you press Play; the original recording is never changed.</li>` |
| control/docs/index.html:1090 | `<li><strong>Idle Metal HQ</strong> is for powerful Macs: it uses Metal for post-meeting HQ while the Mac is idle.</li>` | `<li><strong>GPU when idle</strong> is for powerful Macs: it uses the GPU for post-meeting HQ while the Mac is idle.</li>` |
| control/docs/index.html:1097 | `<strong>Refresh connected models</strong> rereads what your AI offers.` | `<strong>Refresh models</strong> rereads what your AI offers.` |
| control/docs/index.html:1120 | `meeting sync, the agent CLIs it found, and your Work folder and Meetings library.</p>` | `meeting sync, the AI apps it found, and your work folder and meetings folder.</p>` |
| control/docs/index.html:1124 | `Restart and Update Server are locked while a job or recording is active, and the card says why.` | `Restart and Update Server are off while a job or recording is active, and the card says why.` |
| control/docs/index.html:1129 | `<h3>Doctor and tools</h3>` | `<h3>Checks and tools</h3>` |
| control/docs/index.html:1130 | `<p><strong>Run Doctor</strong> (under Tools) checks COS Control,` | `<p><strong>Run checks</strong> (Settings, System and updates) checks COS Control,` |
| control/docs/index.html:1130 | `and shows the results under <strong>DOCTOR</strong>.</p>` | `and shows the results under <strong>CHECKS</strong>.</p>` |
| control/docs/index.html:1132 | `<li><strong>Guided Setup</strong> asks you to choose a transcription setup,` | `<li><strong>Guided setup</strong>, in Transcription and voice, Advanced, asks you to choose a transcription setup,` |
| control/docs/index.html:1133 | `<li><strong>Repair Managed Runtime</strong> and <strong>Repair Whisper</strong> fix the runtime or local Whisper.</li>` | `<li><strong>Repair server</strong> and <strong>Repair Whisper</strong> fix the server or local Whisper.</li>` |
| control/docs/index.html:1134 | `<li><strong>Work Folder</strong> is your COS project root, where Claude, Codex and Cursor search and edit. <strong>Meetings Library</strong> is the folder you already use for meetings, containing <code>YYYY-MM/*.md</code>. <strong>COS Data</strong> connects Memory and Threads; <strong>Create Folders</strong> makes them.</li>` | `<li><strong>Work folder</strong>, in Work and agents, is your COS project root, where Claude, Codex and Cursor search and edit. <strong>Meetings folder</strong>, in Meetings, is the folder you already use for meetings, containing <code>YYYY-MM/*.md</code>. <strong>Notes folder</strong>, in Work and agents, connects Memory and Threads; <strong>Create Folders</strong> makes them.</li>` |
| control/docs/index.html:1135 | `<li><strong>Copy Pairing Token</strong> copies the token the glasses use. <strong>Copy Report</strong> copies a support report. <strong>Open Logs</strong> opens <code>~/Library/Logs/COS&nbsp;Glasses</code>. <strong>Health</strong> opens the server's health page.</li>` | `<li><strong>Copy pairing token</strong>, in Glasses and iPhone, Advanced, copies the token the glasses use. <strong>Copy report</strong> copies a support report. <strong>Open logs</strong> opens <code>~/Library/Logs/COS&nbsp;Glasses</code>. <strong>Health page</strong>, in System and updates, Advanced, opens the server's health page.</li>` |
| control/docs/index.html:1137 | `<li><strong>Launch COS Control at login</strong>, <strong>Show in menu bar only</strong> and <strong>Open Activity with</strong> are at the end.</li>` | `<li><strong>Open at login</strong>, <strong>Menu bar only</strong> and <strong>Activity shortcut</strong> are in General.</li>` |
| control/docs/index.html:1175 | `<strong>Rollback Server</strong>, under Settings, Advanced, goes back to a retained earlier generation (up to two are kept) and verifies it.</p>` | `<strong>Roll back server</strong>, in Settings, System and updates, Advanced, goes back to a retained earlier generation (up to two are kept) and verifies it. In Settings it asks first.</p>` |
| control/docs/index.html:1184 | `Start with <strong>Run Doctor</strong> under Tools: it names the failing check.` | `Start with <strong>Run checks</strong> in Settings, System and updates: it names the failing check.` |
| control/docs/index.html:1193 | `In COS Control you can do the same from <strong>Settings, Session pet, Reset and add again</strong>.` | `In COS Control you can do the same from <strong>Settings, Pet and appearance, Reset and add again</strong>.` |
| control/docs/index.html:1213 | `use <strong>Run Doctor</strong> for the failing check, then <strong>Repair Managed Runtime</strong>.` | `use <strong>Run checks</strong> for the failing check, then <strong>Repair server</strong>.` |
| control/docs/index.html:1218 | `Push to talk and Start / stop are off until you choose a key.` | `Push to talk and Start and stop are off until you choose a key.` |
| control/docs/index.html:1238 | `Audio that did not save stays on the Mac under <strong>Unsaved captures</strong>, with` | `Audio that did not save stays on the Mac under <strong>Unsaved recordings</strong>, with` |
| control/docs/index.html:1242 | `In Settings, under Tools, switch on <strong>Show Claude sessions</strong> and choose <strong>Apply</strong>. To write into a session, <strong>Continue agent threads</strong> must also be on.` | `In Settings, Work and agents, switch on <strong>Show AI sessions</strong> and choose <strong>Apply</strong>. To write into a session, <strong>Continue sessions</strong> must also be on.` |
| control/docs/index.html:1246 | `Choose <strong>Grant</strong> under Settings, Session pet;` | `Choose <strong>Allow</strong> under Settings, Pet and appearance;` |
| control/docs/index.html:1258 | `copy the token with <strong>Copy Pairing Token</strong>):` | `copy the token with <strong>Copy pairing token</strong>):` |
| control/docs/index.html:1274 | `Choose <strong>Copy Report</strong> under Tools and email it` | `Choose <strong>Copy report</strong> in Settings, System and updates, and email it` |
| control/docs/index.html:1304 | (insert) | release note 0.5.352 at the top of Release notes, body identical to /docs. Text: `    <section class="note" id="release-352"><h3>Control 0.5.352 / server 6.93.0</h3><p><strong>Settings in categories.</strong> Settings opens in Activity with ten categories on the left: General; AI and accounts; Glasses and iPhone; Meetings; Dictation; Transc…` |

### control/index.html

| Line | Old | New |
|---|---|---|
| control/index.html:43 | `"softwareVersion": "0.5.351",` | `"softwareVersion": "0.5.352",` |
| control/index.html:44 | `control-v0.5.351/COS-Control-macOS-arm64-0.5.351.zip` | `control-v0.5.352/COS-Control-macOS-arm64-0.5.352.zip` |
| control/index.html:545 | `control-v0.5.351/COS-Control-macOS-arm64-0.5.351.zip` | `control-v0.5.352/COS-Control-macOS-arm64-0.5.352.zip` |
| control/index.html:548 | `<p class="byline">New in 0.5.351: stopping a Mac recording shows Saving, then Saved. A recording that stops receiving audio tries one restart, and Recover checks the server first. Speaker ID is on by default for Mac recordings. Meetings can be recorded from your iPhone microphone once your server turns that on and your COS Glasses companion offers it. Pairs with COS server 6.93.0. <a href="/control/docs/#release-351">Read the update</a>.</p>` | `<p class="byline">New in 0.5.352: Settings is sorted into categories, with search and an On this page list, and many settings have shorter names. Use classic Settings brings back the old page. Dragging the session pet works again on macOS 27.2. Pairs with COS server 6.93.0. <a href="/control/docs/#release-352">Read the update</a>.</p>` |
| control/index.html:549 | `<p class="byline">v0.5.351 &middot; macOS 14+ &middot; Apple Silicon<br>` | `<p class="byline">v0.5.352 &middot; macOS 14+ &middot; Apple Silicon<br>` |
| control/index.html:574 | `control-v0.5.351/COS-Control-macOS-arm64-0.5.351.zip` | `control-v0.5.352/COS-Control-macOS-arm64-0.5.352.zip` |
| control/index.html:582 | `Choose your Work Folder and Meetings Library, or` | `Choose your work folder and meetings folder, or` |
| control/index.html:588 | `Settings, Session pet, Reset and add again</strong> does the same.` | `Settings, Pet and appearance, Reset and add again</strong> does the same.` |
| control/index.html:588 | `Use <strong>Doctor</strong> in the menu bar for the failing check.` | `Use <strong>Run checks</strong> in the menu bar for the failing check.` |
| control/index.html:698 | `Turn off <strong>Show live meeting transcript</strong> in Settings to disable this view.` | `Turn off <strong>Live transcript</strong> in Settings, Meetings, to disable this view.` |
| control/index.html:698 | `the 24-hour clock is one pick away under Settings, Advanced.` | `the 24-hour clock is one pick away under Settings, General, Time format.` |
| control/index.html:739 | `Settings, Work can ask each time instead` | `Settings, Work and agents, can ask each time instead` |
| control/index.html:940 | `<p>Meeting Turbo preview renders provisional text` | `<p>Fast preview renders provisional text` |
| control/index.html:943 | `An optional, default-off Adaptive replay switch cleans retained audio` | `An optional, default-off Playback cleanup switch cleans retained audio` |
| control/index.html:950 | `<h3>Work Folder</h3><p>Under Tools, <strong>Work Folder</strong> is your COS project root` | `<h3>Work folder</h3><p>In Settings, Work and agents, <strong>Work folder</strong> is your COS project root` |
| control/index.html:950 | `Managed servers reload safely; older adopted servers show the selection as pending until a safe restart is available.` | `Changing it restarts the server when no work is running. If it is saved but not yet in use, the panel says so.` |
| control/index.html:953 | `<strong>COS Data</strong> still points at a full Python workspace` | `<strong>Notes folder</strong> still points at a full Python workspace` |
| control/index.html:956 | `About shows an Ollama row naming the model and Doctor confirms it.` | `About shows an Ollama row naming the model and Run checks confirms it.` |
| control/index.html:966 | `Memory and Threads ready through the authenticated COS Data bridge, scheduled recovery, local transcription, meeting sync, and agent CLIs.` | `Memory and threads ready through the authenticated notes folder bridge, scheduled recovery, local transcription, meeting sync, and AI apps.` |
| control/index.html:974 | `<span class="cc-k">Memory &amp; Threads</span>` | `<span class="cc-k">Memory and threads</span>` |
| control/index.html:975 | `<span class="cc-k">Meeting preview</span>` | `<span class="cc-k">Fast preview</span>` |
| control/index.html:976 | `<span class="cc-k">Idle Metal HQ</span><b class="cc-v ok">On &middot; preemptible</b>` | `<span class="cc-k">GPU when idle</span><b class="cc-v ok">On &middot; pauses for live work</b>` |
| control/index.html:977 | `<span class="cc-k">Adaptive replay</span><b class="cc-v ok">Off &middot; raw preserved</b>` | `<span class="cc-k">Playback cleanup</span><b class="cc-v ok">Original</b>` |
| control/index.html:983 | `<span class="cc-k">Early meeting sync</span>` | `<span class="cc-k">Early sync</span>` |
| control/index.html:985 | `<span class="cc-k">Agent CLIs</span>` | `<span class="cc-k">AI apps</span>` |
| control/index.html:991 | `<span class="cc-act">Run Doctor</span>` | `<span class="cc-act">Run checks</span>` |
| control/index.html:994 | `recovery, and agent CLIs.</strong>` | `recovery, and AI apps.</strong>` |
| control/index.html:1008 | `menu-bar status, Doctor, safe restart, update, and rollback.` | `menu-bar status, checks, safe restart, update, and rollback.` |
| control/index.html:1009 | `control-v0.5.351/COS-Control-macOS-arm64-0.5.351.zip` | `control-v0.5.352/COS-Control-macOS-arm64-0.5.352.zip` |
| control/index.html:1009 | `download>Download v0.5.351</a>` | `download>Download v0.5.352</a>` |
| control/index.html:1013 | `<code>shasum -a 256 COS-Control-macOS-arm64-0.5.351.zip</code>` | `<code>shasum -a 256 COS-Control-macOS-arm64-0.5.352.zip</code>` |
| control/index.html:1014 | `<p class="sha">SHA-256<br>51f2456cd594195554f5389209088f55ff1248cce71e534fe2f21a1432ba7b1e</p>` | `<p class="sha">SHA-256<br>__SHA256__</p>` |
| control/index.html:1035 | `control-v0.5.351/COS-Control-macOS-arm64-0.5.351.zip` | `control-v0.5.352/COS-Control-macOS-arm64-0.5.352.zip` |
| control/index.html:1039 | `<p class="byline">v0.5.351 &middot; macOS 14+ &middot; Apple Silicon &middot; open source</p>` | `<p class="byline">v0.5.352 &middot; macOS 14+ &middot; Apple Silicon &middot; open source</p>` |

### docs/index.html

| Line | Old | New |
|---|---|---|
| docs/index.html:51 | `server @gotcos/glasses-server 6.93.0 · COS Control 0.5.351.` | `server @gotcos/glasses-server 6.93.0 · COS Control 0.5.352.` |
| docs/index.html:785 | `<span class="chip">Control <b>0.5.351</b></span>` | `<span class="chip">Control <b>0.5.352</b></span>` |
| docs/index.html:792 | `        <li><a href="#release-351"><b>Mac app 0.5.351</b>` | `        <li><a href="#release-352"><b>Mac app 0.5.352</b><span>Settings in categories with search and an On this page list, shorter labels, and pet dragging that works on macOS 27.2.</span></a></li> ⏎         <li><a href="#release-351"><b>Mac app 0.5.351</b>` |
| docs/index.html:802 | `        <li><a href="#release-335"><b>Mac app 0.5.335</b><span>A Today home for Activity (opt-in); your own AI polish instructions.</span></a></li> ⏎ ` | (none) |
| docs/index.html:1009 | `For glasses, use Copy Pairing Token and your Mac` | `For glasses, use Copy pairing token and your Mac` |
| docs/index.html:1013 | `resumes on the next Guided Setup run.` | `resumes on the next Guided setup run.` |
| docs/index.html:1041 | `<p><strong>Latest release package: Control 0.5.351, glasses 6.10.654, server 6.93.0.</strong> COS Control 0.5.351 is the public Mac download.` | `<p><strong>Latest release package: Control 0.5.352, glasses 6.10.654, server 6.93.0.</strong> COS Control 0.5.352 is the public Mac download.` |
| docs/index.html:1057 | `Meeting Turbo preview on, Adaptive replay off with raw preserved,` | `Fast preview on, Playback cleanup off with the original kept,` |
| docs/index.html:1057 | `and all three agent CLIs detected. Buttons for Open COS, Open Cursor, Run Doctor, and Restart Safely.` | `and all three AI apps detected. Buttons for Open COS, Open Cursor, Run checks, and Restart Safely.` |
| docs/index.html:1066 | `<span>Meeting preview</span><b>Turbo &#183; On</b>` | `<span>Fast preview</span><b>Turbo &#183; On</b>` |
| docs/index.html:1067 | `<span>Adaptive replay</span><b>Off &#183; raw preserved</b>` | `<span>Playback cleanup</span><b>Original</b>` |
| docs/index.html:1073 | `<span>Agent CLIs</span><b>Claude &#183; Codex &#183; Cursor</b>` | `<span>AI apps</span><b>Claude &#183; Codex &#183; Cursor</b>` |
| docs/index.html:1075 | `<span>Run Doctor</span><span>Restart Safely</span>` | `<span>Run checks</span><span>Restart Safely</span>` |
| docs/index.html:1091 | `<li><strong>Run Doctor</strong> is one coordinated check.` | `<li><strong>Run checks</strong> is one coordinated check.` |
| docs/index.html:1145 | `<li><strong>Fast meeting preview</strong> shows Turbo text` | `<li><strong>Fast preview</strong> shows Turbo text` |
| docs/index.html:1146 | `<li><strong>Adaptive replay</strong> is a default-off canary.` | `<li><strong>Playback cleanup</strong> is off by default.` |
| docs/index.html:1147 | `<li><strong>Meetings Library</strong> points Control at the folder` | `<li><strong>Meetings folder</strong> points Control at the folder` |
| docs/index.html:1147 | `Activity &rarr; Meetings adds a day calendar` | `Activity, Meetings adds a day calendar` |
| docs/index.html:1149 | `The 24-hour clock is under Settings, Advanced, Clock.` | `Choose 24-hour under Settings, General, Time format.` |
| docs/index.html:1163 | `<li><strong>COS Data</strong> connects Memory and Threads` | `<li><strong>Notes folder</strong> connects Memory and Threads` |
| docs/index.html:1201 | `Then install COS Control and run Guided Setup.` | `Then install COS Control and run Guided setup.` |
| docs/index.html:1640 | `In COS Control, choose <strong>Meetings Library</strong>.` | `In COS Control, choose <strong>Meetings folder</strong>.` |
| docs/index.html:1642 | `offers Choose Again or Skip for Now.` | `offers Choose again or Skip for now.` |
| docs/index.html:1670 | `with a Guided Setup button whenever the model is missing.` | `with a Run guided setup button whenever the model is missing.` |
| docs/index.html:1867 | `row with the live model when the daemon is ready, and Doctor prints a matching line;` | `row with the live model when the daemon is ready, and Run checks prints a matching line;` |
| docs/index.html:1969 | `In COS Control you can do the same from <strong>Settings, Session pet, Reset and add again</strong>.` | `In COS Control you can do the same from <strong>Settings, Pet and appearance, Reset and add again</strong>.` |
| docs/index.html:2057 | `so a plain <code>curl</code> returns 401 &mdash; copy the token from COS Control &rarr; <b>Copy Pairing Token</b>):` | `so a plain <code>curl</code> returns 401; copy the token with <b>Copy pairing token</b> in COS Control):` |
| docs/index.html:2066 | `Current supported versions are COS Control <strong>0.5.351</strong>, server` | `Current supported versions are COS Control <strong>0.5.352</strong>, server` |
| docs/index.html:2087 | `and server 6.93.0; COS Control 0.5.351 is recommended on Apple silicon.` | `and server 6.93.0; COS Control 0.5.352 is recommended on Apple silicon.` |
| docs/index.html:2124 | (insert) | release note 0.5.352 at the top of the Mac app group. Text: `      <details class="release-detail rn" id="release-352"><summary><span class="rn-t">Control 0.5.352 / server 6.93.0</span><span class="rn-g">Settings in ten categories with search and an On this page list, shorter labels, Use classic Settings, and pet draggi…` |
| docs/index.html:2582 | `// NEW / UPDATED badges (grounded vs glasses 6.10.654 / Control 0.5.351 / server 6.93.0, 2026-10-26; Hub packs to 6.10.654)` | `// NEW / UPDATED badges (grounded vs glasses 6.10.654 / Control 0.5.352 / server 6.93.0, 2026-10-28; Hub packs to 6.10.654)` |

### wizard/index.html

| Line | Old | New |
|---|---|---|
| wizard/index.html:442 | `control-v0.5.351/COS-Control-macOS-arm64-0.5.351.zip` | `control-v0.5.352/COS-Control-macOS-arm64-0.5.352.zip` |
| wizard/index.html:456 | `Use <b>Doctor</b> in the menu-bar app for a specific error.` | `Use <b>Run checks</b> in the menu-bar app for a specific error.` |
| wizard/index.html:460 | `Choose your <b>Work Folder</b> and, if you have one, your <b>Meetings Library</b> in COS Control.` | `Choose your <b>Work folder</b> and, if you have one, your <b>Meetings folder</b> in COS Control.` |
| wizard/index.html:465 | `use <b>Copy Pairing Token</b>. The token stays` | `use <b>Copy pairing token</b>. The token stays` |
| wizard/index.html:468 | `or what <b>Copy Pairing Token</b> put on the clipboard` | `or what <b>Copy pairing token</b> put on the clipboard` |
| wizard/index.html:473 | `or Guided Setup said <code>whisper-cpp</code> is missing` | `or Guided setup said <code>whisper-cpp</code> is missing` |
| wizard/index.html:473 | `or run Guided Setup again in COS Control` | `or run Guided setup again in COS Control` |
| wizard/index.html:482 | `Choose that folder as your <b>Work Folder</b> in COS Control.` | `Choose that folder as your <b>Work folder</b> in COS Control.` |
| wizard/index.html:483 | `open <a href="/control/">COS Control</a> and choose <strong>Meetings Library</strong>.` | `open <a href="/control/">COS Control</a> and choose <strong>Meetings folder</strong>.` |
| wizard/index.html:553 | `<span class="opt-k">COS Data</span>` | `<span class="opt-k">Notes folder</span>` |
| wizard/index.html:626 | `<span class="k">Memory &amp; Threads</span>` | `<span class="k">Memory and threads</span>` |
| wizard/index.html:630 | `run <b>Guided Setup</b> and choose` | `run <b>Guided setup</b> and choose` |
| wizard/index.html:691 | `Doctor, safe restart, update and rollback live in the menu bar. Skip the command below, and use <b>Copy Pairing Token</b> in step 4.` | `Checks, safe restart, update and rollback live in the menu bar. Skip the command below, and use <b>Copy pairing token</b> in step 4.` |
| wizard/index.html:715 | `click <strong>Copy Pairing Token</strong> in COS Control` | `click <strong>Copy pairing token</strong> in COS Control` |
| wizard/index.html:725 | `COS Control Settings, Session pet, <strong>Reset and add again</strong>` | `COS Control Settings, Pet and appearance, <strong>Reset and add again</strong>` |
| wizard/index.html:1155 | `use COS Control Guided Setup and choose` | `use COS Control Guided setup and choose` |
| wizard/index.html:1156 | `use COS Control Guided Setup and choose` | `use COS Control Guided setup and choose` |
| wizard/index.html:1170 | `Or point <b>COS Data</b> in COS Control` | `Or point <b>Notes folder</b> in COS Control` |
| wizard/index.html:1173 | `choose <b>COS Data</b> and select your COS workspace` | `choose <b>Notes folder</b> and select your COS workspace` |

### llms.txt

| Line | Old | New |
|---|---|---|
| llms.txt:32 | `(Settings, Dictation, Remove filler sounds (um, uh) before typing)` | `(Settings, Dictation, Remove um and uh)` |
| llms.txt:32 | `(Capitalize the start of a sentence)` | `(Capitalize sentences)` |
| llms.txt:32 | `Public COS Control is 0.5.351, Developer ID signed and Apple notarized; it pairs with server 6.93.0.` | `Public COS Control is 0.5.352, Developer ID signed and Apple notarized; it pairs with server 6.93.0. 0.5.352 sorts Settings into ten categories with search and an On this page list, gives many settings shorter names that search still finds by the old ones, keeps Use classic Settings (General, Advanced) for the old page, makes Roll back server ask first in Settings, and fixes dragging the session pet on macOS 27.2.` |

### challenge/index.html

| Line | Old | New |
|---|---|---|
| challenge/index.html:485 | `A desktop capture of Control, your Work Folder, or the terminal` | `A desktop capture of Control, your work folder, or the terminal` |

### assets/docs-control.js

| Line | Old | New |
|---|---|---|
| assets/docs-control.js:23 | `row:{label:'Memory & Threads', value:'4,875 · 64 threads'},` | `row:{label:'Memory and threads', value:'4,875 · 64 threads'},` |
