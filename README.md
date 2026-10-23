# PlanMind AI — Adaptive Study Planner & Intelligent Scheduler

An intelligent, deterministic college study scheduler that dynamically balances exam goals, syllabus topics, and weekly student availability with automated buffer protection and 1-click re-planning.

## Monorepo Architecture

```
AI-studyPlanner/
├── apps/
│   ├── api/        # Express REST API, in-memory persistence & demo seed
│   └── web/        # React + Vite frontend with Tailwind CSS
└── packages/
    ├── shared/     # Shared TypeScript interfaces & Zod validation schemas
    └── scheduler/  # Deterministic scheduling engine & buffer re-planning algorithms
```

## Features

- **Adaptive Scheduling Engine:** Deterministically allocates study sessions based on topic difficulty, energy curves, and deadlines.
- **AI Syllabus Breakdown:** Parses raw syllabus outlines into structured modules with estimated hours.
- **Today Focus & Task Checkboxes:** Clear daily view with 1-click completion toggles, Pomodoro timer, and filters.
- **7-Day Master Calendar:** Visual weekly schedule with in-calendar completion controls.
- **Buffer Protection & 1-Click Re-Planning:** Automatically re-routes remaining topics into open buffer slots when life happens.
- **Mastery Analytics & Radar:** Track study velocity, habit streak, and topic retention over time.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Servers
```bash
# Starts both Express API (:3001) and Vite Web (:5173)
npm run dev
```

### 3. Run Tests
```bash
npm test
```
