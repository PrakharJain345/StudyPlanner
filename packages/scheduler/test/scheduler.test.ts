import { describe, expect, it } from 'vitest';
import {
  AvailabilitySlot,
  Goal,
  PlanGenerationInput,
  Topic,
  UserPreferences,
} from '@ai-study-planner/shared';
import { addDays, format, parseISO } from 'date-fns';
import { generateSchedule } from '../src/engine.js';
import { replanSchedule } from '../src/replanner.js';

describe('Scheduler Engine', () => {
  const preferences: UserPreferences = {
    sessionLength: 50,
    breakLength: 10,
    maxHoursPerDay: 4,
    preferredTimeOfDay: 'evening',
    daysOff: [0], // Sunday off
    bufferPercent: 15,
    timezone: 'UTC',
  };

  // Availability: Mon-Fri 17:00 - 21:00 (4 hours/day)
  const availability: AvailabilitySlot[] = [1, 2, 3, 4, 5].map((day) => ({
    id: `slot_${day}`,
    userId: 'user1',
    dayOfWeek: day,
    startTime: '17:00',
    endTime: '21:00',
  }));

  const today = new Date();
  const deadline = addDays(today, 14);

  const goal: Goal = {
    id: 'goal_dsa',
    userId: 'user1',
    title: 'Data Structures & Algorithms',
    type: 'exam',
    deadline: deadline.toISOString(),
    priority: 5,
    targetProficiency: 'mastery',
    color: '#6366f1',
  };

  const topics: Topic[] = [
    {
      id: 't1',
      goalId: 'goal_dsa',
      title: 'Arrays & Two Pointers',
      difficulty: 2,
      estHours: 2,
      status: 'not_started',
      order: 1,
    },
    {
      id: 't2',
      goalId: 'goal_dsa',
      title: 'Binary Trees & Traversals',
      difficulty: 4,
      estHours: 3,
      status: 'not_started',
      order: 2,
    },
    {
      id: 't3',
      goalId: 'goal_dsa',
      title: 'Dynamic Programming',
      difficulty: 5,
      estHours: 4,
      status: 'not_started',
      order: 3,
    },
  ];

  it('generates non-overlapping sessions within availability', () => {
    const input: PlanGenerationInput = {
      userId: 'user1',
      goals: [goal],
      topics,
      availability,
      blockedDates: [],
      preferences,
      startDate: today,
      horizonWeeks: 3,
    };

    const result = generateSchedule(input);
    expect(result.sessions.length).toBeGreaterThan(0);
    expect(result.feasibility).toBe('feasible');

    // Verify no overlaps
    for (let i = 0; i < result.sessions.length - 1; i++) {
      const curEnd = new Date(result.sessions[i].end).getTime();
      const nextStart = new Date(result.sessions[i + 1].start).getTime();
      expect(nextStart).toBeGreaterThanOrEqual(curEnd);
    }

    // Verify within availability & not on days off
    for (const session of result.sessions) {
      const sessionDate = parseISO(session.start);
      expect(sessionDate.getDay()).not.toBe(0); // Sunday off
      expect(sessionDate.getHours()).toBeGreaterThanOrEqual(17);
      expect(new Date(session.end).getTime()).toBeLessThanOrEqual(new Date(goal.deadline).getTime());
    }
  });

  it('respects blocked dates', () => {
    const blockedDay = addDays(today, 2);
    const blockedStr = format(blockedDay, 'yyyy-MM-dd');

    const input: PlanGenerationInput = {
      userId: 'user1',
      goals: [goal],
      topics,
      availability,
      blockedDates: [
        {
          id: 'b1',
          userId: 'user1',
          startDate: `${blockedStr}T00:00:00.000Z`,
          endDate: `${blockedStr}T23:59:59.000Z`,
          reason: 'Midterm exams',
        },
      ],
      preferences,
      startDate: today,
    };

    const result = generateSchedule(input);
    for (const session of result.sessions) {
      const sessionDate = format(parseISO(session.start), 'yyyy-MM-dd');
      expect(sessionDate).not.toBe(blockedStr);
    }
  });

  it('re-plans adaptively and preserves past/completed sessions', () => {
    const input: PlanGenerationInput = {
      userId: 'user1',
      goals: [goal],
      topics,
      availability,
      blockedDates: [],
      preferences,
      startDate: today,
    };

    const initialResult = generateSchedule(input);
    expect(initialResult.sessions.length).toBeGreaterThan(2);

    // Simulate marking first session as done
    const firstSession = { ...initialResult.sessions[0], status: 'done' as const };
    const remainingSessions = [firstSession, ...initialResult.sessions.slice(1)];

    const replanResult = replanSchedule({
      ...input,
      existingSessions: remainingSessions,
      trigger: 'session_skipped',
    });

    expect(replanResult.diff).toBeDefined();
    expect(replanResult.diff?.summary).toContain('rescheduled');
  });
});
