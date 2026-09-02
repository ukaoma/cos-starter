---
description: Start-of-day brief -- calendar, meeting decisions, tasks due, and who is waiting on you
argument-hint: "[YYYY-MM-DD]"
---

# /morning-brief -- Start-of-Day Brief

## When to Use
- First thing each work day, or when COS Glasses runs it for you on a schedule
  (server 6.43.0+ fires this automatically and drops the result in the inbox;
  configure the time and sources in COS Control or the companion app)
- After a day away, to catch up on what moved
- Usage: `/morning-brief` or `/morning-brief 2026-09-01` for a specific day

## Rules (read first)
- **Nobody is watching this run.** Do not ask questions. Do not pause for
  confirmation. Do not stop early.
- **Read-only.** Never send a message or email, create or change a calendar
  event, edit a task, or write files.
- **Evidence only.** Every line comes from something you actually read. When a
  source cannot be read, write one line -- `Calendar: unavailable (reason)` --
  and move on. Never invent a meeting, a message, a number, or a name.
- **Hard edges only.** An aside is not a finding. Include an item only if it has
  a decision, a date, a dollar figure, or an owner.

## Steps

1. **Establish the date.** Run `date '+%Y-%m-%d %A %H:%M %Z'`. If an argument
   was given, use that day instead. On a Monday, "the last business day" means
   Friday.

2. **CALENDAR.** Read every calendar this workspace can reach (connectors,
   local calendar helpers, cached calendar files). Today's commitments in time
   order, one line each: start time, title, who it is with when that matters.
   Name the first commitment and how much open time exists before it.

3. **FROM RECENT MEETINGS.** Look in `meetings/` folders (and any meeting
   connector) for the last three days. Read each meeting's summary and
   decisions. Surface only items with a hard edge: a decision that was made, a
   deadline inside the next seven days, a dollar figure, a named owner. Three
   to five items ranked by consequence. Never paste an extracted action-item
   list verbatim; when a number or date matters, quote it from the transcript.
   If nothing decision-grade happened, say so in one line.

4. **DUE.** Scan every `operations/*/tasks.md`. Open tasks due within seven
   days, overdue first. One line each: the task, the owner if not you, the
   date. Cap at seven. Skip anything marked done.

5. **WAITING ON YOU.** Across every channel this workspace can read (Slack,
   email, chat connectors), from the last seven days: direct mentions with no
   reply from you, questions addressed to you with no answer beneath them,
   threads that moved after your last message. Up to five, ranked by
   consequence; each line names the channel or sender, who is waiting, and the
   ask. Never claim something is "unread" -- report only what is verifiable.

6. **Close.** One line beginning `Order your energy:` naming the single
   posture for the day, grounded in the sections above.

## Output Format

Plain text, glasses-ready. No markdown headings, tables, or bullet symbols. A
section is its label on one line followed by short lines (under 60 characters
where you can). Whole brief under about 60 lines; trim from the bottom of a
section, not the top. No preamble, no sign-off, never "here is" or "I found".

```
CALENDAR
09:00 Standup (team), 30 min
11:30 Renewal call, Dana @ Northwind
First commitment 09:00; 90 min open before it

FROM RECENT MEETINGS
Pricing page ships Thu 9/4, owner Graham
Northwind renewal: $18k/yr, decision due Fri 9/5

DUE
Overdue: Q3 board deck outline (was 8/29)
Wed 9/3: Send MSA redline to legal

WAITING ON YOU
#growth (Sam): approve the paid budget shift?
Email (Dana): needs the renewal quote by Thu

Order your energy: close Northwind first; everything else waits on that call.
```

## Personalising it
This skill is the default set of sources. COS Glasses server 6.43.0+ composes
the scheduled brief from a source list you control -- turn sections on or off,
reorder them, change their windows, add an opening reading, a metrics pulse, a
health line, or a custom section -- and can run THIS skill (or any skill of
yours) as the whole brief. Configure it in COS Control or the companion app,
or with `PUT /api/morning-brief`.
