# PRD: AI-Powered Study Planner

**Version:** 1.0 | **Status:** Draft | **Owner:** Prakhar

---

## 1. Overview

A web app that turns a student's goals, deadlines, and weekly availability into a personalized, adaptive study schedule. The schedule re-plans automatically when the student misses sessions, deadlines change, or progress differs from the estimate.

## 2. Problem

- Students juggle multiple subjects, exams, and assignments with no realistic plan.
- Static timetables break the first time a session is missed.
- Estimating effort per topic is hard; most students over-commit and fall behind.
- Existing tools (Notion, Google Calendar, Todoist) store tasks but don't plan.

## 3. Target Users

| Persona | Need |
|---|---|
| College student (primary) | Balance semester subjects, assignments, and exam prep |
| Competitive exam / placement aspirant | Long-horizon plan across large syllabi (e.g., DSA, GATE, CAT) |
| Self-learner | Structured plan for a course or skill with a target date |

## 4. Goals and Non-Goals

**Goals**
- Generate a usable schedule in under 3 minutes from signup.
- Keep the schedule feasible: never exceed stated availability.
- Adapt automatically to missed or rescheduled sessions.
- Show clear progress toward each goal.

**Non-Goals (v1)**
- Native mobile apps (responsive web + PWA only).
- Social/group study features.
- Content delivery (videos, notes). The app plans; it doesn't teach.
- Payments.

## 5. User Stories

1. As a student, I add goals (subject/exam/project) with a deadline and priority so the planner knows what matters.
2. As a student, I enter my weekly availability and blocked times so sessions fit my real life.
3. As a student, I paste or upload a syllabus so topics are extracted without manual entry.
4. As a student, I get a day/week schedule of study sessions with specific topics.
5. As a student, I mark a session done, partial, or skipped, and the plan adjusts.
6. As a student, I see how on-track I am for each deadline.
7. As a student, I get reminders before sessions.
8. As a student, I sync the plan to Google Calendar.

## 6. Functional Requirements

### 6.1 Auth and Onboarding (P0)
- Email/password and Google OAuth.
- Onboarding wizard: goals → availability → preferences → generate plan.

### 6.2 Goals and Topics (P0)
- CRUD for goals: title, type (exam / assignment / project / skill), deadline, priority (1–5), target proficiency.
- Each goal has topics/subtopics with optional estimated hours and difficulty (1–5).
- AI topic breakdown: given a goal title or syllabus text, generate a topic tree the user can edit.

### 6.3 Availability and Preferences (P0)
- Weekly recurring availability slots.
- One-off blocked dates (exams, travel, events).
- Preferences: session length (25–120 min), break length, max hours/day, preferred time of day, days off.

### 6.4 Schedule Generation (P0)
- Inputs: goals, topics, deadlines, difficulty, availability, preferences.
- Output: list of sessions `{goal, topic, start, end, type}`; types: learn, practice, revise, buffer.
- Constraints (hard): within availability, before deadline, respects max hours/day.
- Objectives (soft): prioritize nearer deadlines and higher priority, interleave subjects, place harder topics at preferred peak time, schedule spaced revision, leave 10–15% buffer.
- Deterministic scheduler produces the plan; LLM handles estimation and explanation (see TECHSTACK.md).

### 6.5 Adaptive Re-planning (P0)
- Triggers: skipped session, partial completion, deadline change, new goal, availability change.
- Re-plan only affected future sessions; never alter past sessions.
- Show a diff ("3 sessions moved") before applying large changes.

### 6.6 Session Tracking (P0)
- Statuses: pending, done, partial, skipped.
- Optional self-rating (confidence 1–5) after a session, feeding revision scheduling.

### 6.7 Views (P0)
- Today view, week calendar, goal detail view with progress.
- Dashboard: completion rate, streak, hours studied, deadline risk (on-track / at-risk / behind).

### 6.8 Notifications (P1)
- Email and browser push reminders for upcoming sessions and at-risk deadlines.
- Daily digest option.

