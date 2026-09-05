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
`npx --yes @gotcos/glasses-server@latest` starts the server, but it doesn't tell you whether the server is actually healthy, why the phone can't reach it, or whether npm served stale cached metadata. This skill wraps the command with a health check, a registry-version comparison, a symptom-to-fix table, and the update path.

## Steps

1. **Start it -- from your COS folder if you have one.**
   - On first setup, provision the adaptive local transcription lanes:
     ```
     npx --yes @gotcos/glasses-server@latest --setup-transcription --transcription-tier balanced
     ```
     Balanced is recommended: Small.en supplies provisional prompt words, Large-v3-Turbo commits live text, and Large-v3 performs polish. Max is an opt-in for powerful Macs: use `--transcription-tier max`; it reuses Large-v3 for live preview + commit and retains Turbo as the safe fallback.
   - On later starts, if a COS project exists here (an `AGENTS.md` / `CLAUDE.md` is present), start from that folder so the glasses load your brain:
     ```
     npx --yes @gotcos/glasses-server@latest
     ```
   - Keep the terminal open. On boot the server prints your **server URL** (Wi-Fi and, if present, Tailscale/mesh addresses, labeled) and your **API token**. The token is written to `~/.cos-glasses/.env`, so it is stable across restarts -- you paste it into the phone app only once.
   - Seed `~/.cos-glasses/.cos-profile.json` with the user's real name plus the people, companies, products, acronyms, and specialist terms they say often. Server 6.20.0+ ignores old factory placeholders and reports the real term count in health.
   - Compare the running `server_version` with `npm view @gotcos/glasses-server dist-tags.latest`. If they differ, stop the old server and rerun with fresh registry metadata:
     ```
     npm_config_prefer_online=true npm_config_cache="$HOME/.cos-glasses/npm-cache" npx --yes @gotcos/glasses-server@latest
     ```

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
   | Voice slow or unavailable | Local models not provisioned | `brew install whisper-cpp`, then run `npx --yes @gotcos/glasses-server@latest --setup-transcription --transcription-tier balanced`. Confirm health reports requested/effective tier, Small.en preview, Large-v3-Turbo commit, and Large-v3 HQ. Cloud fallback is deliberate opt-in only and requires both `COS_OPENAI_WHISPER_FALLBACK=1` and a configured `OPENAI_API_KEY`. |
   | App: "server update required" | Server older than app | Rerun `npx --yes @gotcos/glasses-server@latest` -- it pulls the latest. |
   | Token rejected after a URL change | Origin changed | Re-enter the token in the app (a new host never auto-receives your old token, by design). The token itself hasn't changed -- it's in `~/.cos-glasses/.env`. |
   | "Claude/Codex not found" | Desktop app is present, but the terminal CLI is missing | Claude: run `npm install -g @anthropic-ai/claude-code` on one line **without sudo**, then run `claude` and finish sign-in. Codex: verify `codex --version`, then `codex login`. |
   | npm `EACCES` / root-owned cache | A prior sudo npm install poisoned the shared cache | Never use sudo or broad `chown`. Retry with `npm_config_cache="$HOME/.cos-glasses/npm-cache" npx --yes @gotcos/glasses-server@latest`. Server 6.12.2+ never runs a nested install inside the npx cache. |
   | `@latest` starts an older server | npm reused stale metadata | Compare against `npm view @gotcos/glasses-server dist-tags.latest`, then restart with `npm_config_prefer_online=true` and the private COS cache command above. |

4. **Keep it current.**
   - Server: compare the running health version with the registry dist-tag; never assume the word `latest` proves which cached artifact launched.
   - App: update separately from the Even Hub on your iPhone. History and settings carry over; you don't re-pair.
   - App and server upgrade independently. A brief version-skew window is handled gracefully: normal Q&A keeps working, and the app just nudges you to rerun the server when a new capability needs it.

## First-use gesture training

Once connection and voice are verified, teach **tap, release, then quickly press and hold on the R1 touch surface**. Keep the second contact down until the Even SDK shortcut window slides above the current HUD. The page stays underneath; choosing Close returns to it. Scroll to a row, then tap to select. Demonstration timing is illustrative, not a firmware threshold.

- **Ask COS** opens a voice prompt. **Model** shows the current model and opens model selection, followed by reasoning effort.
- **Start Meeting** begins Meeting AI. During recording, **Resume Meeting** and **Stop Meeting** lead the menu.
- **Messages**, **Sessions**, **Tasks**, and **Home** are direct navigation shortcuts. Tasks is omitted from the hold menu while recording to fit the menu limit; it remains in Quick Actions.
- Even supplies **Display off**, **Brightness**, and **Close** around the COS rows. A user's saved row order may differ.
- Distinguish this SDK 0.0.14 context menu from **single-tap reader-footer actions** and the **Quick Actions page**. Older companion builds can have fewer shortcuts; verify their app version rather than promising every row.
- Use the [gesture walkthrough](https://www.gotcos.com/docs/#ring-path) and [hold-menu reference](https://www.gotcos.com/docs/#hold-menu). Do not start a meeting or submit a prompt merely to demonstrate a menu without the user's approval.

### Teach the context, not a universal gesture

- [Messages](https://www.gotcos.com/docs/#messages-ring): double-tap in the **open, idle reader** starts a referenced reply. In the **Messages list**, it goes to Quick Actions; select Record Message for a fresh transcription. Double-tap at Quick Actions starts a new command. Home double-tap requests system exit.
- **Tap confirmation is not a double-tap:** tap once to open the footer, read the choice, scroll if needed, then make a separate confirming tap. Keep this false-touch safeguard in every demonstration. Opening actions does not require reaching the bottom of the body first; show the reading path without inventing a bottom-of-viewport gate.
- The reader offers Messages and Reply; View image requires an attachment, lens preview enabled, and no meeting-critical capture. Its choices **stop at the ends**, unlike the wrapping one-row menus in [Sessions](https://www.gotcos.com/docs/#sessions-ring) and [Tasks](https://www.gotcos.com/docs/#tasks-ring).
- Tasks wrap from the last action to the first on **glasses 6.9.455+**. Verify the user's version. On older builds, scroll upward to return. Task actions depend on task/run state; a missing finish line disables Ask COS.
- Footer menus expire after three seconds without input. Reopen with a tap and read the selected row before confirming. Session detail double-tap instead asks for a second double-tap to leave for Quick Actions.
- [Ask COS](https://www.gotcos.com/docs/#ask-ring): starting dictation is not sending. Tap to finish, review the full transcript, then confirm Send. During capture a double-tap protects the draft. During an active run, cancellation normally takes two double-taps: arm, then confirm within three seconds. Read the footer; a watched job can explicitly advertise a ready reply instead.

## Rules
- Never start a second server instance or kill unrelated processes -- one server owns ports 3141/3143.
- Never use `sudo npm`, `sudo npx`, or recursively change npm/cache ownership. Use the isolated COS cache recovery command instead.
- Never print, paste, or commit the API token; it lives in `~/.cos-glasses/.env`.
- Don't diagnose a firewall problem from a Mac-to-its-own-mesh-IP timeout -- that's expected. Verify reachability from the phone.
