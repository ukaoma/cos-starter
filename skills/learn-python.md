---
description: Scan conversation for corrections, track with Python-backed dedup engine
---

# /learn -- Correction Tracker (Advanced)

Uses `scripts/cos-learn.py` for deterministic dedup and structured tracking.
Requires Python 3.8+.

## What This Does

Scans the current conversation for corrections. Uses a Python script with
SequenceMatcher (0.7 threshold) for reliable duplicate detection. Stores
corrections in a JSON journal with precise counts, timestamps, and IDs.
Promotes recurring patterns to `.claude/rules/corrections.md`.

## Steps

1. **Scan the conversation** for correction patterns:
   - Direct corrections: "No, that's wrong..." / "Actually..." / "I told you..."
   - Behavioral redirects: "Don't do X, do Y" / "Stop doing X"
   - Repeated reminders: "Remember that..." / "I already said..."
   - Frustration signals: "Again?" / "I keep telling you..."

   For each correction, extract:
   - **wrong**: What was done incorrectly
   - **right**: The correct behavior
   - **rule**: A generalizable prevention rule

2. **For each correction, check for existing matches:**
   ```bash
   python scripts/cos-learn.py check "the rule text"
   ```
   - If `EXISTING`: Record another occurrence with `hit`:
     ```bash
     python scripts/cos-learn.py hit <pattern_id>
     ```
   - If `PROMOTED`: Skip it -- already a permanent rule
   - If `NEW`: Add it:
     ```bash
     python scripts/cos-learn.py add "what was wrong" "what is right" "prevention rule"
     ```

3. **Check the full list:**
   ```bash
   python scripts/cos-learn.py list
   ```
   Patterns marked with `*` are ready for promotion (2+ occurrences).

4. **For each promotable pattern, ask the user:**
   - Show: "[Rule] has been seen [N] times. Promote to permanent rule?"
   - If yes:
     ```bash
     python scripts/cos-learn.py promote <pattern_id>
     ```
   - If no: Leave it for continued tracking

5. **Report results** using the output format below.

## Output Format

```
## /learn Results

### Corrections Found: [N]

| # | ID | What Happened | Status |
|---|-----|--------------|--------|
| 1 | c_20260214_... | [brief] | New |
| 2 | c_20260210_... | [brief] | Updated (3x) |

### Ready for Promotion
- **[Rule]** (seen 3x) -- Promote? [Y/N]

### Script Output
[Paste relevant output from cos-learn.py commands]
```

## Notes

- The script stores data in `.corrections.json` (project root)
- Promoted rules go to `.claude/rules/corrections.md` (auto-loaded every session)
- Dedup uses SequenceMatcher with 0.7 similarity threshold -- deterministic, not probabilistic
- The `add` command auto-detects duplicates -- if you add a rule that matches an existing one, it increments the count instead of creating a duplicate
