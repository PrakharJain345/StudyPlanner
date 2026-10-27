import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserPreferencesSchema } from '@ai-study-planner/shared';
import { Store } from '../services/store.js';
import { seedUserData, TRACK_DEFINITIONS } from '../services/seedService.js';

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

// Predefined Demo Student Personas for Instant Multi-User Testing
const DEMO_PERSONAS: Record<string, { email: string; name: string; track: string }> = {
  business: {
    email: 'elon.musk@x.finance',
    name: 'Elon Musk',
    track: 'business',
  },
  engineering: {
    email: 'karpathy.ai@studyplanner.ai',
    name: 'Andrej Karpathy',
    track: 'engineering',
  },
  medical: {
    email: 'house.md@studyplanner.ai',
    name: 'Dr. Gregory House',
    track: 'medical',
  },
  competitive: {
    email: 'feynman.quant@studyplanner.ai',
    name: 'Richard Feynman',
    track: 'competitive',
  },
  prakhar: {
    email: 'student.demo@studyplanner.ai',
    name: 'Prakhar',
    track: 'engineering',
  },
};

// POST /register - Create user with custom study needs and track
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, studyTrack = 'engineering', preferences, bootstrapTemplate = true } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await Store.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const trackDef = TRACK_DEFINITIONS[studyTrack] || TRACK_DEFINITIONS.engineering;
    const hashedPassword = await bcrypt.hash(password, 10);

    const initialPreferences = {
      ...trackDef.defaultPreferences,
      ...preferences,
      studyTrack,
      timezone: preferences?.timezone || 'UTC',
    };

    const user = await Store.createUser({
      email,
      name,
      password: hashedPassword,
      studyTrack,
      preferences: initialPreferences as any,
      createdAt: new Date().toISOString(),
    });

    if (bootstrapTemplate) {
      await seedUserData(user.id, studyTrack, {
        customPreferences: preferences,
      });
    }

    const token = signToken(user.id);
    return res.status(201).json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /login - Traditional Email & Password Login
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

// POST /demo - Instant Student Login (Supports engineering, medical, business, competitive)
router.post('/demo', async (req: Request, res: Response) => {
  try {
    const personaKey = (req.body?.persona || req.query?.persona || 'engineering') as string;
    const persona = DEMO_PERSONAS[personaKey] || DEMO_PERSONAS.engineering;

    let user = await Store.findUserByEmail(persona.email);

    if (!user) {
      const trackDef = TRACK_DEFINITIONS[persona.track] || TRACK_DEFINITIONS.engineering;
      user = await Store.createUser({
        email: persona.email,
        name: persona.name,
        studyTrack: persona.track,
        preferences: trackDef.defaultPreferences as any,
        createdAt: new Date().toISOString(),
      });
      // Seed rich dataset matching this user's specific curriculum needs
      await seedUserData(user.id, persona.track);
    } else {
      // If goals empty, re-seed with their specific track
      const goals = await Store.getGoals(user.id);
      if (goals.length === 0) {
        await seedUserData(user.id, persona.track);
      }
    }

    const token = signToken(user.id);
    const safeUser = await Store.findUserById(user.id);
    return res.json({ user: safeUser || user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Demo login failed' });
  }
});

// GET /me - Retrieve current authenticated user profile
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

// PATCH /profile - Update User Profile & Study Track
router.patch('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, studyTrack, avatar } = req.body;

    const updated = await Store.updateUserProfile(userId, {
      name,
      studyTrack,
      avatar,
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (studyTrack) {
      await Store.updateUserPreferences(userId, { studyTrack });
    }

    const freshUser = await Store.findUserById(userId);
    return res.json({ user: freshUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /preferences - Update User Study Preferences
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

// POST /apply-track-template - Reset or switch study curriculum to match a track
router.post('/apply-track-template', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { track = 'engineering' } = req.body;

    await seedUserData(userId, track);
    const updatedUser = await Store.findUserById(userId);

    return res.json({
      success: true,
      message: `Curriculum updated to ${track} track`,
      user: updatedUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
