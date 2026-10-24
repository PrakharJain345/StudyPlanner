import { Request, Response, Router } from 'express';
import { Store } from '../services/store.js';
import { authMiddleware } from './authRoutes.js';

const router = Router();
router.use(authMiddleware);

// GET /api/availability
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const availability = await Store.getAvailability(userId);
    return res.json({ availability });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/availability
router.put('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { slots } = req.body;
    if (!Array.isArray(slots)) {
      return res.status(400).json({ error: 'slots must be an array' });
    }

    const saved = await Store.setAvailability(userId, slots);
    return res.json({ availability: saved });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/blocked-dates
router.get('/blocked-dates', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const blockedDates = await Store.getBlockedDates(userId);
    return res.json({ blockedDates });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/blocked-dates
router.post('/blocked-dates', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'startDate, endDate, and reason are required' });
    }

    const blocked = await Store.addBlockedDate({
      userId,
      startDate,
      endDate,
      reason,
    });

    return res.status(201).json({ blockedDate: blocked });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/blocked-dates/:id
router.delete('/blocked-dates/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Store.deleteBlockedDate(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
