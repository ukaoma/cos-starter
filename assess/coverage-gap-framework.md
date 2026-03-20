# COS Coverage Gap Framework

## The Thesis

> "The AI model's theoretical capability dwarfs its actual use."
> — Kieran Flanagan, citing Anthropic research (March 2026)

The same gap that exists across occupational categories exists within every executive's workflow. Companies don't need more model capabilities — they need someone to redesign the factory floor.

**That's what COS does.** The radar chart below replaces occupational categories with **chief of staff functional domains**. Three observation layers:

- **Theoretical AI Coverage** (blue) — What current AI can technically do with proper integration
- **Observed Coverage** (red) — What the system is actually doing today
- **The Gap** — Each gap is a workstream. Closing gaps = the engagement.

---

## The 14 COS Functional Domains

These are the axes of the radar chart. Universal to any executive, any industry.

| # | Domain | What It Covers |
|---|--------|---------------|
| 1 | **Meeting Intelligence** | Capture, classify, extract insights, search by meaning |
| 2 | **Task Orchestration** | Extract from conversations, dedup, stage, track, complete |
| 3 | **Email & Comms Triage** | Prioritize inbox, draft responses, flag urgency, follow-up tracking |
| 4 | **Calendar Awareness** | Schedule context, conflict detection, prep automation, time blocking |
| 5 | **People Intelligence** | Profiles, communication styles, relationship health, engagement history |
| 6 | **Cross-Source Synthesis** | Connect signals across meetings + email + tasks + Slack + calendar |
| 7 | **Strategic Alignment** | Goal tracking, resource allocation, priority scoring, domain balance |
| 8 | **Proactive Alerting** | Early warnings, signal detection, ambient reminders, anomaly flagging |
| 9 | **Institutional Memory** | Session persistence, correction compounding, decision history |
| 10 | **Delegation & Follow-up** | Track who owes what, escalation cadence, accountability loops |
| 11 | **Content & Research** | Market intel, competitor tracking, data gathering, document creation |
| 12 | **Reporting & Dashboards** | Status updates, briefings, visual dashboards, presentations |
| 13 | **Knowledge Management** | File organization, knowledge base, templates, SOPs, documentation |
| 14 | **Ambient I/O** | Multi-surface delivery — terminal, mobile, wearable, TUI, voice |

---

## Scoring Methodology

Each domain is scored **0.0 → 1.0** across three dimensions:

### Theoretical AI Coverage (What's Possible)
Score based on current AI capabilities (Claude, MCPs, integrations) assuming proper implementation:

| Score | Meaning |
|-------|---------|
| 0.9-1.0 | AI can fully handle with minimal human oversight |
| 0.7-0.8 | AI can handle most cases, human needed for edge cases |
| 0.5-0.6 | AI assists significantly but requires regular human judgment |
| 0.3-0.4 | AI provides some automation but mostly human-driven |
| 0.1-0.2 | AI barely applicable or very early-stage capability |

### Observed Coverage (What's Actually Happening)
Score based on what the system does TODAY — automation, consistency, and value delivered:

| Score | Meaning |
|-------|---------|
| 0.9-1.0 | Fully automated, self-improving, proactive |
| 0.7-0.8 | Automated with manual triggers, reliable, covers most cases |
| 0.5-0.6 | Partially automated, some manual steps, inconsistent coverage |
| 0.3-0.4 | Mostly manual with some AI assistance |
| 0.1-0.2 | Manual process, AI barely involved |
| 0.0 | Not addressed at all |

### Gap Score
`Gap = Theoretical - Observed`

| Gap | Priority |
|-----|----------|
| > 0.4 | **Critical** — High-impact workstream, immediate ROI |
| 0.2-0.4 | **Strategic** — Meaningful improvement, planned workstream |
| < 0.2 | **Optimization** — Fine-tuning, not a priority |

---

## Reference Implementation

The "what good looks like" benchmark — a mature COS instance with a comprehensive Python codebase, dozens of automation scripts, and hundreds of indexed meetings.

| # | Domain | Theoretical | Observed | Gap | Notes |
|---|--------|:-----------:|:--------:|:---:|-------|
| 1 | Meeting Intelligence | 0.90 | **0.85** | 0.05 | Meeting transcription tools → classify → extract → semantic search. Hundreds indexed. Near-ceiling. |
| 2 | Task Orchestration | 0.85 | **0.70** | 0.15 | Staging system works, but completion detection gap. Extraction without reconciliation creates stale backlogs. |
| 3 | Email & Comms Triage | 0.80 | **0.45** | 0.35 | Gmail + AppleScript sync exists, but triage/draft/auto-respond is manual. Cross-ref works via email-intel skill. |
| 4 | Calendar Awareness | 0.75 | **0.60** | 0.15 | EventKit pull, daily schedule in dashboard, prep push daemon. No auto-scheduling or time-block optimization. |
| 5 | People Intelligence | 0.80 | **0.75** | 0.05 | 70+ profiles in people context. Profile lookup skills. Communication style + engagement tips. Near-ceiling for current scope. |
| 6 | Cross-Source Synthesis | 0.85 | **0.65** | 0.20 | Multi-source roundtable and intel skills exist. 10-source parallel gather. But requires manual trigger — not ambient. |
| 7 | Strategic Alignment | 0.75 | **0.55** | 0.20 | Domain allocation tracking, weekly planner, signals. But goal tracking is passive, no automated priority scoring. |
| 8 | Proactive Alerting | 0.80 | **0.60** | 0.20 | Signal detector (6 categories), thread tracker, daily reflection push. But alerts are pull-based (dashboard), not push. |
| 9 | Institutional Memory | 0.85 | **0.80** | 0.05 | Bot memory (90+ entries), correction journal (35+ corrections), /learn skill, precompact handover. Core strength. |
| 10 | Delegation & Follow-up | 0.75 | **0.35** | 0.40 | Tasks have owners, but no follow-up cadence, no escalation automation, no "person X owes you Y by Friday" tracking. |
| 11 | Content & Research | 0.70 | **0.50** | 0.20 | Semantic search, recon skill, video clips pipeline, competitive intel. But research is reactive, not systematized. |
| 12 | Reporting & Dashboards | 0.75 | **0.70** | 0.05 | Custom dashboard (17 views), mobile notification gateway, wearable integration, report generation. Strong presentation layer. |
| 13 | Knowledge Management | 0.70 | **0.45** | 0.25 | Files exist but no systematic KM. No auto-tagging, no doc lifecycle, no template management beyond skills. |
| 14 | Ambient I/O | 0.60 | **0.50** | 0.10 | Custom dashboard, mobile notification gateway, wearable integration (v1). Wearable still display-only. Voice I/O planned. |

