import {
  AvailabilitySlot,
  BlockedDate,
  Goal,
  PlanGenerationInput,
  PlanGenerationResult,
  PreferredTimeOfDay,
  Session,
  Topic,
  UserPreferences,
} from '@ai-study-planner/shared';
import {
  addDays,
  addMinutes,
  differenceInHours,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isWithinInterval,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';
import { calculateTopicScore } from './scorer.js';

interface TimeWindow {
  start: Date;
  end: Date;
}

/**
 * Checks if a given time of day matches the user's preferred peak study time.
 */
function isPreferredTimeSlot(date: Date, preferred: PreferredTimeOfDay): boolean {
  const hour = date.getHours();
  switch (preferred) {
    case 'morning':
      return hour >= 6 && hour < 12;
    case 'afternoon':
      return hour >= 12 && hour < 17;
    case 'evening':
      return hour >= 17 && hour < 22;
    case 'night':
      return hour >= 22 || hour < 4;
    default:
      return true;
  }
}

/**
 * Checks if a candidate date falls within any blocked date range.
 */
function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
  for (const blocked of blockedDates) {
    const start = parseISO(blocked.startDate);
    const end = parseISO(blocked.endDate);
    if (isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end)) {
      return true;
    }
  }
  return false;
}

/**
 * Generates available daily time windows from recurring weekly slots.
 */
function generateDailyTimeWindows(
  day: Date,
  availability: AvailabilitySlot[],
  preferences: UserPreferences,
  blockedDates: BlockedDate[]
): TimeWindow[] {
  const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Check if day is user day off or blocked date
  if (preferences.daysOff.includes(dayOfWeek) || isDateBlocked(day, blockedDates)) {
    return [];
  }

  const matchingSlots = availability.filter((slot) => slot.dayOfWeek === dayOfWeek);
  const windows: TimeWindow[] = [];

  for (const slot of matchingSlots) {
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);

    const slotStart = setMinutes(setHours(startOfDay(day), startH), startM);
    const slotEnd = setMinutes(setHours(startOfDay(day), endH), endM);

    if (isAfter(slotEnd, slotStart)) {
      windows.push({ start: slotStart, end: slotEnd });
    }
  }

  // Sort by start time
  windows.sort((a, b) => a.start.getTime() - b.start.getTime());
  return windows;
}

