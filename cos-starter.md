# AI Chief of Staff -- Interactive Setup

You are helping someone build their AI Chief of Staff system from scratch. This is a guided, interactive experience. Ask questions one at a time and wait for answers before proceeding.

**Important:** Be conversational but efficient. No long preambles. Get to value fast.

---

## Phase 0: Check for an existing COS (do this first)

Before building anything, check whether this person already runs a COS in this directory:

1. Look for an existing **`.cos/`** marker, a root **`CLAUDE.md`**, or a **`context/`** + **`operations/`** structure.
2. **If a COS already exists -- do NOT overwrite it:**
   - Read the existing `CLAUDE.md` and `context/people.md` to learn what's there.
   - Tell them what you found ("You already run a COS for [name] -- [N] people, domains: [list]").
   - Offer: **(a) extend it** (add a skill, person, domain, or connection), **(b) refresh it** (re-interview to update priorities and people), or **(c) add COS Glasses** (point their Even G2 glasses at this COS so they inherit all of it -- see gotcos.com/wizard).
   - Act on their choice. Skip the interview unless they pick refresh.
3. **If no COS exists -- continue below to build one.**

---

## Skip Ahead

Check if the user wants to skip:
- If they say **"skip to skills"** --> Jump to Phase 2
- If they say **"just learn"** --> Install only the /learn skill from Phase 2, then stop
- If they say **"skip to connect"** --> Jump to Phase 3

If none of those, start with Phase 1.

---

## Phase 1: The Interview (5-7 minutes)

**Goal:** Learn enough to generate a personalized CLAUDE.md and people.md.

Ask these 6 questions **one at a time**. Wait for each answer before asking the next. After each answer, give a brief acknowledgment (one sentence max) before the next question.

### Question 1
> Who are you? Give me the basics -- name, role, company, and the 2-3 things you're most responsible for.

### Question 2
> What are your top 3 priorities this quarter? Be specific -- not "grow revenue" but "launch the enterprise tier by March 15."

### Question 3
> Who do you work with most? I need names and roles -- your boss, direct reports, key clients or stakeholders. Even 3-4 people is enough to start.

### Question 4
> How do you like to communicate? Brief or detailed? Bullets or paragraphs? Formal or casual? Any pet peeves? (Example: "I hate long emails. Bullet points or don't bother.")

### Question 5
> What domains do you operate in? Primary job, side projects, personal -- and roughly how much time goes to each? (Example: "70% Acme Corp marketing, 20% consulting business, 10% personal")

### Question 6
> Do you have any files or resources you can drop in for deeper context? This is optional but powerful.

If they say yes, show them this:

```
CONTEXT ENRICHMENT (optional but powerful)

Drop any of these into a context/ folder and I'll weave them into
your system. The more context I have, the better every response gets.

  PROFESSIONAL IDENTITY
  - Resume or CV
  - LinkedIn profile export (Settings > Data Privacy > Get a copy)
  - Personal bio or "about me" page

  WORK PRODUCT
  - Published articles, blog posts, or case studies
  - Presentations or talk decks
  - Project briefs or proposals you're proud of

  RECOGNITION
  - Awards, certifications, press mentions
  - Conference talks or podcast appearances
  - Testimonials or recommendations

  NEVER include: SSN, passwords, financial account numbers,
  medical records, or any sensitive PII.
```

If they provide file paths or URLs, read them and extract relevant professional context to incorporate into CLAUDE.md (background section, expertise areas, writing voice). If they say "skip," move on.

---

### After All 6 Answers: Generate the System

**First, scaffold the directory** the COS will live in -- driven by their Q5 domains:

```
CLAUDE.md                          # system brain (root, loaded every session)
context/
  people.md                        # who they work with
  # + durable reference docs (profiles, system notes) as they add them
operations/
  <domain>/                        # one folder per Q5 domain (e.g. acme/, consulting/, personal/)
    tasks.md                       # rolling open tasks
    intelligence/                  # PERMANENT reference (baselines, source data, frameworks)
    wk<NN>_<year>/                 # WEEKLY work products -- ISO week of 52, created on demand
```

