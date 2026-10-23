import {
  PlanDiff,
  PlanDiffSessionAction,
  PlanGenerationResult,
  ReplanInput,
  Session,
} from '@ai-study-planner/shared';
import { isBefore, parseISO } from 'date-fns';
import { generateSchedule } from './engine.js';

export function replanSchedule(input: ReplanInput): PlanGenerationResult {
  const { existingSessions = [], trigger, triggerDetails } = input;
  const now = new Date();

  // Find past or already done sessions
  const lockedSessions = existingSessions.filter(
    (s) => s.status === 'done' || isBefore(parseISO(s.start), now)
  );

  // Original future sessions map for diff calculation
  const originalFutureMap = new Map<string, Session>();
  for (const s of existingSessions) {
    if (s.status !== 'done' && !isBefore(parseISO(s.start), now)) {
      originalFutureMap.set(s.id, s);
    }
  }

  // Generate new schedule starting from now
  const result = generateSchedule({
    ...input,
    startDate: now,
    existingSessions: lockedSessions,
  });

  // Calculate PlanDiff between original future sessions and new future sessions
  const affectedSessions: PlanDiffSessionAction[] = [];
  let totalMoved = 0;
  let totalAdjusted = 0;

  const newFutureSessions = result.sessions.filter(
    (s) => s.status !== 'done' && !isBefore(parseISO(s.start), now)
  );

  for (const newSess of newFutureSessions) {
    // Check if it corresponds to an existing future session (by topic and type or id)
    const matchingOld = Array.from(originalFutureMap.values()).find(
      (oldSess) =>
        oldSess.id === newSess.id ||
        (oldSess.topicId && oldSess.topicId === newSess.topicId && oldSess.type === newSess.type)
    );

    if (matchingOld) {
      if (matchingOld.start !== newSess.start || matchingOld.end !== newSess.end) {
        affectedSessions.push({
          action: 'moved',
          session: newSess,
          previousStart: matchingOld.start,
          previousEnd: matchingOld.end,
        });
        totalMoved++;
      }
      originalFutureMap.delete(matchingOld.id);
    } else {
      affectedSessions.push({
        action: 'added',
        session: newSess,
      });
      totalAdjusted++;
    }
  }

  // Any remaining old future sessions that weren't mapped are considered removed or postponed
  for (const [, removedSess] of originalFutureMap) {
    affectedSessions.push({
      action: 'removed',
      session: removedSess,
      previousStart: removedSess.start,
      previousEnd: removedSess.end,
    });
    totalAdjusted++;
  }

  // Construct summary message
  let summary = 'Schedule updated.';
  if (trigger === 'session_skipped') {
    summary = `${totalMoved} session(s) rescheduled to recover from skipped session. Buffer maintained.`;
  } else if (trigger === 'session_partial') {
    summary = `Progress logged. Remaining topic work re-allocated across upcoming slots.`;
  } else if (trigger === 'deadline_changed' || trigger === 'goal_added') {
    summary = `Pacing re-balanced across all subjects with ${totalMoved} session(s) adjusted.`;
  } else if (trigger === 'availability_changed') {
    summary = `Sessions shifted into new available time slots.`;
  }

  const diff: PlanDiff = {
    affectedSessions,
    summary,
    totalMoved,
    totalAdjusted,
    shortfallHours: result.shortfallHours,
    feasibility: result.feasibility,
    recommendations: result.warnings,
  };

  return {
    ...result,
    diff,
  };
}
