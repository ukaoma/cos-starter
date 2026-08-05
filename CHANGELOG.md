# Changelog

## 0.4.4 - 2026-08-05

### Changed
- COS Control 0.3.8 build 30 exposes and persists the server 6.21.7 Meeting
  Turbo preview canary. Provisional text arrives before the canonical
  speaker-attributed Large-v3 transcript and can be rolled back independently.
- The versioned download, latest alias, SHA-256, appcast, Control page, and
  setup documentation now agree on the same release.

## 0.4.3 - 2026-08-03

### Changed
- COS Control 0.3.5 build 27 and glasses-server 6.21.1 are the public hotfix pair. Managed updates and transcription-tier changes now use a bounded Claude Haiku readiness proof, preserve the real timeout/cancel result, and show an in-progress recovery-armed state instead of falsely demanding Repair.
- COS Control 0.3.5 and glasses-server 6.21.1 add a machine-owned Balanced / Max transcription choice. Balanced remains the default; Max reuses the resident Large-v3 worker for live commit on powerful Macs and falls back visibly to Turbo when unavailable.
- Guided Setup, the public wizard, docs, Starter skill, Control panel illustration, download hash, and appcast now describe the same two-tier policy. Control activates tier changes through a verified restart with rollback.
- Agent CLI diagnostics use Control's local Cursor probe so the caption can show Cursor's real build when the server only reports “About Cursor CLI.”
- The glasses app remains 6.8.276; this train changes no EHPK, SDK, route, or package identity.

## 0.4.2 - 2026-08-02

### Changed
- COS Control 0.3.4 and glasses-server 6.20.1 are now the public pair. Control no longer falsely rolls back a healthy update when Claude and Codex use their normal verification time, and interrupted Whisper model downloads resume safely.
- The Control page, appcast, versioned download, latest alias, verification hash, and server setup documentation now agree on the same release.

## 0.4.1 - 2026-08-02

### Changed
- The public wizard, glasses starter skill, docs, and COS Control setup now use the server's adaptive transcription setup: Small.en for provisional lens text, Large-v3-Turbo for the committed live transcript, and Large-v3 for HQ meeting polish.
- Wizard identity setup now collects real names and specialist vocabulary, writes the server's canonical `system_prompt_context` profile key, and avoids the placeholder vocabulary that silently degraded transcription accuracy.
- COS Control 0.3.3 targets glasses-server 6.20.0 and reports the effective Live Preview, Live Commit, and HQ Polish models, including truthful fallback and unavailable states.

## 0.4.0 - 2026-07-27

### Added
- `/challenge` - the Glasses Challenge landing page, shipped in waitlist state. Two-tier entry (Answer wins the Even G2 and is open only to entrants who do not already own a pair; Proof wins a featured case study, a recorded session, and credit), a published per-tier judging rubric, a capture how-to that accounts for the G2 having no camera, and a short rules section covering eligibility, the public/private entry choice, and the media license. The waitlist form posts to the shared HubSpot form (portal 2474026, form c5439911) with the track and inbound UTMs in context, and passes `hubspotutk` as `context.hutk` so submissions attribute to their source.
- `/giveaway` - client redirect stub to `/challenge` (canonical, noindex, query and hash preserved), matching the `/readiness` pattern.
- "Glasses Challenge" added to the footer nav sitewide (15 pages) and to `llms.txt`.

## 0.3.0 — 2026-07-21

### Changed
- Readiness quiz replaced by the COS Blueprint. `/readiness` now client-redirects to `/blueprint` (canonical, noindex, query and hash preserved). "COS Blueprint" replaces "Readiness" in the header nav on 6 pages and is added to the footer nav sitewide. The homepage and body CTAs that pointed at `/readiness` now point at `/blueprint`.
- Blueprint gate swapped from the placeholder $49 Stripe checkout to the shared HubSpot email gate (portal 2474026, form c5439911). Submitting reveals the on-screen build plan and sets the shared `cos_kit_access` unlock, so the starter kit unlocks too. Emailed fulfillment of the plan and personalized starter kit is a HubSpot follow-up workflow on that form (pending the MU-HC-COS-MCP private-app token).
- Removed `/readiness` from `sitemap.xml` and repointed `llms.txt` to `/blueprint`.

## 0.2.0 — 2026-07-13

### Added
- `/cos-glasses` starter skill — starts the COS Glasses server, health-checks it (`/api/health` status; `serverInstanceId` via the authenticated `/api/models` probe; ports 3141/3143), keeps it on the latest release via `npx`, and troubleshoots connection/photo/voice issues by symptom. Wired into the interactive setup (cos-starter.md), the wizard, and the docs so every setup path points users to create it.
- `/glasses-day` starter skill (optional) — pulls a day of COS Glasses questions and answers into a Claude Code / Codex session via the server's read-only day-archive endpoints (`GET /api/archive/:date/messages`, `/chats`, `POST /api/archive/now`), so users can continue at the desk what they started on the glasses. Wired into the interactive setup, the wizard, and the docs.
- Starter Kit unlock on the homepage — Copy/View the kit now opens a one-email unlock card (email required; role and industry optional) that posts to the site's HubSpot form before the kit is released. Unlock persists in localStorage (`cos_kit_access`) and is shared across every capture surface, so nobody is asked twice.
- Wizard "Keep this build" capture — the build-plan result card now offers an email signup that carries the wizard picks (name, role, company, model, voice, context, HUD) into the CRM record.
- Readiness gate wired — the score gate's email step now posts to the HubSpot form with the score, team size, and AI stage in context (it previously collected an email and sent it nowhere). A valid email is required to reveal the score; the reveal itself never blocks on a failed network call.
- Docs subscribe, homepage For Teams, wizard capture, and readiness gate all set the shared unlock, so one email anywhere unlocks the kit everywhere.

## 0.1.0 — 2026-03-20

### Added
- Initial release: individual COS setup
- Interactive setup prompt (cos-starter.md)
- Starter skills: /start, /learn, /prep, /connect
- Coverage gap self-assessment framework (14 domains)
- Interactive philosophy diagram
- Integration templates: Slack, Google Workspace, meetings
- Solo executive example (VP of Product reference implementation)
- Getting started documentation
