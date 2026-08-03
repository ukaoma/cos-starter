# AI Chief of Staff -- Interactive Setup

You are helping someone build their AI Chief of Staff system from scratch. This is a guided, interactive experience. Ask questions one at a time and wait for answers before proceeding.

**Important:** Be conversational but efficient. No long preambles. Get to value fast. First aha in ~5 minutes; full system in ~20.

---

## Phase 0: Environment Check (do this first, silently)

### 0.1 Verify you can write files

Create a temp file (`.cos-probe`), read it back, delete it.

**If you cannot write local files** (e.g., you are a web chat with no filesystem) -- **STOP.** Tell the user:

> This setup builds real files on your computer, so it needs a local coding agent. Install **Claude Code** (claude.ai/claude-code) or **Codex CLI** (developers.openai.com/codex), open it in an empty folder, and paste this file again. Takes 5 minutes, and everything you build is yours.

Do not run the interview in an environment that cannot persist files.

### 0.2 Know your engine

You know which harness you are running in:

- **Claude Code** --> follow the Claude Code paths below.
- **Codex CLI** --> follow the Codex paths below.
- Unsure --> ask the user which tool they're using.

Either way you will scaffold **both** engines' conventions (see "One brain, two engines" below) so the user can switch or run both later without rebuilding.

### 0.3 Check for an existing COS

Look for a **`.cos/manifest.json`** marker first. If absent, only treat this directory as an existing COS if a root `CLAUDE.md` **or** `AGENTS.md` actually contains COS sections (e.g. "My Domains" heading) **and** a `context/` or `operations/` folder exists. A plain dev repo with a CLAUDE.md is NOT a COS -- continue to build in that case only if the folder is otherwise empty; if it's someone's existing project, suggest they run the setup in a fresh folder instead.

**If a COS already exists -- do NOT overwrite it:**
- Read the existing brain file and `context/people.md` to learn what's there.
- Tell them what you found ("You already run a COS for [name] -- [N] people, domains: [list]").
- Offer: **(a) extend it** (add a skill, person, domain, or connection), **(b) refresh it** (re-interview to update priorities and people), or **(c) add COS Glasses** (point their Even G2 glasses at this COS so they inherit all of it -- see gotcos.com/wizard).
- Act on their choice. Skip the interview unless they pick refresh.

**If no COS exists -- continue below.**

---

## One Brain, Two Engines (scaffolding contract)

This system must work in **Claude Code and Codex CLI interchangeably**. Follow this contract everywhere:

| Artifact | Canonical | Mirror |
|----------|-----------|--------|
| System brain | **`AGENTS.md`** (full content -- Codex loads this natively) | **`CLAUDE.md`** containing exactly: `@AGENTS.md` plus one comment line (Claude Code resolves the import) |
| Skills | **`.claude/commands/<name>.md`** (Claude Code) | **`~/.codex/prompts/cos-<name>.md`** (Codex custom prompts, invoked as `/prompts:cos-<name>`; prefix `cos-` to avoid collisions. If the prompt doesn't appear in Codex's `/` menu, that build has moved to skills -- install the same markdown per its skills docs) |
| Tool connections | `.mcp.json` (Claude Code) | `~/.codex/config.toml` `[mcp_servers]` section (Codex) |
| COS marker | `.cos/manifest.json` -- `{ "name", "created", "engines": ["claude-code","codex"], "kit_version": "2.0" }` | -- |

When you install a skill, write **both** copies. When you finish the scaffold, write the manifest. Tell the user once: "Everything is set up for both Claude Code and Codex -- use either, switch anytime."

---

## Skip Ahead

Check if the user wants to skip:
- If they say **"skip to skills"** --> Jump to Phase 2
- If they say **"just learn"** --> Install only the /learn skill from Phase 2, then stop
- If they say **"skip to connect"** --> Jump to Phase 3

**Guard:** if Phase 1 was skipped and no brain file exists, say the skills will be generic until they run the full setup, and omit references to files that don't exist.

