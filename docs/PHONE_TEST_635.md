# Public release: phone acceptance script

Matched release: server 6.71.12, COS Control 0.5.287 (340), companion 6.10.635. Update Control, then use Update Server when recording is stopped. Sideload the complete 635 EHPK from the Glasses Hub; confirm these versions in About. Hub delivery is separate from Even marketplace approval. Native phone/Android acceptance is still pending; the replay results do not prove those device gates. Select **Claude · Sonnet** in Meeting assistant settings before the tests; an existing explicit choice is preserved by upgrade. Even app must be 2.2.10 or newer. Keep experimental transcription and cue flags disabled; stable transcription stays in place.

## 1. Local speech and layout (2 minutes)
1. Open local speech settings and prepare Tiny. It must reach Ready using packaged assets; do not accept a missing-model download as the packaging gate.
2. Start a new recording. Say: “This is the Birch pilot. Nora owns it. The approved budget is twenty-four hundred dollars. The deadline is Friday. Order ten headsets. Correction: order twelve headsets, replacing ten. Do not order twenty.”
3. Ask: **“Who owns the pilot, what is the budget, and how many headsets are approved?”**
4. Expect Nora, $2,400, and 12, with the correction explained briefly and transcript citations. A source tap must reveal the supporting passage; it must not jump to another meeting.
5. Stay on Ask as Checking COS appears/disappears, then repeat on Transcript. The composer and reading pane must not move. Scroll up while new chunks arrive; the reading position should remain stable until you choose Jump to now.

## 2. Fact check CTA and follow-up (3 minutes)
1. Leave an unsent draft, **“My next question”**, in the composer.
2. Say: “We are discussing a general public retirement rule. The claim is that when you leave an employer, you always have to move your money out of the old four-oh-three-B or four-oh-one-k plan.”
3. Tap **Fact check**. If Public topics is off, it should open the setting and explain the choice. Enable it if desired, then tap again. The button must not turn that setting on silently.
4. Expect a short verdict with a readable IRS or Department of Labor source. It should explain the general option and conditions, while leaving individual plan terms unverified. It should not repeat private balances or invent fees. Your unsent draft must still be present.
5. Tap an inline **W** citation. It must reach its linked article/source. Tap a **T** citation. It must reveal/jump to that transcript passage.
6. Ask **“Do web search.”** It should continue the same public subject, without searching for garbled words such as “anchor.”
7. Ask **“What is this plan's exact annual administration fee?”** Expect that the exact fee is unknown, not a guessed number.
8. Ask **“Summarize.”** Expect a compact meeting gist, not another fact-check or irrelevant purchasing warnings.

## 3. Real public claim (2 minutes)
1. Say: “A public news report said New York allocated seven hundred fifty thousand dollars for a firehouse roof. Is that accurate?”
2. Tap **Fact check**. A successful check must cite a page it actually read. If the source cannot be read, it must say **Unverified**; a search-summary citation alone does not pass verification.
3. Ask **“How much more is that than the average?”** Expect a benchmark lookup. It must distinguish an actual average from illustrative projects and explain differences in scope. It must not invent roof area, $4,000 per square foot, a ten-times ratio, or fraud.
4. Record whether useful comparable evidence was found. A safe “no usable average found” passes the honesty check, but does not pass the comparison-usefulness gate. This remains a limitation of this release.

## 4. Files, persistence, follow-ups (3 minutes)
1. Upload a clear photo/screenshot with large text **“PROJECT BIRCH — APPROVED COUNT 12”**, then a small text/PDF file with the same facts. Each should become Ready rather than Not supported.
2. Ask **“What project and approved count are in the uploaded file?”** Expect Birch and 12 with an F citation. Do not accept a correct guess without a usable file source.
3. Leave the meeting screen while an answer runs, then return. It should finish once, retain the same question, and avoid duplicate submissions.
4. Stop the recording. Reopen that same saved meeting, including after sync. The questions, answers and original cited excerpts should remain.
5. Ask a saved-meeting follow-up. Save one answer as a follow-up and confirm it enters Work Review linked to this meeting; it must not silently create an accepted task.

## 5. Summary and reported quantities (2 minutes)
1. In a fresh short recording, say: “Dana migrated the site content by replacing module IDs. He also changed icons and background images. The page count is unclear. He mentioned about three hundred hours of manual labor, but we have not confirmed whether that means effort or time saved.”
2. Ask **“Summarize.”** Expect the supported migration gist with citations, rather than a generic inability to answer because passages were selected.
3. Ask **“What did Dana do that saved 300 hours?”** Expect the method and a clear distinction between the reported labor figure and independently verified time savings. It must not invent 150 pages or attribute the whole figure solely to changing images.
4. Repeat each once. Record the answers and response time; each must arrive within 30 seconds.

## 6. Fast search, next question and source health (2 minutes)
1. Open Memories and type a distinctive word from a memory you already know is saved. Results should narrow while typing; tap the result and confirm the right record opens. Change the query quickly and confirm an older response cannot replace the newest results. Clear it and confirm the ordinary list returns.
2. While the Birch meeting is available, ask **“What is one useful question I should ask next?”** Expect one short, relevant question rather than another lengthy summary. This is explicitly requested; automatic cues stay disabled.
3. Open the meeting source/context information. Connected memory/thread availability and confirmed domain should reflect your actual setup. Missing or unknown sync information must be labeled rather than invented. Confirm a domain, ask again, and ensure the answer still treats transcript/file citations as the factual evidence.

## 7. Android (separate device gate)
1. Confirm companion 635, server 6.71.12 and Even app 2.2.10 or newer in About. An Android phone still on companion 629 with server 6.71.5 does not validate these fixes.
2. With Tailscale on, open the Mac address displayed by Control followed by **/api/health** in Chrome on the phone. Record JSON versus failure. Try local Wi-Fi separately. Then pair/reconnect in Even using the same reachable address; do not reset or delete existing data. Record the exact error if Chrome succeeds but Even fails.
3. Reopen Even and check chat/history/drafts remain. Repeat the correction question and a photo/file upload. Passing iPhone or Mac browser tests does not pass Android.

## Report back

Send: installed versions; Tiny Ready yes/no; correction answer yes/no; T/W/F citation taps yes/no; Checking COS/scroll stability yes/no; Fact check source/verdict; benchmark usefulness; photo/file Ready/use; saved history and follow-up; memory search, next-question usefulness and source health. Include screenshots or exported context for any failure. Android remains a separate Android, Even app and Tailscale field gate; browser checks on this Mac do not prove Android behavior.

This script clears the remaining device acceptance gates and records any failures; it does not claim they already passed. No experimental transcription or cue flag is enabled by this test. Automated replay: 26/26 completed under 30 seconds (median 7.128 seconds, maximum 19.459); 25/26 were reviewed useful. The roof average comparison remains the one usefulness gap.
