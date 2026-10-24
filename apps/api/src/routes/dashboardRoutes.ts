import { Request, Response, Router } from 'express';
import { differenceInDays, differenceInMinutes, parseISO, startOfDay, subDays } from 'date-fns';
import { Store } from '../services/store.js';
import { authMiddleware } from './authRoutes.js';

const router = Router();
router.use(authMiddleware);

// GET /api/dashboard/summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const goals = await Store.getGoals(userId);
    const topics = await Store.getTopics(undefined, userId);
    const sessions = await Store.getSessions(userId);

    let totalHoursStudied = 0;
    let sessionsCompleted = 0;
    let sessionsUpcoming = 0;
    let sessionsSkipped = 0;

    // Track active days for streak calculation
    const completedDaysSet = new Set<string>();

    const now = new Date();

    for (const s of sessions) {
      if (s.status === 'done') {
        sessionsCompleted++;
        const mins = s.actualMinutes || differenceInMinutes(parseISO(s.end), parseISO(s.start));
        totalHoursStudied += mins / 60;
        completedDaysSet.add(s.start.split('T')[0]);
      } else if (s.status === 'skipped') {
        sessionsSkipped++;
      } else if (s.status === 'pending') {
        sessionsUpcoming++;
      }
    }

    // Calculate streak
    let streakDays = 0;
    let checkDate = startOfDay(now);

    // If today is not in set, check if yesterday was done
    const todayStr = checkDate.toISOString().split('T')[0];
    if (completedDaysSet.has(todayStr)) {
      streakDays = 1;
      checkDate = subDays(checkDate, 1);
    } else {
      const yesterdayStr = subDays(checkDate, 1).toISOString().split('T')[0];
      if (completedDaysSet.has(yesterdayStr)) {
        streakDays = 1;
        checkDate = subDays(checkDate, 2);
      }
    }

    while (streakDays > 0) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (completedDaysSet.has(dStr)) {
        streakDays++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Target hours from all topics
    const totalTargetHours = topics.reduce((acc, t) => acc + (t.estHours || 2), 0);
    const completionRate =
      totalTargetHours > 0
        ? Math.min(100, Math.round((totalHoursStudied / totalTargetHours) * 100))
        : 0;

    // Goal risk assessment
    const goalStatuses = goals.map((g) => {
      const goalTopics = topics.filter((t) => t.goalId === g.id);
      const goalSessions = sessions.filter((s) => s.goalId === g.id);
      const doneSessions = goalSessions.filter((s) => s.status === 'done');

      const completedMins = doneSessions.reduce(
        (sum, s) => sum + (s.actualMinutes || differenceInMinutes(parseISO(s.end), parseISO(s.start))),
        0
      );
      const completedHours = completedMins / 60;
      const requiredHours = goalTopics.reduce((sum, t) => sum + (t.estHours || 2), 0);
      const remainingHours = Math.max(0, requiredHours - completedHours);

      const daysLeft = Math.max(0, differenceInDays(parseISO(g.deadline), now));
      const hoursPerDayNeeded = daysLeft > 0 ? remainingHours / daysLeft : remainingHours;

      let risk: 'on-track' | 'at-risk' | 'behind' = 'on-track';
      if (daysLeft <= 2 && remainingHours > 4) {
        risk = 'behind';
      } else if (hoursPerDayNeeded > 3) {
        risk = 'at-risk';
      }

      const progressPercent =
        requiredHours > 0 ? Math.min(100, Math.round((completedHours / requiredHours) * 100)) : 0;

      return {
        goalId: g.id,
        title: g.title,
        color: g.color,
        deadline: g.deadline,
        priority: g.priority,
        type: g.type,
        progressPercent,
        risk,
        requiredHoursRemaining: Math.round(remainingHours * 10) / 10,
        availableHoursRemaining: Math.round(daysLeft * 4 * 10) / 10,
      };
    });

    return res.json({
      summary: {
        totalHoursStudied: Math.round(totalHoursStudied * 10) / 10,
        totalTargetHours: Math.round(totalTargetHours * 10) / 10,
        completionRate,
        streakDays: Math.max(streakDays, 1), // At least 1 day demo streak
        sessionsCompleted,
        sessionsUpcoming,
        sessionsSkipped,
        goalStatuses,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
