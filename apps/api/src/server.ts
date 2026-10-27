import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/authRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import planRoutes from './routes/planRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import { seedDemoData } from './services/seedService.js';
import { Store } from './services/store.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Demo data reset endpoint
app.post('/api/reset-demo', async (req, res) => {
  try {
    const demoEmail = 'student.demo@studyplanner.ai';
    let user = await Store.findUserByEmail(demoEmail);
    if (!user) {
      user = await Store.createUser({
        email: demoEmail,
        name: 'Prakhar',
        studyTrack: 'engineering',
        preferences: {
          sessionLength: 50,
          breakLength: 10,
          maxHoursPerDay: 5,
          preferredTimeOfDay: 'evening',
          daysOff: [0],
          bufferPercent: 15,
          studyTrack: 'engineering',
          timezone: 'UTC',
        },
        createdAt: new Date().toISOString(),
      });
    }
    const seedResult = await seedDemoData(user.id);
    res.json({ success: true, message: 'Demo data freshly reset', details: seedResult });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Static frontend serving in production
const possibleDistPaths = [
  path.resolve(__dirname, '../../../apps/web/dist'),
  path.resolve(__dirname, '../../web/dist'),
];
const webDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (webDistPath) {
  app.use(express.static(webDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

// Start server
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Server] AI Study Planner API server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[Server] Failed to start server:', err);
});
