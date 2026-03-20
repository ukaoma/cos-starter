# Integrations

COS connects to external tools through [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers. Each integration gives your COS access to a new data source — more context, better intelligence.

**You don't need any integrations to start.** Add them when you feel the gap.

---

## Slack

**What it enables:** Read channel messages, search conversations, understand team communication patterns.

**Why it matters:** Your COS can cross-reference Slack threads with meeting notes, emails, and tasks. "Sarah mentioned the launch delay in #product yesterday — your 1:1 with her is in 2 hours."

### Setup (10 minutes)

1. **Create a Slack app** at [api.slack.com/apps](https://api.slack.com/apps). Add bot scopes: `channels:history`, `channels:read`, `chat:write`, `users:read`.

2. **Install to workspace** and copy the Bot User OAuth Token (`xoxb-...`).

3. **Add to your MCP config.** Copy `slack/.mcp.json.example` to your project's `.mcp.json` and replace the token:

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-actual-token"
      }
    }
  }
}
```

---

## Google Workspace

**What it enables:** Read email, check calendar, access Google Docs and Sheets.

**Why it matters:** Email triage, meeting prep from calendar context, document search. "You have 3 unread emails from the CEO — one references the board deck you edited Tuesday."

### Setup (15 minutes)

1. **Create a Google Cloud project** at [console.cloud.google.com](https://console.cloud.google.com). Enable Gmail API, Calendar API, and Drive API.

2. **Create OAuth 2.0 credentials** (Desktop application type). Download the credentials JSON.

3. **Add to your MCP config.** Copy `google-workspace/.mcp.json.example` to your project's `.mcp.json` and update the path:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-google-workspace"],
      "env": {
        "GOOGLE_CREDENTIALS_PATH": "/path/to/your/credentials.json"
      }
    }
  }
}
```

On first run, you'll be prompted to authorize in your browser.

---

## Meeting Tools

**What it enables:** Sync meeting transcripts from Granola, Fireflies, or Fathom into your COS context.

**Why it matters:** Meeting intelligence is the highest-leverage data source. Action items, decisions, who said what, patterns across weeks of conversations.

### Option A: File-based sync (5 minutes)

Most meeting tools export Markdown. Drop transcripts into a `meetings/` directory:

```
meetings/
├── 2026-03/
│   ├── 2026-03-18_Team_Standup.md
│   └── 2026-03-19_Board_Prep.md
```

Your COS reads them directly. No API needed.

### Option B: API sync (15 minutes)

For **Fireflies**, **Granola**, or **Fathom** — check if an MCP server exists for your tool at [mcp.so](https://mcp.so). The ecosystem is growing fast.

If no MCP server exists, use the tool's API to export transcripts to Markdown files on a schedule.

---

## Vector Store (Advanced)

**What it enables:** Semantic search across all your meetings, emails, and documents. Ask "what did we discuss about pricing?" and find meetings that mention "cost structure," "rate cards," and "margin pressure" — even without the word "pricing."

**Why it matters:** Keyword search fails when people use different words for the same concept. Semantic search finds meaning, not strings.

### Setup (30 minutes)

1. **Install Qdrant** (local, no cloud account needed):

```bash
docker run -p 6333:6333 qdrant/qdrant
```

2. **Get an embedding API key.** OpenAI's `text-embedding-3-large` works well. Set `OPENAI_API_KEY` in your `.env`.

3. **Index your content.** See `scripts/cos-learn.py` for a starter indexing script that processes Markdown files into vectors.

This is a Tier 4 capability. Get Tiers 1-3 working first.

---

## Adding to an Existing `.mcp.json`

If you already have MCP servers configured, merge the `mcpServers` objects:

```json
{
  "mcpServers": {
    "slack": { "..." },
    "google-workspace": { "..." },
    "your-other-server": { "..." }
  }
}
```

Each server runs independently. Add and remove as needed.
