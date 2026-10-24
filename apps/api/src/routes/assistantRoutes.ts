import { Request, Response, Router } from 'express';
import { replanSchedule } from '@ai-study-planner/scheduler';
import { AIService } from '../services/aiService.js';
import { Store } from '../services/store.js';
import { authMiddleware } from './authRoutes.js';

const router = Router();
router.use(authMiddleware);

// POST /api/assistant/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const user = await Store.findUserById(userId);
    const goals = await Store.getGoals(userId);

    const result = await AIService.processAssistantChat(message, {
      goals,
      userPreferences: user?.preferences,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/assistant/apply (Execute the confirmed proposal)
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { actionType, details } = req.body;

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

    if (actionType === 'block_date') {
      await Store.addBlockedDate({
        userId,
        startDate: details.startDate,
        endDate: details.endDate,
        reason: details.reason || 'Personal unavailability',
      });
    } else if (actionType === 'change_deadline') {
      await Store.updateGoal(details.goalId, {
        deadline: details.newDeadline,
      });
    }

    // Trigger re-plan
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
      trigger: actionType === 'block_date' ? 'availability_changed' : 'deadline_changed',
    });

    // Apply the newly re-planned sessions
    const updatedSessions = await Store.replaceFutureSessions(userId, replanResult.sessions);

    if (replanResult.diff) {
      await Store.savePlanVersion(
        userId,
        `assistant_${actionType}`,
        replanResult.diff.summary,
        replanResult.diff
      );
    }

    return res.json({
      success: true,
      message: 'Plan successfully updated and synchronized.',
      sessions: updatedSessions,
      diff: replanResult.diff,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
