[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-7C3AED)](https://claude.ai/claude-code)

# COS Starter

**Build an AI Chief of Staff that actually knows your job.**

> "The prompt was never the problem. The model isn't the bottleneck. Your context is."

Same model. Same prompt. Give it your context — your people, your priorities, your patterns — and it becomes something fundamentally different. It becomes useful.

COS is an AI Chief of Staff built on [Claude Code](https://claude.ai/claude-code). Not a chatbot. Not a wrapper. A persistent, context-aware system that compounds in value every time you use it.

**[See the philosophy](https://milesukaoma.com/cos)** | **[Interactive demo](philosophy/cos-philosophy-diagram.html)** | **[For teams](https://hermitcrabs.io)**

---

## The Problem

AI is electricity. But most people are still running steam-powered factories.

They open a chat window. Type a prompt. Get a generic answer. Close the tab. Repeat tomorrow with zero memory of yesterday.

**That's not a workflow. That's a slot machine.**

The executives who are actually getting leverage from AI aren't writing better prompts. They're building better context. They're giving the model the same information a world-class chief of staff would have on day 90 of the job:

- Who reports to you and how each person operates
- What you're working on this quarter and why it matters
- Which meetings need prep and which are noise
- What patterns keep showing up that you keep missing

This repo gives you the scaffolding to build that.

---

## Quick Start

**Prerequisites:** [Claude Code CLI](https://claude.ai/claude-code) installed. Claude Max or Team subscription.

### Step 1: Create your COS directory

```bash
mkdir my-cos && cd my-cos && git init
```

### Step 2: Copy the setup prompt

```bash
curl -O https://raw.githubusercontent.com/ukaoma/cos-starter/main/cos-starter.md
```

### Step 3: Run the interactive setup

```bash
claude
```

Then tell Claude:

> "Read cos-starter.md and run the interactive setup."

Answer the questions. It builds your `CLAUDE.md`, creates your context files, and installs starter skills.

**5 minutes to a working COS.**

---

## What You Get

After setup, your directory looks like this:

```
my-cos/
├── CLAUDE.md                 # Your COS brain (auto-generated)
├── context/
│   └── people.md             # Your team profiles
├── .claude/
│   └── commands/
│       ├── start.md          # /start — daily briefing
│       ├── learn.md          # /learn — capture corrections
│       ├── prep.md           # /prep — meeting preparation
│       └── connect.md        # /connect — wire external tools
├── operations/
│   └── tasks.md              # Your task tracker
└── corrections.md            # Pattern corrections (auto-populated)
```

Every Claude Code session in this directory starts with your full context loaded. No re-explaining. No "as an AI language model." Just: here's what matters today.

---

## The 4 Tiers

COS isn't a one-time setup. It's a system that deepens over time.

### Tier 1: Foundation (5 minutes)

Run the setup. Get your `CLAUDE.md` with role, team, and priorities. Claude now knows who you are every session.

**You get:** Consistent, role-aware responses. No more re-explaining your job.

### Tier 2: Operational (30 minutes)

Add people profiles. Configure your first skill (`/start` for daily briefings). Connect one integration (calendar, Slack, or email).

**You get:** A morning routine that surfaces what matters. Meeting prep that knows the players.

### Tier 3: Compounding (2 weeks)

Use `/learn` to capture corrections. Build task tracking. Add meeting notes. The system starts connecting dots you didn't ask about.

**You get:** Cross-source intelligence. "You have a 1:1 with Sarah at 2pm — she mentioned budget concerns in Monday's team sync and hasn't responded to your Thursday email."

### Tier 4: Agentic (1+ month)

Scheduled tasks run automatically. Semantic search across all your meetings. Self-improvement loops where the system proposes its own upgrades.

**You get:** A system that works while you sleep. Finds patterns across weeks of data. Flags risks before they become problems.

Most people never get past Tier 1 with AI tools. **COS is designed to pull you forward.**

---

## Coverage Gap Assessment

Not sure where to focus? Run `/assess` to score yourself across 14 COS domains.

| # | Domain | What It Covers |
|---|--------|---------------|
| 1 | **Meeting Intelligence** | Capture, classify, extract insights, search by meaning |
| 2 | **Task Orchestration** | Extract from conversations, dedup, stage, track, complete |
| 3 | **Email & Comms Triage** | Prioritize inbox, draft responses, follow-up tracking |
| 4 | **Calendar Awareness** | Meeting prep, conflict detection, time blocking |
| 5 | **People Intelligence** | Profiles, communication styles, relationship health |
| 6 | **Cross-Source Synthesis** | Connect signals across meetings + email + tasks + Slack |
| 7 | **Strategic Alignment** | Goal tracking, resource allocation, priority scoring |
| 8 | **Proactive Alerting** | Early warnings, signal detection, anomaly flagging |
| 9 | **Institutional Memory** | Session persistence, correction compounding, decision history |
| 10 | **Delegation & Follow-up** | Track who owes what, escalation cadence |
| 11 | **Content & Research** | Market intel, competitor tracking, document creation |
| 12 | **Reporting & Dashboards** | Status updates, briefings, visual dashboards |
| 13 | **Knowledge Management** | File organization, templates, SOPs, documentation |
| 14 | **Ambient I/O** | Multi-surface delivery — terminal, mobile, voice |

See [`assess/coverage-gap-framework.md`](assess/coverage-gap-framework.md) for the full scoring methodology and reference implementation benchmarks.

**Your lowest scores are your highest-leverage next steps.**

---

## Integrations

COS connects to your existing tools through [MCP servers](https://modelcontextprotocol.io/).

| Integration | What It Enables | Setup Time |
|------------|----------------|:----------:|
| **Slack** | Channel monitoring, message context | 10 min |
| **Google Workspace** | Email, calendar, docs access | 15 min |
| **Meeting Tools** | Transcript sync (Granola, Fireflies, Fathom) | 10 min |
| **Vector Store** | Semantic search across all content | 30 min |

See [`integrations/README.md`](integrations/README.md) for configuration templates.

---

## For Teams

Running COS for yourself is powerful. Running it across a leadership team is transformative.

**Multi-role deployments** with shared knowledge architecture:

- Each executive gets their own COS instance
- Shared context layer for company priorities, org chart, and decisions
- Cross-role intelligence (your COS knows what the other COS instances surfaced)
- Consistent correction propagation across the team

**Need help deploying COS at your organization?**
Contact [hermitcrabs.io](https://hermitcrabs.io) for architecture consulting and implementation.

---

## Philosophy

COS is built on a specific belief: **context compounds.**

Every correction you make, every meeting you feed in, every person you profile — it all accumulates into a system that understands your work better than any prompt could describe.

The [interactive philosophy diagram](philosophy/cos-philosophy-diagram.html) maps the four tiers:

1. **Foundation** — Identity is the starting point
2. **Operational** — Routines create rhythm
3. **Compounding** — Corrections accumulate into intelligence
4. **Agentic** — The system acts without being asked

---

## Project Structure

```
cos-starter/
├── README.md                    # You are here
├── cos-starter.md               # Interactive setup prompt
├── templates/                   # Blank templates for CLAUDE.md, people, tasks
├── skills/                      # Starter skills (/start, /learn, /prep, /assess, /connect)
├── scripts/                     # Utility scripts (cos-learn.py)
├── philosophy/                  # Interactive philosophy diagram
├── assess/                      # Coverage gap self-assessment framework
├── integrations/                # MCP config templates for external tools
├── examples/
│   └── solo-executive/          # Complete example for a VP of Product
└── docs/                        # Extended documentation
```

---

## Contributing

COS is opinionated by design. If you've built something that made your COS meaningfully better, open a PR. Include:

- What problem it solved
- How long it took to set up
- What tier it belongs to

---

## Credits

Created by [Miles Ukaoma](https://milesukaoma.com/cos).

COS was born from running an AI Chief of Staff across three businesses simultaneously — learning what works when the stakes are real and the calendar is full.

Learn more at [gotcos.com](https://gotcos.com).

---

*The best chief of staff doesn't wait to be asked.*
