import { Request, Response, Router } from 'express';
import { GoalSchema, TopicSchema } from '@ai-study-planner/shared';
import { AIService } from '../services/aiService.js';
import { Store } from '../services/store.js';
import { authMiddleware } from './authRoutes.js';

const router = Router();
router.use(authMiddleware);

// GET /api/goals
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const goals = await Store.getGoals(userId);
    return res.json({ goals });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/goals
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, type, deadline, priority, targetProficiency, color, description } = req.body;

    if (!title || !type || !deadline) {
      return res.status(400).json({ error: 'Title, type, and deadline are required' });
    }

    const created = await Store.createGoal({
      userId,
      title,
      type,
      deadline,
      priority: priority ?? 3,
      targetProficiency: targetProficiency ?? 'proficient',
      color: color ?? '#6366f1',
      description,
    });

    return res.status(201).json({ goal: created });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/goals/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id;
    const updated = await Store.updateGoal(goalId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    return res.json({ goal: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id;
    await Store.deleteGoal(goalId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/goals/:id/topics
router.get('/:id/topics', async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id;
    const topics = await Store.getTopics(goalId);
    return res.json({ topics });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/goals/:id/topics
router.post('/:id/topics', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const goalId = req.params.id;
    const { title, difficulty, estHours, status, order } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Topic title is required' });
    }

    const topic = await Store.createTopic(
      {
        goalId,
        title,
        difficulty: difficulty ?? 3,
        estHours: estHours ?? 2,
        status: status ?? 'not_started',
        order: order ?? 0,
      },
      userId
    );

    return res.status(201).json({ topic });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/goals/breakdown (AI Topic Tree Generation from Title / Syllabus Text)
router.post('/breakdown', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { goalId, title, syllabusText, targetProficiency, autoSave } = req.body;

    if (!title && !goalId) {
      return res.status(400).json({ error: 'Either goal title or goalId is required' });
    }

    let resolvedTitle = title;
    let targetGoalId = goalId;

    if (goalId && !title) {
      const goals = await Store.getGoals(userId);
      const match = goals.find((g) => g.id === goalId);
      if (match) {
        resolvedTitle = match.title;
      }
    }

    const breakdown = await AIService.generateTopicBreakdown({
      title: resolvedTitle,
      syllabusText,
      targetProficiency,
    });

    // If autoSave and goalId provided, automatically save generated topics to DB!
    if (autoSave && targetGoalId) {
      const savedTopics = [];
      for (let i = 0; i < breakdown.topics.length; i++) {
        const item = breakdown.topics[i];
        const saved = await Store.createTopic(
          {
            goalId: targetGoalId,
            title: item.title,
            difficulty: item.difficulty,
            estHours: item.estHours,
            status: 'not_started',
            order: i,
          },
          userId
        );
        savedTopics.push(saved);
      }
      return res.json({ breakdown, savedTopics });
    }

    return res.json({ breakdown });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
