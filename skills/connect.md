---
description: Connect an external tool -- Slack, meeting notes, or custom MCP server
---

# /connect -- Tool Connector

Generates the configuration and test skill for connecting an external data source. Works in **Claude Code and Codex CLI** -- write config and skills for BOTH engines every time (see "Both engines" below).

## When to Use
- Setting up a new data source
- Adding Slack, meeting transcripts, or any MCP-compatible tool

## Both Engines (write config twice)

| Engine | MCP config | Skill location |
|--------|-----------|----------------|
| Claude Code | `.mcp.json` in project root | `.claude/commands/<name>.md` |
| Codex CLI | `[mcp_servers.<name>]` block in `~/.codex/config.toml` | `~/.codex/prompts/cos-<name>.md` (invoke as `/prompts:cos-<name>`) |

**Token safety (both engines):** never hardcode a token into config. `.mcp.json` is a project file -- if the folder ever becomes a git repo, a pasted token ships with it. Reference an environment variable instead (`"SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}"`), put the real value in a `.env` file, and add `.env` (plus `.mcp.json` if it holds anything sensitive) to `.gitignore` -- create the `.gitignore` if it doesn't exist.

**Package safety:** before writing any MCP config, VERIFY the package exists -- run `npm view <package> version`. If it 404s, do not guess; search the MCP registry (https://github.com/modelcontextprotocol/servers) with the user.

## Steps

1. **Ask which connection type:**
   - **Slack** -- Read channels, search messages, get team context
   - **Meeting notes** -- Capture transcripts from Fireflies, Fathom, Granola, or local files
   - **Custom MCP** -- Connect any tool with an MCP server

2. **Based on choice, generate the appropriate files:**

### Path A: Slack

Pick a Slack MCP server WITH the user: check the registry (link above) for a currently maintained one, and verify it resolves (`npm view <package> version`) before writing config. The reference implementation `@modelcontextprotocol/server-slack` exists but is archived -- it works, but prefer a maintained fork if one exists.

Claude Code -- `.mcp.json` in project root:
```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "<verified-slack-mcp-package>"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}"
      }
    }
  }
}
```

Codex CLI -- append to `~/.codex/config.toml`:
```toml
[mcp_servers.slack]
command = "npx"
args = ["-y", "<verified-slack-mcp-package>"]
env = { "SLACK_BOT_TOKEN" = "${SLACK_BOT_TOKEN}" }
```

Tell the user:
1. Go to api.slack.com/apps and create a new app
2. Add Bot Token Scopes: `channels:history`, `channels:read`, `users:read`
3. Install to workspace, copy the Bot User OAuth Token
4. Put it in `.env` as `SLACK_BOT_TOKEN=xoxb-...` and add `.env` to `.gitignore`

Create the check skill at `.claude/commands/slack-check.md` AND `~/.codex/prompts/cos-slack-check.md`:
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

For any service, create `.claude/commands/sync-meetings.md` AND `~/.codex/prompts/cos-sync-meetings.md`:
```markdown
---
description: Process new meeting transcripts
---
# /sync-meetings
1. Check meetings/ directory for new .md or .txt files
2. For each new file, extract: date, participants, key topics, action items
3. Append action items to the matching operations/<domain>/tasks.md with source meeting noted
4. Report: how many meetings processed, how many tasks extracted
```

### Path C: Custom MCP

Same shape as Path A -- verify the package first (`npm view`), env-var the credentials, write BOTH engine configs. Registry: https://github.com/modelcontextprotocol/servers

Create a test skill at `.claude/commands/test-connection.md` (and the `~/.codex/prompts/cos-test-connection.md` mirror) that exercises the new tool.

3. **After generating files, explain the universal pattern:**

> Every connection follows the same pattern:
> **Source** (where data lives) --> **Transform** (extract what matters) --> **Store** (save as context files) --> **Access** (skills that use the data)
>
> Slack messages, calendar events, health data, project boards -- same pattern every time.

4. **Test the connection** -- restart the engine (quit/reopen Claude Code, or restart Codex) to pick up the new MCP config, then run the test skill.

## Notes
- Always create a test skill alongside the connection config
- If the user doesn't have API keys ready, generate the config with the env-var reference and instructions -- never a pasted placeholder token