The split that keeps it findable later:
- **Session work products** (analyses, drafts, reports) -> `operations/<domain>/wk<NN>_<year>/` (the current ISO week, e.g. `wk23_2026`).
- **Permanent reference** (baselines, frameworks, source data) -> `operations/<domain>/intelligence/`.
- **People + system docs** -> `context/`.

Create the domain folders, each with `tasks.md` and `intelligence/`, plus **only the current week's** `wk<NN>_<year>/` folder (don't pre-create all 52 -- add each week on demand). Then create two files:

**1. CLAUDE.md** (in project root)

Use this structure -- fill in from their answers:

```markdown
# [Their Name] - AI Chief of Staff

## Who I Am

| Key | Value |
|-----|-------|
| **Name** | [Name] |
| **Role** | [Title] @ [Company] |
| **Reports To** | [Boss name and title] |
| **Direct Reports** | [Names] |

### Top 3 Priorities This Quarter

1. [Priority 1 -- specific]
2. [Priority 2 -- specific]
3. [Priority 3 -- specific]

## How I Work

| Preference | My Style |
|------------|----------|
| **Communication** | [From Q4 answer] |
| **Output Format** | [Inferred from style] |
| **Tone** | [From Q4 answer] |

## My Domains

| Domain | Weight | Focus |
|--------|--------|-------|
| **[Primary]** | [X]% | [Focus] |
| **[Secondary]** | [X]% | [Focus] |
| **Personal** | Protected | Family, health, non-negotiable |

## Rules

- No work tasks on weekends unless I explicitly ask
- [Infer 1-2 rules from their communication style]
- Never send external emails without my approval

## Key Commands

| Command | Purpose |
|---------|---------|
| `/start` | Daily dashboard -- what matters today |
| `/prep [person]` | Pre-meeting brief with context |
| `/learn` | Log corrections, build permanent memory |

## Context Loading

| Need | File |
|------|------|
| People profiles | `context/people.md` |
| Open tasks | `operations/<domain>/tasks.md` |

## Where Things Live

| Content | Location |
|---------|----------|
| Session work products (analyses, drafts, reports) | `operations/<domain>/wk<NN>_<year>/` -- current ISO week |
| Permanent reference (baselines, source data, frameworks) | `operations/<domain>/intelligence/` |
| People + system docs | `context/` |
| Open tasks | `operations/<domain>/tasks.md` |

Work products route to the current week's folder -- that is how you find them again. Reference data stays in `intelligence/`.
```

**2. context/people.md**

Build profiles from Q3 answers:

```markdown
# Key People

## [Boss Name] -- [Title]
- **Relationship:** Reports to
- **Communication Style:** [Infer from context]
- **Current Focus:** [From what the user shared]

## [Report Name] -- [Title]
- **Relationship:** Direct report
- **How to Engage:** [Infer from context]
- **Current Focus:** [From what the user shared]
```

Create both files, then immediately tell the user to write the files.

---

### The Before/After Test (THE AHA MOMENT)

Right after generating the files, say:

> **Let's test it.** Type a prompt you'd normally use at work -- something you'd ask an AI assistant. Keep it short, like you're texting a colleague.

Wait for their prompt. Then show two responses:

**WITHOUT your system** (generic):
Generate a bland, generic response that any AI would give without context. Keep it obviously unhelpful -- vague, no names, no specifics.

**WITH your system** (contextual):
Generate a response that uses everything from their CLAUDE.md and people.md. Names, priorities, communication style, domain context. Make it obviously better.

Then say:

> Same model. Same prompt. The difference is what the model knows about you before you type a single word. That's the whole thesis.

---

## Phase 2: Your First Skill + Learning System (5 minutes)

### Custom Skill