export function generateSchedule(input: PlanGenerationInput): PlanGenerationResult {
  const {
    userId,
    goals,
    topics,
    availability,
    blockedDates = [],
    preferences,
    existingSessions = [],
    startDate = new Date(),
    horizonWeeks = 8,
  } = input;

  const warnings: string[] = [];
  const now = new Date();

  // 1. Separate past/completed sessions (must not be altered) from pending future ones
  const lockedSessions = existingSessions.filter(
    (s) => s.status === 'done' || isBefore(parseISO(s.start), now)
  );

  // 2. Identify remaining topics that require scheduling
  // Check how many hours have already been completed for each topic
  const completedHoursByTopic: Record<string, number> = {};
  for (const session of lockedSessions) {
    if (session.topicId && session.status === 'done') {
      const minutes = session.actualMinutes ?? differenceInMinutes(parseISO(session.end), parseISO(session.start));
      completedHoursByTopic[session.topicId] = (completedHoursByTopic[session.topicId] || 0) + minutes / 60;
    }
  }

  // Pending topics with remaining hours
  interface PendingTopicItem {
    topic: Topic;
    goal: Goal;
    remainingHours: number;
    completedHours: number;
    learnedSessionsCount: number;
  }

  const pendingTopics: PendingTopicItem[] = [];
  const goalMap = new Map<string, Goal>();
  for (const goal of goals) {
    goalMap.set(goal.id, goal);
  }

  let totalRequiredHours = 0;
  for (const topic of topics) {
    const goal = goalMap.get(topic.goalId);
    if (!goal) continue;

    const completed = completedHoursByTopic[topic.id] || 0;
    const est = topic.estHours || 2;
    const remaining = Math.max(0, est - completed);

    if (remaining > 0 && topic.status !== 'completed') {
      pendingTopics.push({
        topic,
        goal,
        remainingHours: remaining,
        completedHours: completed,
        learnedSessionsCount: completed > 0 ? 1 : 0,
      });
      totalRequiredHours += remaining;
    }
  }

  // 3. Build calendar horizon and available slot chunks
  const sessionDurationMin = preferences.sessionLength || 50;
  const breakDurationMin = preferences.breakLength || 10;
  const maxHoursPerDay = preferences.maxHoursPerDay || 6;
  const stepMin = sessionDurationMin + breakDurationMin;

  const horizonDays = horizonWeeks * 7;
  const dailyHoursAllocated: Record<string, number> = {};

  // Preload locked session usage into daily hours
  for (const session of lockedSessions) {
    const dayKey = format(parseISO(session.start), 'yyyy-MM-dd');
    const hours = differenceInMinutes(parseISO(session.end), parseISO(session.start)) / 60;
    dailyHoursAllocated[dayKey] = (dailyHoursAllocated[dayKey] || 0) + hours;
  }

  const generatedSessions: Session[] = [...lockedSessions];
  const pendingRevisions: Array<{
    topic: Topic;
    goal: Goal;
    earliestDate: Date;
    revisionNum: number;
  }> = [];

  let lastGoalId: string | null = null;
  let totalAvailableHours = 0;
  let totalAllocatedHours = 0;
  let bufferSessionsCount = 0;

  // Track session ID generator
  let idCounter = 1;
  const generateId = () => `sess_${Date.now()}_${idCounter++}`;

  // Loop through days from startDate
  for (let d = 0; d < horizonDays; d++) {
    const currentDay = addDays(startOfDay(startDate), d);
    const dayKey = format(currentDay, 'yyyy-MM-dd');
    dailyHoursAllocated[dayKey] = dailyHoursAllocated[dayKey] || 0;

    // Get time windows for currentDay
    const dayWindows = generateDailyTimeWindows(currentDay, availability, preferences, blockedDates);

    for (const window of dayWindows) {
      let cursor = window.start;

      // If current day is today, don't schedule slots in the past
      if (isSameDay(currentDay, now) && isBefore(cursor, now)) {
        // advance cursor to current time + 15m buffer rounded to next 10m
        cursor = new Date(Math.ceil(now.getTime() / (10 * 60 * 1000)) * (10 * 60 * 1000));
      }

      while (isBefore(addMinutes(cursor, sessionDurationMin), window.end)) {
        const slotStart = cursor;
        const slotEnd = addMinutes(cursor, sessionDurationMin);
        const slotHours = sessionDurationMin / 60;
        totalAvailableHours += slotHours;

        // Check if daily cap reached
        if (dailyHoursAllocated[dayKey] + slotHours > maxHoursPerDay) {
          break; // Move to next day
        }

        // Check collision with locked session
        const hasCollision = lockedSessions.some((s) => {
          const sStart = parseISO(s.start);
          const sEnd = parseISO(s.end);
          return (
            (slotStart >= sStart && slotStart < sEnd) ||
            (slotEnd > sStart && slotEnd <= sEnd) ||
            (slotStart <= sStart && slotEnd >= sEnd)
          );
        });

        if (hasCollision) {
          cursor = addMinutes(cursor, 15);
          continue;
        }

        // Decide what to place in this slot:
        // Priority A: Due Spaced Revision
        const dueRevisionIndex = pendingRevisions.findIndex(
          (r) =>
            (isSameDay(currentDay, r.earliestDate) || isAfter(currentDay, r.earliestDate)) &&
            isBefore(slotEnd, parseISO(r.goal.deadline))
        );

        if (dueRevisionIndex !== -1) {
          const rev = pendingRevisions.splice(dueRevisionIndex, 1)[0];
          generatedSessions.push({
            id: generateId(),
            userId,
            goalId: rev.goal.id,
            topicId: rev.topic.id,
            title: `Revise: ${rev.topic.title} (${rev.goal.title})`,
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            type: 'revise',
            status: 'pending',
            revisionNumber: rev.revisionNum,
          });

          dailyHoursAllocated[dayKey] += slotHours;
          totalAllocatedHours += slotHours;
          cursor = addMinutes(slotEnd, breakDurationMin);
          lastGoalId = rev.goal.id;
          continue;
        }

        // Priority B: Buffer Slot (reserve ~12-15% of slots as buffers for unexpected slips)
        const isBufferSlot = totalAllocatedHours > 0 && Math.floor(totalAllocatedHours) % 8 === 0 && bufferSessionsCount < Math.ceil(totalRequiredHours * 0.15);
        if (isBufferSlot && pendingTopics.length > 0) {
          generatedSessions.push({
            id: generateId(),
            userId,
            goalId: pendingTopics[0].goal.id,
            title: `Buffer / Review Catch-up`,
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            type: 'buffer',
            status: 'pending',
          });
          bufferSessionsCount++;
          dailyHoursAllocated[dayKey] += slotHours;
          totalAllocatedHours += slotHours;
          cursor = addMinutes(slotEnd, breakDurationMin);
          continue;
        }

        // Priority C: Learning / Practice Topic
        // Filter candidates: deadline must be strictly after slotEnd
        const validCandidates = pendingTopics.filter((p) => {
          const deadline = parseISO(p.goal.deadline);
          return isAfter(deadline, slotEnd) && p.remainingHours > 0;
        });

        if (validCandidates.length === 0) {
          // No more pending topics for this date/deadline
          cursor = addMinutes(cursor, stepMin);
          continue;
        }

        // Score candidates based on priority, urgency, difficulty & chronotype peak time
        const isPeakTime = isPreferredTimeSlot(slotStart, preferences.preferredTimeOfDay);
        const scoredCandidates = validCandidates.map((candidate) => {
          const scoreObj = calculateTopicScore(candidate.topic, candidate.goal, currentDay);
          let score = scoreObj.score;

          // Interleaving bonus: slight boost if goal is different from lastGoalId
          if (validCandidates.length > 1 && candidate.goal.id !== lastGoalId) {
            score *= 1.25;
          }

          // Peak time bonus for high difficulty topics (4-5)
          if (isPeakTime && candidate.topic.difficulty >= 4) {
            score *= 1.35;
          } else if (!isPeakTime && candidate.topic.difficulty >= 4) {
            score *= 0.85; // De-prioritize very hard topics during non-peak hours
          }

          return { candidate, score };
        });

        // Sort descending by score
        scoredCandidates.sort((a, b) => b.score - a.score);
        const chosen = scoredCandidates[0].candidate;

        const sessionType = chosen.learnedSessionsCount === 0 ? 'learn' : 'practice';
        generatedSessions.push({
          id: generateId(),
          userId,
          goalId: chosen.goal.id,
          topicId: chosen.topic.id,
          title: `${sessionType === 'learn' ? 'Study' : 'Practice'}: ${chosen.topic.title}`,
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          type: sessionType,
          status: 'pending',
        });

        chosen.remainingHours = Math.max(0, chosen.remainingHours - slotHours);
        chosen.learnedSessionsCount++;
        dailyHoursAllocated[dayKey] += slotHours;
        totalAllocatedHours += slotHours;
        lastGoalId = chosen.goal.id;

        // Schedule Spaced Revision (+2 days, +5 days)
        if (sessionType === 'learn') {
          pendingRevisions.push({
            topic: chosen.topic,
            goal: chosen.goal,
            earliestDate: addDays(currentDay, 2),
            revisionNum: 1,
          });
        }

        // Clean up completed pending topics
        if (chosen.remainingHours <= 0) {
          const idx = pendingTopics.indexOf(chosen);
          if (idx !== -1) pendingTopics.splice(idx, 1);
        }

        cursor = addMinutes(slotEnd, breakDurationMin);
      }
    }
  }

  // 4. Feasibility analysis
  const unallocatedHours = pendingTopics.reduce((acc, p) => acc + p.remainingHours, 0);
  let feasibility: 'feasible' | 'tight' | 'infeasible' = 'feasible';

  if (unallocatedHours > 0) {
    feasibility = 'infeasible';
    warnings.push(
      `Shortfall of ${unallocatedHours.toFixed(1)} hours before deadline. Consider extending deadlines, increasing weekly availability, or adjusting low-priority topics.`
    );
  } else if (totalAvailableHours > 0 && totalAllocatedHours / totalAvailableHours > 0.85) {
    feasibility = 'tight';
    warnings.push('Schedule is tight (>85% utilization). Minimal slack for missed sessions.');
  }

  // Sort all sessions by start time
  generatedSessions.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return {
    sessions: generatedSessions,
    feasibility,
    shortfallHours: Math.round(unallocatedHours * 10) / 10,
    warnings,
    metrics: {
      totalAllocatedHours: Math.round(totalAllocatedHours * 10) / 10,
      totalRequiredHours: Math.round(totalRequiredHours * 10) / 10,
      bufferHours: Math.round(bufferSessionsCount * (sessionDurationMin / 60) * 10) / 10,
      utilizationPercent:
        totalAvailableHours > 0
          ? Math.min(100, Math.round((totalAllocatedHours / totalAvailableHours) * 100))
          : 0,
    },
  };
}