### Reference Implementation Coverage Summary
- **Theoretical average:** 0.78
- **Observed average:** 0.60
- **Average gap:** 0.17
- **Critical gaps (>0.4):** Delegation & Follow-up
- **Strategic gaps (0.2-0.4):** Email Triage, Cross-Source Synthesis, Strategic Alignment, Proactive Alerting, Knowledge Management, Content & Research

---

## How to Use This Framework

### For Self-Assessment
1. Score yourself 0-1.0 on each of the 14 domains (Observed)
2. Theoretical scores are pre-filled (same for everyone)
3. Your radar chart instantly shows where the gaps are
4. Biggest gaps = where to start building

### For Client Engagements
1. **Discovery:** Score the client's current state across all 14 domains
2. **Scope:** Gaps > 0.4 become Phase 1 workstreams, 0.2-0.4 become Phase 2-3
3. **Progress tracking:** Re-score monthly. The radar should visibly expand.
4. **Upsell surface:** Gaps that require infrastructure (CRM, website, automation) → partner referrals

### For Workshops
1. Show the Flanagan/Anthropic radar chart (occupational categories)
2. "Now imagine this same chart for YOUR workflow"
3. Live exercise: attendees self-score 3-4 domains
4. Reveal the reference implementation radar
5. "The distance between red and blue is what we're building"

---

## Visual Specification

The radar chart should match the Anthropic/Flanagan aesthetic:
- **Blue polygon** = Theoretical AI Coverage (outer boundary)
- **Red polygon** = Observed AI Coverage (inner, smaller)
- **14 axes** radiating from center, labeled with domain names
- **Scale:** 0.0 (center) to 1.0 (edge)
- **Gridlines** at 0.2, 0.4, 0.6, 0.8, 1.0
- **Fill:** Blue = semi-transparent blue fill, Red = semi-transparent red fill
- **Legend:** Bottom-right corner

For client presentations: overlay a third polygon (green, dashed) showing "Target State" at engagement end.

---

## Connection to COS Tiers

The coverage gap framework maps directly to the commercial tier progression:

| Tier | Typical Starting Coverage | Target Coverage | Domains Primarily Affected |
|------|:------------------------:|:---------------:|---|
| **Tier 1: Blueprint** (entry-level) | 0.00-0.05 | 0.15-0.25 | Meeting Intel (basic), Task Orch (basic), People Intel (basic), Memory (basic) |
| **Tier 2: Accelerator** (mid-tier) | 0.15-0.25 | 0.35-0.50 | + Email, Calendar, Content, Reporting, KM |
| **Tier 3: Architect** (premium) | 0.35-0.50 | 0.55-0.70 | + Cross-Source, Strategic, Alerting, Delegation |
| **Tier 4: Deploy** (enterprise) | 0.00-0.15 | 0.60-0.80 | All 14 domains, custom to organization |
| **Reference Implementation** | N/A | 0.60 (current) | Continuous improvement toward 0.78 theoretical ceiling |

**Key insight:** No one reaches 1.0. The theoretical ceiling itself moves as AI capabilities improve. The value proposition isn't perfection — it's closing the gap faster than competitors.

---

## Electricity Analogy (From Flanagan's Post)

> "By 1900, electricity had been available for nearly 20 years, yet less than 5% of American factories used it."

The COS coverage gap is the same story:

| Era | Electricity | AI Chief of Staff |
|-----|------------|-------------------|
| **Available but unused** | Factories had access to electricity but kept steam layouts | Executives have Claude/GPT but keep manual workflows |
| **Swap, don't redesign** | Early adopters just replaced steam engines with electric motors, same layout | Early adopters use AI for one-off tasks (write this email, summarize this doc) |
| **Redesign the floor** | Productivity explosion came from redesigning factory layout around electricity | COS redesigns the entire executive workflow around AI — meeting → task → delegation → follow-up → learning |
| **Competitive advantage** | Factories that redesigned first dominated | Executives/companies that close the coverage gap first have outsized advantage |

The COS workshop teaches people to redesign the factory floor. The coverage gap framework shows them exactly where their floor is broken.