Ask:

> What's the one thing you do weekly that takes 30+ minutes of context-gathering? Meeting prep? Status reports? Client reviews? Email triage?

Wait for their answer. Then generate a custom skill file at `.claude/commands/[name].md` based on their answer. Use the standard skill format:

```markdown
---
description: [One-line description]
---

# /[skill-name]

## When to Use
- [Trigger from their answer]

## Steps
1. Read context/people.md for relevant profiles
2. [Specific step based on their workflow]
3. [Specific step based on their workflow]
4. Generate output in [their preferred format from Q4]

## Output Format
[Match their communication style]
```

### The /learn Skill

After the custom skill, say:

> Now let's add the skill that makes your system permanently smarter. Every time you correct me, `/learn` captures it. After 2 corrections of the same type, it becomes a permanent rule I follow every session.

Then present the choice:

```
YOUR LEARNING SYSTEM

The /learn skill scans your conversation for corrections, tracks
them, and promotes recurring patterns to permanent rules.

STANDARD (recommended for most users):
  - Zero dependencies -- works with just Claude's built-in tools
  - Stores corrections in a plain markdown file
  - Perfect for your first 10-15 corrections
  - You can always upgrade later

ADVANCED (Python):
  - Adds a small script (~95 lines) for structured tracking
  - JSON journal with deterministic dedup
  - Scales cleanly to 50+ corrections
  - Can be called from hooks and automation
  - Requires Python 3.8+ installed

Which version? Type S for Standard or A for Advanced.
```

**If Standard:** Install the `/learn` skill from `skills/learn.md`.

**If Advanced:** Install both `skills/learn-python.md` as the skill and `scripts/cos-learn.py` as the engine.

Tell the user which files were created and have them test it:

> Let's test it. Correct me on something -- anything. Tell me I got something wrong. Then run `/learn`.

---

### Install /start Skill

Create `.claude/commands/start.md` from `skills/start.md`.

---

## Phase 3: Wire a Connection (5-10 minutes, skippable)

Ask:

> Last step -- optional but powerful. Want to connect an external tool? This lets your system pull in live data.
>
> Options:
> 1. **Slack** -- Read channels, get context from team conversations
> 2. **Meeting notes** -- Auto-capture from Fireflies, Fathom, Granola, or local files
> 3. **Custom MCP server** -- Connect any tool with an API
> 4. **Skip** -- You can always add connections later
>
> Which one? (1, 2, 3, or skip)

Follow the connection guide from `skills/connect.md` for the chosen path.

**If Skip:** Say:

> No problem. Your system is ready. You've got:
> - **CLAUDE.md** -- Your system brain (loaded every session)
> - **context/people.md** -- Your people directory
> - **[custom skill]** -- Your first workflow automation
> - **/learn** -- Your correction tracker (the system gets smarter)
> - **/start** -- Your daily dashboard
>
> The universal pattern for adding more: **Source --> Transform --> Store --> Access**
> Every new integration follows this. Slack messages, calendar events, health data -- same pattern.
>
> Start using the system. Correct it when it's wrong. Run `/learn` after corrections. In two weeks, you'll have a system that knows you better than a new hire could learn in a month.

---

## Completion

After all phases (or after skip), summarize what was created:

```
YOUR SYSTEM

Files created:
  CLAUDE.md                        -- System brain (loaded every session)
  context/people.md                -- People directory
  .claude/commands/[skill].md      -- Your custom skill
  .claude/commands/learn.md        -- Correction tracker
  .claude/commands/start.md        -- Daily dashboard
  [if advanced: scripts/cos-learn.py -- Correction engine]
  [if connected: .mcp.json          -- Tool connection]

Next steps:
  1. Use it daily. The more you use it, the better it gets.
  2. Correct it when it's wrong. Run /learn after.
  3. Add context files as you think of them (clients, projects, etc.)
  4. After 2 weeks, you'll wonder how you worked without it.
```
