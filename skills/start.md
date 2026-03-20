---
description: Morning dashboard -- priorities, open items, daily focus
---

# /start -- Daily Dashboard

## When to Use
- Start of every work session
- Monday mornings for weekly context
- After being away for a day or more

## Steps

1. **Read CLAUDE.md** for identity, priorities, domains, and rules
2. **Read context/people.md** for team context and current focus areas
3. **Check operations/tasks.md** for open items (skip if file doesn't exist)
4. **Note today's date and day of week**
   - If weekend: acknowledge it. Don't suggest work unless asked.
   - If Monday: add a "This Week" section
5. **Check for corrections.md** -- if it exists, note any patterns with 2+ occurrences that haven't been promoted yet

## Output Format

```
## Good [morning/afternoon], [Name]

**[Day], [Date]**

### Priorities
[Top 3 from CLAUDE.md, with any relevant context updates]

### Open Items
[From tasks.md -- grouped by domain if multiple domains exist]
[If no tasks.md: "No task file yet. Create operations/tasks.md to track items."]

### Today's Focus
Based on your priorities and open items:
1. [Highest-impact focus item]
2. [Second focus item]
3. [Third focus item]

### System Health
- People context: [X] profiles loaded
- Corrections tracked: [N] ([M] ready for promotion)
- [Any other relevant system state]
```

## Notes
- Keep it under 30 lines. This is a glance, not a report.
- Match the user's communication style from CLAUDE.md
- If the user has defined Rules about time boundaries, respect them
