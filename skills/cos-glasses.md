---
description: Start the COS Glasses server, verify it's healthy, keep it current, and troubleshoot connection issues
---

# /cos-glasses -- Run & manage the COS Glasses server

Runs the COS Glasses server on your Mac, confirms it came up healthy, keeps it on the latest release, and diagnoses the common failure points -- so "is the server up?" is never a question you have to answer by hand. Works in **Claude Code and Codex CLI**.

## When to Use
- You want to use the glasses and need the server running
- The glasses say "can't reach server," a query hangs, or photos/voice misbehave
- You want to be sure you're on the latest server release

## Why a skill (not just the command)
`npx --yes @gotcos/glasses-server@latest` starts the server, but it doesn't tell you whether the server is actually healthy, why the phone can't reach it, or whether you're up to date. This skill wraps the command with a health check, a symptom-to-fix table, and the update path. The explicit `@latest` keeps every run on the current public release -- there is no separate upgrade step.

## Steps

1. **Start it -- from your COS folder if you have one.**
   - If a COS project exists here (an `AGENTS.md` / `CLAUDE.md` is present), start from that folder so the glasses load your brain:
     ```
     npx --yes @gotcos/glasses-server@latest
     ```
   - Keep the terminal open. On boot the server prints your **server URL** (Wi-Fi and, if present, Tailscale/mesh addresses, labeled) and your **API token**. The token is written to `~/.cos-glasses/.env`, so it is stable across restarts -- you paste it into the phone app only once.
   - `npx` fetches the latest release every run. "Already up to date" is the expected message on a repeat run.

2. **Confirm it's healthy.** Curl the health endpoint (no token needed):
   ```
   curl http://YOUR-SERVER-IP:3141/api/health
   ```
   - Healthy = JSON with `"status":"ok"` plus feature/voice/whisper details.
   - To confirm you're on a current server, hit the authenticated models probe (export your token from `~/.cos-glasses/.env` as `COS_TOKEN` first) -- it returns a `serverInstanceId` on server 6.6.0+:
     ```
     curl -H "X-COS-Token: $COS_TOKEN" http://YOUR-SERVER-IP:3141/api/models
     ```
     If `serverInstanceId` is absent, the server is older -- rerun the npx command to pull the current release.
   - Ports: `3141` is HTTP, `3143` is HTTPS. Local voice (whisper.cpp) runs as a child process only if `whisper-cpp` is installed.
   - Expected quirk: a request from the Mac to its OWN mesh IP (`100.x`) always times out. That is not a failure -- test reachability from the phone, or use `localhost` / the Wi-Fi IP on the Mac itself.

3. **If something's wrong, match the symptom:**

   | Symptom | Likely cause | Fix |
   |---|---|---|
   | "Port already in use" / two servers | It's already running | Don't launch a second -- one server owns 3141/3143. Use the running one, or stop the old terminal and restart. |
   | Phone: "can't reach server" | Network path | Same Wi-Fi: use the `192.168.x.x:3141` address. Away from home: install Tailscale on Mac + phone (same account), use the `100.x.x.x:3141` address. Quick check: open `http://YOUR-SERVER-IP:3141/api/health` in the phone browser. |
   | Photos don't render on the lens | Missing ffmpeg | `brew install ffmpeg`, then rerun the server. Needs server 6.5.0+ and Lens images on. |
   | Voice slow or unavailable | No local Whisper | `brew install whisper-cpp` for free local voice. Cloud fallback is deliberate opt-in only and requires both `COS_OPENAI_WHISPER_FALLBACK=1` and a configured `OPENAI_API_KEY`. |
   | App: "server update required" | Server older than app | Rerun `npx --yes @gotcos/glasses-server@latest` -- it pulls the latest. |
   | Token rejected after a URL change | Origin changed | Re-enter the token in the app (a new host never auto-receives your old token, by design). The token itself hasn't changed -- it's in `~/.cos-glasses/.env`. |
   | "Claude/Codex not found" | Desktop app is present, but the terminal CLI is missing | Claude: run `npm install -g @anthropic-ai/claude-code` on one line **without sudo**, then run `claude` and finish sign-in. Codex: verify `codex --version`, then `codex login`. |
   | npm `EACCES` / root-owned cache | A prior sudo npm install poisoned the shared cache | Never use sudo or broad `chown`. Retry with `npm_config_cache="$HOME/.cos-glasses/npm-cache" npx --yes @gotcos/glasses-server@latest`. Server 6.12.2+ never runs a nested install inside the npx cache. |

4. **Keep it current.**
   - Server: this skill already does it -- `npx` resolves the latest dist-tag every run.
   - App: update separately from the Even Hub on your iPhone. History and settings carry over; you don't re-pair.
   - App and server upgrade independently. A brief version-skew window is handled gracefully: normal Q&A keeps working, and the app just nudges you to rerun the server when a new capability needs it.

## Rules
- Never start a second server instance or kill unrelated processes -- one server owns ports 3141/3143.
- Never use `sudo npm`, `sudo npx`, or recursively change npm/cache ownership. Use the isolated COS cache recovery command instead.
- Never print, paste, or commit the API token; it lives in `~/.cos-glasses/.env`.
- Don't diagnose a firewall problem from a Mac-to-its-own-mesh-IP timeout -- that's expected. Verify reachability from the phone.