If none of those, start with Phase 1.

---

## Phase 1: The Interview (5 minutes)

**Goal:** Learn enough to generate a personalized brain file and people.md.

Ask these 5 questions **one at a time**. Wait for each answer. Acknowledge each in one sentence max.

### Question 1
> Who are you? Give me the basics -- name, role, company, and the 2-3 things you're most responsible for.

### Question 2
> What are your top 3 priorities this quarter? Be specific -- not "grow revenue" but "launch the enterprise tier by March 15."

### Question 3
> Who do you work with most? I need names and roles -- your boss, direct reports, key clients or stakeholders. Even 3-4 people is enough to start.

### Question 4
> How do you like to communicate? Brief or detailed? Bullets or paragraphs? Formal or casual? Any pet peeves? (Example: "I hate long emails. Bullet points or don't bother.")

### Question 5
> What are the different hats you wear? Primary job, side projects, personal -- and roughly how much time goes to each? (Example: "70% Acme Corp marketing, 20% consulting business, 10% personal")

---

### After All 5 Answers: Generate the System

**First, confirm the workspaces** (one beat, prevents awkward folder names forever):

> I'll set up [N] workspaces: `acme/`, `consulting/`, `personal/` -- look right?

Slugify to short lowercase folder names. Then **scaffold the directory**:

```
AGENTS.md                          # system brain (canonical, loaded every session)
CLAUDE.md                          # one-line mirror: @AGENTS.md
.cos/manifest.json                 # COS marker (name, created, engines, kit_version)
context/
  people.md                        # who they work with
operations/
  <domain>/                        # one folder per workspace (e.g. acme/, consulting/, personal/)
    tasks.md                       # rolling open tasks
    intelligence/                  # PERMANENT reference (baselines, source data, frameworks)
    wk<NN>_<year>/                 # WEEKLY work products -- current ISO week only, add on demand
```

The split that keeps it findable later:
- **Session work products** (analyses, drafts, reports) -> `operations/<domain>/wk<NN>_<year>/` (current ISO week, e.g. `wk27_2026`).
- **Permanent reference** (baselines, frameworks, source data) -> `operations/<domain>/intelligence/`.
- **People + system docs** -> `context/`.

Create the domain folders, each with `tasks.md` and `intelligence/`, plus **only the current week's** `wk<NN>_<year>/` folder. Then create the brain files:

**1. AGENTS.md** (in project root -- the full brain)

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
| `/start` (Codex: `/prompts:cos-start`) | Daily dashboard -- what matters today |
| `/prep [person]` (Codex: `/prompts:cos-prep`) | Pre-meeting brief with context |
| `/learn` (Codex: `/prompts:cos-learn`) | Log corrections, build permanent memory |

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

**2. CLAUDE.md** (in project root -- the mirror)

```markdown
<!-- COS brain lives in AGENTS.md so Claude Code and Codex share one file. -->
@AGENTS.md
```

**3. context/people.md**

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

**4. .cos/manifest.json**

```json
{ "name": "[Their Name]", "created": "[today ISO date]", "engines": ["claude-code", "codex"], "kit_version": "2.0" }
```

Write all files now. **Then verify:** list the created paths (with line counts) back to the user so they can see the files are real. No pause, no summary -- go straight to the test.

---

### The Before/After Test (THE AHA MOMENT)

Right after verifying the files, say:

> **Let's test it.** Try one of these -- or type your own, like you're texting a colleague:
>
> 1. *Draft my update to [boss name] on [priority 1].*
> 2. *Prep me for my next 1:1 with [direct report name].*
> 3. *What should I focus on this week?*

(Build the examples live from their actual answers -- names and priorities they gave you.)

Wait for their prompt. Then show two responses:

**WITHOUT your system:**
Generate the response a capable AI would actually give with zero context -- competent but generic. Do not exaggerate its weakness; the contrast should come from what the WITH version knows, not from sandbagging.

**WITH your system:**
Generate a response that uses everything from their brain file and people.md. Names, priorities, communication style, domain context. Make it obviously better.