### 6.9 Calendar Sync (P1)
- One-way export to Google Calendar; ICS feed as fallback.
- Import busy slots from Google Calendar as blocked time.

### 6.10 AI Assistant (P1)
- Chat input for plan changes: "I'm unavailable Friday", "move OS revision earlier".
- LLM converts the request into structured actions; the user confirms before applying.

### 6.11 Syllabus Import (P1)
- PDF/text upload → topic extraction → editable topic tree.

### 6.12 Pomodoro Timer (P2)
- In-session timer that auto-logs actual study time.

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Schedule generation < 5 s for 10 goals / 200 topics / 12 weeks; page load < 2 s |
| Reliability | 99% uptime target; LLM failure falls back to default estimates |
| Security | Hashed passwords, JWT with refresh rotation, input validation, rate limiting |
| Privacy | User data scoped per account; delete-account removes all data; no study data used for model training |
| Accessibility | WCAG 2.1 AA basics; keyboard navigable |
| Responsiveness | Fully usable at 360 px width |

## 8. Scheduling Logic (Summary)

1. **Estimate:** effort per topic = base hours × difficulty factor, refined by LLM and user overrides.
2. **Allocate:** compute total required hours per goal vs. available hours before the deadline. Flag infeasible goals early.
3. **Order:** score topics by `priority × urgency × difficulty`. Urgency rises as the deadline nears.
4. **Place:** fill availability slots greedily, interleaving subjects, respecting constraints.
5. **Revise:** insert spaced revision sessions (e.g., +1, +3, +7, +14 days) after a topic is learned.
6. **Buffer:** reserve slack before each deadline.
7. **Re-plan:** on triggers, rerun steps 3–6 over the remaining horizon.

Infeasibility handling: if required hours exceed available hours, tell the user the shortfall and offer options (extend deadline, add availability, drop low-priority topics).

## 9. Data Model (High Level)

- **User** — profile, preferences, timezone
- **Goal** — userId, title, type, deadline, priority
- **Topic** — goalId, parentId, title, difficulty, estHours, status
- **AvailabilitySlot** — userId, weekday, startTime, endTime
- **BlockedDate** — userId, start, end, reason
- **Session** — userId, goalId, topicId, start, end, type, status, actualMinutes, confidence
- **PlanVersion** — userId, createdAt, reason, diff (audit trail for re-plans)
- **Notification** — userId, sessionId, channel, sendAt, status

## 10. Success Metrics

| Metric | Target (3 months post-launch) |
|---|---|
| Onboarding → first plan generated | ≥ 70% |
| Weekly session completion rate | ≥ 60% |
| 4-week retention | ≥ 30% |
| Plans re-planned at least once | ≥ 50% (shows adaptivity is used) |
| Median time to first plan | < 3 min |

## 11. Release Plan

| Phase | Scope | Duration |
|---|---|---|
| **MVP** | Auth, goals/topics, availability, rule-based scheduler, session tracking, today/week views | 3–4 weeks |
| **v1.0** | LLM topic breakdown + effort estimates, adaptive re-planning, dashboard, email reminders | 3 weeks |
| **v1.1** | Google Calendar sync, syllabus import, chat assistant, push notifications | 3 weeks |
| **v1.2** | Pomodoro timer, analytics, PWA offline support | 2 weeks |

## 12. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| LLM effort estimates are inaccurate | Allow user overrides; learn from actual vs. estimated time |
| Over-packed schedules cause burnout | Hard daily cap, mandatory breaks and buffer |
| LLM cost and latency | Use LLM only for breakdown/estimation/chat; scheduler is deterministic; cache results |
| Users abandon after missed days | Gentle re-plan flow, no guilt UI, "reset week" option |
| Calendar API complexity | Ship ICS export first; OAuth sync later |

## 13. Open Questions

- Target audience at launch: college students only, or exam aspirants too?
- Free vs. paid tier boundaries, if monetized.
- Should spaced-repetition intervals be user-configurable?
- Multi-timezone support in v1?
