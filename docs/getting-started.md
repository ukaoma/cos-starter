# Getting Started

A detailed walkthrough for setting up your first COS instance.

---

## Prerequisites

| Requirement | Why |
|------------|-----|
| **Claude Code CLI** | COS runs inside Claude Code, not the web chat |
| **Claude Max or Team subscription** | Extended context + tool use required |
| **A terminal** | macOS Terminal, iTerm2, Warp, or VS Code terminal |
| **Git** | Version control for your COS (recommended, not required) |

### Install Claude Code

```bash
# macOS / Linux
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

If you don't have Node.js, install it first: [nodejs.org](https://nodejs.org)

---

## Step-by-Step Setup

### 1. Create your COS directory

Pick a location. This becomes your persistent workspace.

```bash
mkdir ~/cos && cd ~/cos
git init
```

### 2. Copy the setup prompt

```bash
cp /path/to/cos-starter/cos-starter.md .
```

Or download it directly:

```bash
curl -O https://raw.githubusercontent.com/milesukaoma/cos-starter/main/cos-starter.md
```

### 3. Launch Claude Code

```bash
claude
```

### 4. Run the interactive setup

Type this into Claude Code:

> Read cos-starter.md and run the interactive setup.

Claude will ask you a series of questions:

1. **What's your name and role?** — "VP Engineering at Acme Corp"
2. **Who do you report to?** — Name and title
3. **Who reports to you?** — Names, roles, one line about each person's working style
4. **What are your top 3 priorities this quarter?**
5. **What tools do you use daily?** — Slack, Gmail, Notion, Jira, etc.
6. **What's your communication style?** — How do you want Claude to talk to you?

From your answers, it generates:

- `CLAUDE.md` — Your COS configuration file
- `context/people.md` — Team profiles
- `context/priorities.md` — Current quarter focus
- `skills/` — Four starter slash commands
- `operations/tasks.md` — Empty task tracker

### 5. Verify it worked

Start a new Claude Code session in the same directory:

```bash
claude
```

Ask: **"What are my priorities this quarter?"**

If it answers correctly from your context — you're live.

---

## First 5 Things to Try

Once your COS is running, try these in order:

### 1. `/start` — Morning briefing

> /start

Your COS reviews your tasks, calendar (if connected), and any recent context to give you a morning briefing.

### 2. Add a meeting note

Create a file:

```
meetings/2026-03-20_Team_Standup.md
```

Paste in your meeting notes or transcript. Then ask:

> "What action items came out of today's standup?"

### 3. `/prep` — Meeting preparation

> /prep 1:1 with [direct report name]

Your COS pulls together everything relevant: recent tasks, last meeting notes, open items.

### 4. `/learn` — Teach it something

When Claude gets something wrong, say:

> /learn "When I say 'the board deck,' I mean the Q1 investor update, not the product roadmap."

Corrections accumulate. The system gets sharper.

### 5. `/connect` — Cross-reference

> /connect "What's related to the infrastructure migration?"

Your COS searches across meetings, tasks, and people context to find connections.

---

## Common Issues

### "Claude doesn't seem to know my context"

**Cause:** You're not in the right directory. Claude Code loads `CLAUDE.md` from the current working directory.

**Fix:** `cd` into your COS directory before launching `claude`.

### "The skills don't work"

**Cause:** Skills need to be in a `skills/` directory (or `.claude/skills/` depending on your Claude Code version).

**Fix:** Check that your skill files exist:

```bash
ls skills/
```

If they're missing, re-run the setup or copy from `cos-starter/skills/`.

### "I want to connect Slack/email but it seems complicated"

**Advice:** Don't. Not yet. Get 2 weeks of value from the base setup first. Integrations are Tier 2+. The foundation alone is worth it.

### "How do I update my context?"

Edit the files directly. `CLAUDE.md`, `context/people.md`, `context/priorities.md` — they're all Markdown. Update them as your role evolves.

---

## What's Next

| After... | Do this |
|----------|---------|
| **1 week** | Review your `corrections.md`. Run `/learn` to promote patterns. |
| **2 weeks** | Add your first integration (calendar or Slack). |
| **1 month** | Look at the [coverage gap assessment](../assess/coverage-gap.md). Score yourself. Build toward gaps. |
| **Ongoing** | Every quarter, update `context/priorities.md`. Add new people as your team changes. |

---

## Need Help?

- **Issues:** [github.com/milesukaoma/cos-starter/issues](https://github.com/milesukaoma/cos-starter/issues)
- **Enterprise deployment:** [hermitcrabs.io](https://hermitcrabs.io)
- **Learn more:** [milesukaoma.com/cos](https://milesukaoma.com/cos)
