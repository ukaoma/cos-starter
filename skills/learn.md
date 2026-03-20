---
description: Scan conversation for corrections, track patterns, promote to permanent rules
---

# /learn -- Correction Tracker (Standard)

Zero dependencies. Works with Claude's built-in tools only.

## What This Does

Scans the current conversation for moments where the user corrected you.
Logs each correction to `corrections.md`. When a correction appears 2+
times, suggests promoting it to a permanent rule loaded every session.

## Steps

1. **Scan the conversation** for correction patterns. Look for:
   - Direct corrections: "No, that's wrong..." / "Actually..." / "I told you..."
   - Behavioral redirects: "Don't do X, do Y" / "Stop doing X" / "Always do X"
   - Repeated reminders: "Remember that..." / "I already said..." / "Like I mentioned..."
   - Direct contradictions of your output
   - Frustration signals: "Again?" / "I keep telling you..." / "For the last time..."

   For each correction, extract:
   - **What was wrong** (what you did or said incorrectly)
   - **What is right** (the correct behavior or information)
   - **A generalizable rule** (a prevention rule that applies beyond this one instance)

2. **Read `corrections.md`** in the project root. If it doesn't exist, create it with:
   ```
   # Corrections Log

   _Tracked by /learn. Corrections with 2+ occurrences get promoted to permanent rules._

   ---
   ```

3. **For each correction found, check for duplicates:**
   - Read the existing entries in corrections.md
   - Compare the new correction's Rule against existing Rules
   - Consider it a duplicate if: same topic, same behavioral pattern, or same entity
   - Use your judgment -- "always use Sam not Samuel" and "Sam's name is Sam Chen, not Samuel" are the same correction

4. **If NEW correction:** Append to corrections.md:
   ```
   ### [Short descriptive label] (seen: 1x, last: YYYY-MM-DD)
   - **Wrong:** What was done incorrectly
   - **Right:** What the correct behavior is
   - **Rule:** A generalizable rule to prevent this in the future
   ```

5. **If DUPLICATE:** Update the existing entry:
   - Change `seen: Nx` to `seen: (N+1)x`
   - Update `last: YYYY-MM-DD` to today's date
   - If the new occurrence adds context, append it as a note

6. **Check for promotions:** Look for any entry with `seen: 2x` or higher:
   - Show the user: "[Label] has appeared [N] times. Promote to permanent rule?"
   - **If yes:** Append the Rule line to one of:
     - `.claude/rules/corrections.md` (preferred, create if needed)
     - Or the `## Rules` section of `CLAUDE.md`
   - **If no:** Leave it in corrections.md for continued tracking

7. **Report results** using the output format below.

## Output Format

```
## /learn Results

### Corrections Found: [N]

| # | Label | What Happened | Status |
|---|-------|--------------|--------|
| 1 | [short label] | [brief description] | New |
| 2 | [short label] | [brief description] | Updated (3x) |

### Ready for Promotion (2+ occurrences)
- **[Label]** (seen 3x): [Rule text]
  Promote to permanent rule? [Waiting for user response]

### No Corrections Found
[If the conversation has no corrections, say so. Suggest the user
correct something and run /learn again to test the system.]
```

## Notes

- Only capture genuine corrections, not casual preferences mentioned in passing
- The Rule should be generalizable -- "Always use product brand names, not internal codenames" not a company-specific reference
- If unsure whether something is a correction, ask the user
- corrections.md is the single source of truth -- don't track state anywhere else
