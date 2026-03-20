---
description: Coverage gap self-assessment -- score your COS across 14 functional domains
---

# /assess -- Coverage Gap Assessment

## When to Use
- First time setting up your COS (baseline measurement)
- Monthly check-in to track progress
- Before planning what to build next
- When evaluating a new tool or integration

## Steps

1. **Read `assess/coverage-gap-framework.md`** for the 14 domains and scoring methodology

2. **Walk through each domain one at a time.** For each, ask the user:

   > **[Domain Name]:** [One-line description]
   > How much of this is automated or AI-assisted today? Score 0.0 to 1.0.
   > - 0.0 = not addressed at all
   > - 0.3 = mostly manual with some AI
   > - 0.5 = partially automated
   > - 0.7 = automated with manual triggers
   > - 0.9 = fully automated, self-improving
   >
   > Your score?

   Wait for each answer before proceeding to the next domain.

3. **After all 14 scores, calculate:**
   - Observed average (mean of all 14 scores)
   - Gap for each domain (Theoretical - Observed)
   - Sort by gap size (largest = highest priority)

4. **Generate the radar summary and action plan.**

## The 14 Domains

| # | Domain | Theoretical |
|---|--------|:-----------:|
| 1 | Meeting Intelligence | 0.90 |
| 2 | Task Orchestration | 0.85 |
| 3 | Email & Comms Triage | 0.80 |
| 4 | Calendar Awareness | 0.75 |
| 5 | People Intelligence | 0.80 |
| 6 | Cross-Source Synthesis | 0.85 |
| 7 | Strategic Alignment | 0.75 |
| 8 | Proactive Alerting | 0.80 |
| 9 | Institutional Memory | 0.85 |
| 10 | Delegation & Follow-up | 0.75 |
| 11 | Content & Research | 0.70 |
| 12 | Reporting & Dashboards | 0.75 |
| 13 | Knowledge Management | 0.70 |
| 14 | Ambient I/O | 0.60 |

## Output Format

```
## COS Coverage Gap Assessment

**Date:** [Today's date]
**Overall Score:** [Observed avg] / 0.78 theoretical ([X]% coverage)

### Your Radar

| # | Domain | Theoretical | You | Gap | Priority |
|---|--------|:-----------:|:---:|:---:|----------|
| 1 | Meeting Intelligence | 0.90 | [X] | [X] | [Critical/Strategic/Optimization] |
| ... | ... | ... | ... | ... | ... |

### Summary
- **Observed average:** [X]
- **Average gap:** [X]
- **Critical gaps (>0.4):** [List]
- **Strategic gaps (0.2-0.4):** [List]
- **Near-ceiling (<0.2):** [List]

### Where to Build Next

Based on your gaps, here's the priority order:

1. **[Biggest gap domain]** (gap: [X])
   - What to build: [Specific suggestion based on the domain]
   - Starter skill: [Suggest a skill from the repo or a custom one]
   - Estimated effort: [Quick win / Weekend project / Multi-week]

2. **[Second biggest gap]** (gap: [X])
   - What to build: [Suggestion]
   - Starter skill: [Suggestion]

3. **[Third biggest gap]** (gap: [X])
   - What to build: [Suggestion]

### The Factory Floor Analogy

[Based on their overall score, give them the right framing:]

- If avg < 0.15: "Your factory is running on steam. Every domain is an opportunity."
- If avg 0.15-0.35: "You've plugged in the first motor. Now redesign the floor."
- If avg 0.35-0.55: "The factory is humming. Focus on the connections between machines."
- If avg > 0.55: "You're in the top tier. Optimize, don't rebuild."
```

## Re-Assessment Mode

If the user has a previous assessment (check for `assess/my-scores.md`):
- Load previous scores
- Show a comparison table: Previous → Current → Delta
- Highlight domains that improved and domains that regressed
- Calculate velocity: "You've closed [X] gap points in [N] weeks"

After each assessment, offer to save scores:

> Save these scores to `assess/my-scores.md` for future comparison? [Y/N]

If yes, append a timestamped entry:

```markdown
## Assessment: [Date]

| Domain | Score |
|--------|:-----:|
| Meeting Intelligence | [X] |
| ... | ... |

**Average:** [X] | **Gap:** [X]
```

## Notes
- Don't rush the scoring. Each domain deserves a honest self-evaluation.
- If the user is unsure about a score, help them calibrate with examples from the framework.
- The theoretical scores are fixed — they represent what current AI CAN do, not what it DOES.
- Reference the electricity analogy for users who score below 0.15 average — they need the "why" before the "how."
