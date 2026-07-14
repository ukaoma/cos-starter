---
description: Pull a day of COS Glasses messages into this session so you can pick up what was top of mind
---

# /glasses-day [date] -- Bring your glasses day into COS

Ports the questions and answers from a day on the glasses into this Claude Code / Codex session, so anything you asked on the go becomes context you can act on at the desk. Read-only -- it never changes anything on the server.

## When to Use
- You asked things on the glasses during the day and want to continue at the desk
- You want a recap of what you covered on the glasses on a given date

## Requires
- The COS Glasses server running (see `/cos-glasses`).
- Your API token from `~/.cos-glasses/.env` (export it as `COS_TOKEN` for the commands below).
- Your server URL: Wi-Fi `192.168.x.x:3141` or mesh `100.x.x.x:3141`.

## Steps

1. **Resolve the date** -- default is today (`YYYY-MM-DD`). To see which days are on the server:
   ```
   curl -s -H "X-COS-Token: $COS_TOKEN" http://YOUR-SERVER-IP:3141/api/archive
   ```

2. **Pull the day's messages** (flat question/answer record for the date):
   ```
   curl -s -H "X-COS-Token: $COS_TOKEN" http://YOUR-SERVER-IP:3141/api/archive/DATE/messages
   ```
   For a single conversation instead of the whole day: `/api/archive/DATE/chats` to list them, then `/api/archive/DATE/chats/INDEX/messages` for one chat's paired Q&A.

3. **If today's live session isn't archived yet**, snapshot it first (non-destructive -- no LLM spend):
   ```
   curl -s -X POST -H "X-COS-Token: $COS_TOKEN" http://YOUR-SERVER-IP:3141/api/archive/now
   ```

4. **Read the returned messages and hand the user:**
   - **Top of mind:** the 3-5 threads they actually pursued on the glasses that day
   - **Open loops:** anything asked that needs a follow-up or a decision
   - **Carry forward:** items worth turning into tasks or continuing right now

5. **Offer to act** -- turn any open loop into a task, a draft, or the next step, in the user's preferred format.

## Notes
- **Token safety:** read the token from `~/.cos-glasses/.env` (or a `COS_TOKEN` env var); never paste or commit it.
- **What this is:** the server's day archive -- the message-level record (questions + answers as retained). Long or photo-heavy turns may be condensed; treat it as "what I covered today," not a byte-exact transcript.
- A Mac curl to its own mesh IP (`100.x`) times out by design -- run this on the Mac with `localhost`/the Wi-Fi IP, or from another device on the tailnet.
