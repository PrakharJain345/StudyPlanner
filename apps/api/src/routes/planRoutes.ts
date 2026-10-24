import { Request, Response, Router } from 'express';
import { generateSchedule, replanSchedule } from '@ai-study-planner/scheduler';
import { Store } from '../services/store.js';
import { authMiddleware } from './authRoutes.js';

const router = Router();
router.use(authMiddleware);

// POST /api/plan/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await Store.findUserById(userId);
    const preferences = user?.preferences || {
      sessionLength: 50,
      breakLength: 10,
      maxHoursPerDay: 6,
      preferredTimeOfDay: 'evening',
      daysOff: [0],
      bufferPercent: 15,
      timezone: 'UTC',
    };

    const goals = await Store.getGoals(userId);
    const topics = await Store.getTopics(undefined, userId);
    const availability = await Store.getAvailability(userId);
    const blockedDates = await Store.getBlockedDates(userId);
    const existingSessions = await Store.getSessions(userId);

    const result = generateSchedule({
      userId,
      goals,
      topics,
      availability,
      blockedDates,
      preferences,
      existingSessions,
      startDate: new Date(),
      horizonWeeks: 8,
    });

    // Save newly generated future sessions
    const updatedSessions = await Store.replaceFutureSessions(userId, result.sessions);

    return res.json({
      ...result,
      sessions: updatedSessions,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/plan/replan (Preview Diff)
router.post('/replan', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { trigger = 'manual', triggerDetails } = req.body;

    const user = await Store.findUserById(userId);
    const preferences = user?.preferences || {
      sessionLength: 50,
      breakLength: 10,
      maxHoursPerDay: 6,
      preferredTimeOfDay: 'evening',
      daysOff: [0],
      bufferPercent: 15,
      timezone: 'UTC',
    };

    const goals = await Store.getGoals(userId);
    const topics = await Store.getTopics(undefined, userId);
    const availability = await Store.getAvailability(userId);
    const blockedDates = await Store.getBlockedDates(userId);
    const existingSessions = await Store.getSessions(userId);

    const replanResult = replanSchedule({
      userId,
      goals,
      topics,
      availability,
      blockedDates,
      preferences,
      existingSessions,
      trigger,
      triggerDetails,
    });

    return res.json(replanResult);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/plan/apply
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { sessions, diff, trigger = 'adaptive_replan' } = req.body;

    if (!Array.isArray(sessions)) {
      return res.status(400).json({ error: 'sessions array is required' });
    }

    const updatedSessions = await Store.replaceFutureSessions(userId, sessions);
    if (diff) {
      await Store.savePlanVersion(userId, trigger, diff.summary || 'Applied re-plan', diff);
    }

    return res.json({
      success: true,
      sessions: updatedSessions,
      diff,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/plan/latest-diff
router.get('/latest-diff', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const latest = await Store.getLatestPlanVersion(userId);
    return res.json({ planVersion: latest });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
