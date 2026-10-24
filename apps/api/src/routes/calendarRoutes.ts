import { Request, Response, Router } from 'express';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { Store } from '../services/store.js';

const router = Router();

// GET /api/calendar/feed.ics (or query ?token= or ?userId=)
router.get('/feed.ics', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'student.demo@studyplanner.ai';
    const sessions = await Store.getSessions(userId);
    const goals = await Store.getGoals(userId);
    const goalMap = new Map(goals.map((g) => [g.id, g]));

    const calendar = ical({
      name: 'AI Study Planner Schedule',
      method: ICalCalendarMethod.PUBLISH,
      timezone: 'UTC',
    });

    for (const s of sessions) {
      const goal = goalMap.get(s.goalId);
      calendar.createEvent({
        id: s.id,
        start: new Date(s.start),
        end: new Date(s.end),
        summary: s.title,
        description: `Subject: ${goal?.title || 'Study Goal'}\nType: ${s.type.toUpperCase()}\nStatus: ${s.status}`,
        location: 'Study Desk / Library',
      });
    }

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="study-schedule.ics"');
    return res.send(calendar.toString());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