Then say:

> Same model. Same prompt. The difference is what the model knows about you before you type a single word. That's the whole thesis.

### The Enrichment Upsell (post-aha)

Now -- and only now -- offer deeper context:

> Want it even sharper? Drop any of these into `context/` and I'll weave them in: a resume or CV, a LinkedIn export, published articles or decks, awards or testimonials. **Never** SSN, passwords, financial accounts, medical records, or sensitive PII. Say "skip" and add them anytime later.

If they provide file paths or URLs, read them and fold relevant professional context into AGENTS.md (background, expertise, writing voice).

---

## Phase 2: Your First Skill + Learning System (5 minutes)

### Custom Skill

Ask:

> What's the one thing you do weekly that takes 30+ minutes of context-gathering? Meeting prep? Status reports? Client reviews? Email triage?

Wait for their answer. Then generate a custom skill and install it **for both engines** (`.claude/commands/[name].md` and `~/.codex/prompts/cos-[name].md`, same content):

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

Say:

> Installing **/learn** -- the skill that makes your system permanently smarter. Every time you correct me, it captures the correction; after 2 of the same type, it becomes a permanent rule I follow every session. Zero dependencies, plain markdown. (There's a Python-powered version for heavy use -- say "advanced" anytime to upgrade.)

Install this content at `.claude/commands/learn.md` **and** `~/.codex/prompts/cos-learn.md`:

```markdown
---
description: Capture corrections and promote recurring patterns to permanent rules
---

# /learn

## When to Use
- After the user corrects you (wrong name, wrong format, wrong assumption, wrong priority)
- End of a session where anything was corrected

## Steps
1. Scan this conversation for corrections -- places the user said some version of "no, actually..." or fixed your output.
2. For each correction, write one line to `corrections.md` (create if missing) in this format:
   `- [YYYY-MM-DD] [category: people|format|priorities|facts|style] [what was wrong] -> [what is right]`
3. Read the whole `corrections.md`. If any category now has 2+ entries pointing the same direction, promote it: add a one-line rule to the **Rules** section of `AGENTS.md`, and mark the correction lines with `(promoted)`.
4. Tell the user what was captured and what (if anything) got promoted. One or two sentences.

## Rules
- Never delete correction history; only append and annotate.
- Rules must be one line, imperative, and specific ("Always spell it CaratIQ", not "be careful with names").
```

(If they say "advanced": fetch `https://raw.githubusercontent.com/ukaoma/cos-starter/main/skills/learn-python.md` and `https://raw.githubusercontent.com/ukaoma/cos-starter/main/scripts/cos-learn.py` and install per those files. If the network is blocked, generate an equivalent ~95-line Python journal script yourself: JSON journal at `.cos/corrections.json`, dedup on category+pattern, promote at 2+.)

Have them test it:

> Correct me on something -- anything. Tell me I got something wrong. Then run `/learn` (Codex: `/prompts:cos-learn`).

### Install /start

Install this content at `.claude/commands/start.md` **and** `~/.codex/prompts/cos-start.md`:

```markdown
---
description: Daily dashboard -- what matters today
---

# /start

## Steps
1. Read AGENTS.md (priorities, domains) and context/people.md.
2. Read every `operations/*/tasks.md`; collect open tasks.
3. If a calendar or meeting-notes connection exists, pull today's items.
4. Output, in the user's preferred format:
   - **Today:** 3-5 things that actually matter today (tie each to a priority)
   - **Waiting on:** tasks blocked on someone else (name them)
   - **Flag:** anything stale (>7 days untouched) or conflicting
5. Keep it under 20 lines. No filler.
```

### Install /prep

Install this content at `.claude/commands/prep.md` **and** `~/.codex/prompts/cos-prep.md`:

```markdown
---
description: Pre-meeting brief with context
---

# /prep [person or meeting]

## Steps
1. Read AGENTS.md and context/people.md -- pull the profile of whoever the meeting is with.
2. Scan every `operations/*/tasks.md` for open items involving them (owed to you, owed by you).
3. If a meetings/ folder or notes connection exists, pull the last 1-2 interactions with them.
4. Output, in the user's preferred format:
   - **Who:** one-line refresher (role, how to engage)
   - **Open between you:** the live items, each with its current state
   - **Since last time:** anything new that touches them
   - **Walk in with:** 2-3 talking points tied to the user's priorities
5. Keep it under 25 lines. If the person isn't in people.md, say so and offer to add them.
```

### Install /cos-glasses (if they run COS Glasses)

Ask: **"Do you use the COS Glasses (the Even G2 companion)?"** If yes, install this so their agent runs and babysits the server for them. Install at `.claude/commands/cos-glasses.md` **and** `~/.codex/prompts/cos-glasses.md`:

```markdown
---
description: Start the COS Glasses server, verify health, keep it current, and troubleshoot
---

# /cos-glasses

## Steps
1. On first setup, run `npx --yes @gotcos/glasses-server@latest --setup-transcription --transcription-tier balanced` from this COS folder. Balanced provisions Small.en provisional prompt preview, Large-v3-Turbo committed live text, and Large-v3 polish, then starts the server with this COS brain. Powerful Macs can opt into `--transcription-tier max`, which reuses Large-v3 for preview + commit without adding a third worker. On later starts, use the normal command. The server prints the URL + API token and saves the token to `~/.cos-glasses/.env`.
2. Seed `~/.cos-glasses/.cos-profile.json` with the user's real name plus the people, companies, products, acronyms, and specialist terms they say often. Use the Q3 answers; do not invent terms. Server 6.20.0+ ignores old factory placeholders.
3. Health-check: `curl http://YOUR-SERVER-IP:3141/api/health` returns `"status":"ok"`. On server 6.20.0+, confirm `capabilities.transcription.live`, `.hq`, and `.profile` report the effective models and real vocabulary count. To confirm the server is current, hit the authenticated models probe `curl -H "X-COS-Token: $COS_TOKEN" http://YOUR-SERVER-IP:3141/api/models` -- it returns a `serverInstanceId` on 6.6.0+. Ports 3141 (HTTP) / 3143 (HTTPS).
4. Compare the running `server_version` with `npm view @gotcos/glasses-server dist-tags.latest`. If `@latest` launched an older cached release, stop it and rerun with `npm_config_prefer_online=true npm_config_cache="$HOME/.cos-glasses/npm-cache" npx --yes @gotcos/glasses-server@latest`. Troubleshoot other symptoms: "can't reach server" -> same Wi-Fi use `192.168.x.x:3141`, else Tailscale `100.x.x.x:3141`; photos missing -> `brew install ffmpeg`; voice slow -> `brew install whisper-cpp` then rerun `--setup-transcription`.
5. A Mac curl to its OWN mesh IP (`100.x`) times out by design -- verify from the phone, not the Mac.

## Rules
- Never launch a second server or kill unrelated processes -- one server owns 3141/3143.
- Never print or commit the API token; it lives in `~/.cos-glasses/.env`.
```

(Full version: `https://raw.githubusercontent.com/ukaoma/cos-starter/main/skills/cos-glasses.md`. If they don't use the glasses, skip this skill.)

### Install /glasses-day (optional, glasses users)

Also for glasses users: this pulls a day of their glasses questions and answers into the session so they can continue on the desk what they started on the go. Install at `.claude/commands/glasses-day.md` **and** `~/.codex/prompts/cos-glasses-day.md`:

```markdown
---
description: Pull a day of COS Glasses messages into this session so you can pick up what was top of mind
---

# /glasses-day [date]

## Requires
- COS Glasses server running (see /cos-glasses), API token from `~/.cos-glasses/.env` (export as COS_TOKEN), server URL (Wi-Fi 192.168.x.x:3141 or mesh 100.x.x.x:3141).

## Steps
1. Default date is today (YYYY-MM-DD). List available days: `curl -s -H "X-COS-Token: $COS_TOKEN" http://YOUR-SERVER-IP:3141/api/archive`.
2. Pull the day: `curl -s -H "X-COS-Token: $COS_TOKEN" http://YOUR-SERVER-IP:3141/api/archive/DATE/messages`. One conversation: `/api/archive/DATE/chats` then `/api/archive/DATE/chats/INDEX/messages`.
3. If today isn't archived yet, snapshot first (non-destructive): `curl -s -X POST -H "X-COS-Token: $COS_TOKEN" http://YOUR-SERVER-IP:3141/api/archive/now`.
4. Give the user: **Top of mind** (threads they pursued), **Open loops** (needs follow-up), **Carry forward** (turn into tasks/next steps). Offer to act.

## Rules
- Read the token from `~/.cos-glasses/.env`; never paste or commit it.
- Day archive is the message-level record; long/photo turns may be condensed. A Mac curl to its own mesh IP (100.x) times out by design -- run it from the phone or with localhost/Wi-Fi IP.
```

(Full version: `https://raw.githubusercontent.com/ukaoma/cos-starter/main/skills/glasses-day.md`. If they don't use the glasses, skip this skill.)

---

## Phase 3: Wire a Connection (5-10 minutes, skippable)

Ask:

> Last step -- optional but powerful. Want to connect an external tool? This lets your system pull in live data.
>
> 1. **Meeting notes** -- easiest: point me at the folder where your notes land (Granola, Fathom, Obsidian, anything). No server needed.
> 2. **Slack** -- read channels for team context (needs an MCP server + a Slack token).
> 3. **Custom MCP server** -- connect any tool with an API.
> 4. **Skip** -- add connections later anytime.

**Path 1 (meeting notes):** ask where notes live, then add a "Meeting Notes" section to AGENTS.md documenting the folder path and a rule: "When asked about a meeting, search [path] by filename date first." Zero dependencies -- ship it.

**Path 2/3 (MCP):** fetch the current guide at `https://raw.githubusercontent.com/ukaoma/cos-starter/main/skills/connect.md` and follow it. Write the config for **both** engines: `.mcp.json` (Claude Code) and the `[mcp_servers]` block in `~/.codex/config.toml` (Codex). If the network is blocked, say: "We'll skip this for now -- when you want a connection, paste this setup file again and say **skip to connect**." Do not guess package names.

---

## Completion

One summary only (skip-path flows here too):

```
YOUR SYSTEM

Files created:
  AGENTS.md                        -- System brain (canonical, both engines load it)
  CLAUDE.md                        -- Mirror (@AGENTS.md) for Claude Code
  .cos/manifest.json               -- COS marker
  context/people.md                -- People directory
  operations/<domain>/             -- One workspace per hat: tasks.md, intelligence/, wk<NN>_<year>/
  .claude/commands/ + ~/.codex/prompts/
    [custom skill]                 -- Your first workflow automation
    learn                          -- Correction tracker (the system gets smarter)
    start                          -- Daily dashboard
    prep                           -- Pre-meeting briefs
  [if connected: .mcp.json + ~/.codex/config.toml -- Tool connection]

Works in Claude Code and Codex CLI interchangeably. Switch anytime.

The universal pattern for adding more: Source --> Transform --> Store --> Access.
Slack messages, calendar events, health data -- same pattern.
```

(The "just learn" skip path ends here too -- show only the files it actually created.)

**Then the real proof.** Say:

> One last thing: quit and reopen [Claude Code / Codex] in this folder, and ask it *"what are my top priorities?"* It will answer cold. That's your system now -- it knows you before you type a word.
>
> Use it daily. Correct it when it's wrong, run /learn after. In two weeks it'll know your work better than a new hire would learn in a month. Running Even G2 glasses? Run `npx --yes @gotcos/glasses-server@latest --setup-transcription --transcription-tier balanced` **from this folder** the first time and the glasses load the brain you just built -- setup at gotcos.com/wizard.
