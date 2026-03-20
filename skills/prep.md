---
description: Pre-meeting briefing -- relationship context, open items, talking points
argument-hint: "<person name>"
---

# /prep -- Meeting Prep Brief

## When to Use
- Before any 1:1 or meeting with a specific person
- When you need a quick refresher on someone's context
- Usage: `/prep [person name]`

## Steps

1. **Identify the person**
   - Match the argument against profiles in `context/people.md`
   - If no match found, say so and ask the user to add them
   - If multiple partial matches, list them and ask which one

2. **Load context**
   - Read `context/people.md` for the person's full profile
   - Read `operations/tasks.md` for any open items involving or related to this person
   - Read `CLAUDE.md` for the user's priorities and communication style

3. **Build the briefing**
   - Relationship context: who they are, how you work together, their current focus
   - Open items: tasks where they're the owner, blocker, or stakeholder
   - Suggested talking points: based on their priorities, your priorities, and any open items
   - Landmines: anything sensitive, overdue, or politically tricky to be aware of

## Output Format

```
## Prep: [Person Name] -- [Their Role]

### Relationship
- **Your dynamic:** [How you work together -- report, peer, client, etc.]
- **Their focus:** [What they're working on / care about right now]
- **Communication style:** [How they prefer to engage]

### Open Items
| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| [Task] | [Who] | [State] | [Context] |

[If no open items: "No open items involving [Name]."]

### Suggested Talking Points
1. [Most important topic -- tied to shared priorities or open items]
2. [Second topic -- their focus area or something they'd want an update on]
3. [Third topic -- relationship maintenance or forward-looking]

### Watch Out For
- [Anything overdue, sensitive, or politically charged]
- [If nothing: "No known sensitivities."]
```

## Notes
- Keep the output scannable -- this gets read 2 minutes before a meeting
- Match the user's communication style from CLAUDE.md
- If the person has no profile in people.md, generate a stub and suggest the user flesh it out
- Talking points should be actionable, not generic filler
