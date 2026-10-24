import { Request, Response, Router } from 'express';
import { Store } from '../services/store.js';
import { authMiddleware } from './authRoutes.js';

const router = Router();
router.use(authMiddleware);

// GET /api/sessions
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { from, to } = req.query as { from?: string; to?: string };
    const sessions = await Store.getSessions(userId, from, to);
    return res.json({ sessions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sessions/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { status, actualMinutes, confidence, notes } = req.body;

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (actualMinutes !== undefined) updates.actualMinutes = actualMinutes;
    if (confidence !== undefined) updates.confidence = confidence;
    if (notes !== undefined) updates.notes = notes;

    const updated = await Store.updateSession(sessionId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if re-planning is recommended (e.g. skipped or partial)
    const replanRecommended = status === 'skipped' || status === 'partial';

    return res.json({
      session: updated,
      replanRecommended,
      message: replanRecommended
        ? 'Session status updated. An adaptive re-plan is recommended to keep your deadlines safe.'
        : 'Session updated successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
