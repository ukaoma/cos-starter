---
description: Connect an external tool -- Slack, meeting notes, or custom MCP server
---

# /connect -- Tool Connector

Generates the configuration and test skill for connecting an external data source.

## When to Use
- Setting up a new data source
- Adding Slack, meeting transcripts, or any MCP-compatible tool

## Steps

1. **Ask which connection type:**
   - **Slack** -- Read channels, search messages, get team context
   - **Meeting notes** -- Capture transcripts from Fireflies, Fathom, Granola, or local files
   - **Custom MCP** -- Connect any tool with an MCP server

2. **Based on choice, generate the appropriate files:**

### Path A: Slack

Create `.mcp.json` in project root:
```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

Tell the user:
1. Go to api.slack.com/apps and create a new app
2. Add Bot Token Scopes: `channels:history`, `channels:read`, `users:read`
3. Install to workspace, copy the Bot User OAuth Token
4. Replace `xoxb-your-token-here` in `.mcp.json`

Create `.claude/commands/slack-check.md`:
```markdown
---
description: Quick Slack channel summary
---
# /slack-check
Read the last 20 messages from a specified Slack channel.
Summarize: key decisions, action items, questions that need answers.
Format as bullets, grouped by topic.
```

### Path B: Meeting Notes

Ask which service:
- **Fireflies:** Generate a curl-based fetch skill
- **Fathom/Granola:** Set up file-watch from export directory
- **Local files:** Create `meetings/` directory with processing skill

For any service, create `.claude/commands/sync-meetings.md`:
```markdown
---
description: Process new meeting transcripts
---
# /sync-meetings
1. Check meetings/ directory for new .md or .txt files
2. For each new file, extract: date, participants, key topics, action items
3. Append action items to operations/tasks.md with source meeting noted
4. Report: how many meetings processed, how many tasks extracted
```

### Path C: Custom MCP

Create `.mcp.json` template:
```json
{
  "mcpServers": {
    "your-tool": {
      "command": "npx",
      "args": ["-y", "@your-org/mcp-your-tool"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

Point user to: https://github.com/modelcontextprotocol/servers for the MCP server registry.

Create a test skill at `.claude/commands/test-connection.md` that exercises the new tool.

3. **After generating files, explain the universal pattern:**

> Every connection follows the same pattern:
> **Source** (where data lives) --> **Transform** (extract what matters) --> **Store** (save as context files) --> **Access** (skills that use the data)
>
> Slack messages, calendar events, health data, project boards -- same pattern every time.

4. **Test the connection** -- have the user restart Claude Code to pick up the new MCP config, then run the test skill.

## Notes
- Always create a test skill alongside the connection config
- If the user doesn't have API keys ready, generate the config with placeholder values and instructions
- .mcp.json is gitignored by default in Claude Code -- API keys stay local
