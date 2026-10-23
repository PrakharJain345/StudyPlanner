# TECHSTACK: AI-Powered Study Planner

Stack chosen for a TypeScript-everywhere codebase, fast solo development, and low hosting cost.

---

## 1. Architecture Overview

```
React SPA (Vite)  ──HTTPS──►  Node/Express API  ──►  MongoDB
                                   │
                                   ├──► Scheduler module (deterministic, TS)
                                   ├──► LLM service (topic breakdown, estimates, chat)
                                   ├──► Job queue (BullMQ + Redis): reminders, re-plans
                                   └──► Google Calendar / Email APIs
```

Monorepo with shared types between client and server.

```
/apps/web        React client
/apps/api        Express server
/packages/shared Zod schemas + TS types
/packages/scheduler  Pure scheduling engine (unit-testable, no I/O)
```

## 2. Frontend

| Concern | Choice | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Existing skill set |
| Build tool | Vite | Fast dev server and builds |
| Routing | React Router | Standard |
| Server state | TanStack Query | Caching, refetch, optimistic updates for session status |
| Client state | Zustand | Minimal; for UI and onboarding wizard state |
| Styling | Tailwind CSS + shadcn/ui | Fast, accessible components |
| Calendar UI | FullCalendar (or react-big-calendar) | Week/day views, drag-and-drop rescheduling |
| Charts | Recharts | Progress and dashboard charts |
| Forms | React Hook Form + Zod | Shared validation with backend |
| PWA | vite-plugin-pwa | Installable, offline today-view (v1.2) |
| Dates | date-fns + date-fns-tz | Timezone-safe scheduling |

## 3. Backend

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node.js 20 LTS | Existing skill set |
| Framework | Express + TypeScript | Familiar, simple (Fastify is a fine swap) |
| Validation | Zod | Single schema source shared with client |
| Auth | JWT (access + refresh rotation), bcrypt, Google OAuth via Passport | Standard, stateless |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize | Baseline hardening |
| Jobs | BullMQ + Redis | Reminders, scheduled re-plans, retries |
| Email | Resend (or Nodemailer + SMTP) | Reminder and digest emails |
| Push | Web Push (web-push library) | Browser notifications |
| Logging | pino | Structured logs |
| API docs | OpenAPI via zod-to-openapi | Keeps docs in sync with schemas |

## 4. Database

**MongoDB (Atlas free tier to start) + Mongoose**

- Document model fits goal → topic trees and session lists.
- Indexes: `Session(userId, start)`, `Session(userId, status)`, `Goal(userId, deadline)`, `Topic(goalId)`.
- Store all timestamps in UTC; keep the user's IANA timezone on the User document.
- `PlanVersion` collection stores re-plan diffs for undo and audit.

Alternative: PostgreSQL + Prisma if relational queries (analytics, joins) become heavy. Not needed for MVP.

**Redis** (Upstash or local): job queue, rate-limit store, caching LLM responses.

## 5. Scheduling Engine

Implemented as a pure TypeScript package (`packages/scheduler`), independent of the LLM.

- **Input:** goals, topics (difficulty, estimated hours), availability, blocked dates, preferences, existing session history.
- **Approach (MVP):** priority-scored greedy placement with constraint checks, interleaving, spaced-revision insertion, and buffer reservation.
- **Approach (later, if needed):** constraint solver (e.g., OR-Tools via a Python microservice, or `javascript-lp-solver`) for optimization.
- **Testing:** Vitest with property tests (fast-check) asserting: no overlaps, no sessions outside availability, nothing after deadline, daily cap respected.

Rationale: LLMs are unreliable at constraint satisfaction. The LLM suggests and explains; the scheduler decides.

## 6. AI / LLM Layer

| Use case | Method |
|---|---|
| Topic breakdown from goal or syllabus | LLM call with JSON schema output, validated by Zod |
| Effort and difficulty estimates | LLM call, user-overridable, cached per topic title |
| Natural-language plan changes | LLM tool-calling → structured actions (`blockDate`, `moveSession`, `changeDeadline`) → user confirms → scheduler applies |
| Plan explanation ("why this order?") | LLM given the scheduler's scoring output |
| Syllabus PDF parsing | `pdf-parse` for text extraction, then LLM topic extraction |

Implementation notes:
- Provider-agnostic `LLMService` interface (Anthropic API by default; swappable).
- Structured outputs only; reject and retry on schema validation failure (max 2 retries).
- Fallback: if the LLM fails, use default estimates (difficulty × base hours) so plan generation never blocks.
- Cache by hash of prompt input; per-user daily call limits to control cost.
- Never send PII beyond what's needed (topic titles and durations only).

## 7. Integrations

- **Google Calendar API** (OAuth): read busy slots, write sessions to a dedicated calendar. Start with ICS feed export (`ical-generator`) as the simple option.
- **Email:** Resend.
- **Web Push:** VAPID keys, service worker.

## 8. Testing

| Layer | Tool |
|---|---|
| Unit (scheduler, utils) | Vitest + fast-check |
| API integration | Vitest + Supertest + mongodb-memory-server |
| Component | React Testing Library |
| E2E | Playwright (onboarding → plan → mark session → re-plan) |
| LLM outputs | Fixture-based tests with mocked responses; a small eval set for breakdown quality |

## 9. DevOps and Hosting

| Concern | Choice |
|---|---|
| Frontend hosting | Vercel or Netlify |
| API hosting | Render / Railway / Fly.io |
| Database | MongoDB Atlas (M0 free tier) |
| Redis | Upstash |
| CI/CD | GitHub Actions: lint, typecheck, test, deploy on main |
| Containers | Docker + docker-compose for local dev (API, Mongo, Redis) |
| Monitoring | Sentry (errors), UptimeRobot (uptime) |
| Secrets | Platform env vars; `.env.example` committed |

## 10. Code Quality

- ESLint + Prettier, strict TypeScript (`strict: true`).
- Husky + lint-staged pre-commit hooks.
- Conventional Commits.
- pnpm workspaces for the monorepo.

## 11. Key API Endpoints (Draft)

```
POST   /auth/register | /auth/login | /auth/refresh | /auth/google
GET    /me                      PATCH /me/preferences

GET/POST/PATCH/DELETE  /goals
GET/POST/PATCH/DELETE  /goals/:id/topics
POST   /goals/:id/breakdown        # LLM topic tree

GET/PUT /availability
GET/POST/DELETE /blocked-dates

POST   /plan/generate               # full plan
POST   /plan/replan                 # triggered re-plan, returns diff
POST   /plan/apply                  # confirm diff
GET    /sessions?from=&to=
PATCH  /sessions/:id                # status, actual time, confidence

POST   /assistant/message           # NL → proposed actions
GET    /dashboard/summary
GET    /calendar/feed.ics
```

## 12. Build Order

1. Monorepo setup, shared Zod types, auth.
2. Goals/topics/availability CRUD + UI.
3. Scheduler package with tests; wire to `/plan/generate`.
4. Week/today views; session status updates.
5. Re-plan engine and diff UI.
6. LLM breakdown and estimates.
7. Reminders (BullMQ + email).
8. Dashboard, calendar sync, assistant chat.
