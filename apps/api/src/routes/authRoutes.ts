import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserPreferencesSchema } from '@ai-study-planner/shared';
import { Store } from '../services/store.js';
import { seedDemoData } from '../services/seedService.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_study_planner_jwt_key_2026';

function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function authMiddleware(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await Store.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Store.createUser({
      email,
      name,
      password: hashedPassword,
      preferences: {
        sessionLength: 50,
        breakLength: 10,
        maxHoursPerDay: 6,
        preferredTimeOfDay: 'evening',
        daysOff: [0],
        bufferPercent: 15,
        timezone: 'UTC',
      },
      createdAt: new Date().toISOString(),
    });

    const token = signToken(user.id);
    return res.status(201).json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await Store.findUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    const { password: _, ...userSafe } = user;
    return res.json({ user: userSafe, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// POST /demo (Instant 1-Click Student Login)
router.post('/demo', async (req: Request, res: Response) => {
  try {
    const demoEmail = 'student.demo@studyplanner.ai';
    let user = await Store.findUserByEmail(demoEmail);

    if (!user) {
      user = await Store.createUser({
        email: demoEmail,
        name: 'Prakhar',
        preferences: {
          sessionLength: 50,
          breakLength: 10,
          maxHoursPerDay: 5,
          preferredTimeOfDay: 'evening',
          daysOff: [0],
          bufferPercent: 15,
          timezone: 'UTC',
        },
        createdAt: new Date().toISOString(),
      });
      // Seed rich dataset
      await seedDemoData(user.id);
    } else {
      // If goals empty, re-seed
      const goals = await Store.getGoals(user.id);
      if (goals.length === 0) {
        await seedDemoData(user.id);
      }
    }

    const token = signToken(user.id);
    const { password: _, ...userSafe } = user;
    return res.json({ user: userSafe, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Demo login failed' });
  }
});

// GET /me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await Store.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /preferences
router.patch('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const parseResult = UserPreferencesSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const updated = await Store.updateUserPreferences(userId, parseResult.data);
    return res.json({ preferences: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
