# Changelog

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
