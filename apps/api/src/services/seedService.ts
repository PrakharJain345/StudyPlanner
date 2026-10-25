import { generateSchedule } from '@ai-study-planner/scheduler';
import { AvailabilitySlot, Goal, Topic, UserPreferences } from '@ai-study-planner/shared';
import { addDays, subDays } from 'date-fns';
import { Store } from './store.js';

export async function seedDemoData(userId: string) {
  // 1. User preferences
  const preferences: UserPreferences = {
    sessionLength: 50,
    breakLength: 10,
    maxHoursPerDay: 5,
    preferredTimeOfDay: 'evening',
    daysOff: [0], // Sunday off
    bufferPercent: 15,
    timezone: 'UTC',
  };
  await Store.updateUserPreferences(userId, preferences);

  // 2. Clear existing goals, topics, sessions, availability
  const existingGoals = await Store.getGoals(userId);
  for (const g of existingGoals) {
    await Store.deleteGoal(g.id);
  }

  // 3. Weekly recurring availability (Mon-Fri 17:00-21:00, Sat 10:00-15:00)
  const availabilitySlots: Omit<AvailabilitySlot, 'id' | 'userId'>[] = [
    { dayOfWeek: 1, startTime: '17:00', endTime: '21:00' },
    { dayOfWeek: 2, startTime: '17:00', endTime: '21:00' },
    { dayOfWeek: 3, startTime: '17:00', endTime: '21:00' },
    { dayOfWeek: 4, startTime: '17:00', endTime: '21:00' },
    { dayOfWeek: 5, startTime: '17:00', endTime: '21:00' },
    { dayOfWeek: 6, startTime: '10:00', endTime: '15:00' },
  ];
  await Store.setAvailability(userId, availabilitySlots);

  // 4. Create Goals
  const now = new Date();
  const dsaDeadline = addDays(now, 18).toISOString();
  const osDeadline = addDays(now, 26).toISOString();
  const mlDeadline = addDays(now, 32).toISOString();

  const goalDSA = await Store.createGoal({
    userId,
    title: 'Data Structures & Algorithms',
    type: 'exam',
    deadline: dsaDeadline,
    priority: 5,
    targetProficiency: 'mastery',
    color: '#6366f1', // Indigo
    description: 'Master core LeetCode patterns and algorithm complexity for semester placement exams.',
  });

  const goalOS = await Store.createGoal({
    userId,
    title: 'Operating Systems',
    type: 'exam',
    deadline: osDeadline,
    priority: 4,
    targetProficiency: 'proficient',
    color: '#06b6d4', // Cyan
    description: 'Processes, concurrency, virtual memory and file systems.',
  });

  const goalML = await Store.createGoal({
    userId,
    title: 'Machine Learning Project',
    type: 'project',
    deadline: mlDeadline,
    priority: 4,
    targetProficiency: 'proficient',
    color: '#ec4899', // Pink
    description: 'End-to-end computer vision classifier project with PyTorch & report.',
  });

  // 5. Create Topics
  const dsaTopicsData = [
    { title: 'Array Manipulation & Two Pointers', difficulty: 2, estHours: 2.5 },
    { title: 'Binary Search & Edge Cases', difficulty: 3, estHours: 3 },
    { title: 'Stacks, Queues & Monotonic Stacks', difficulty: 3, estHours: 3 },
    { title: 'Binary Trees & Tree Traversals', difficulty: 4, estHours: 4 },
    { title: 'Graph BFS/DFS & Shortest Paths', difficulty: 4, estHours: 4.5 },
    { title: 'Dynamic Programming: 1D & Knapsack', difficulty: 5, estHours: 5 },
  ];

  const osTopicsData = [
    { title: 'Process Scheduling & Context Switching', difficulty: 2, estHours: 3 },
    { title: 'Threads & Synchronization (Semaphores)', difficulty: 4, estHours: 4 },
    { title: 'Deadlock Detection & Banker Algorithm', difficulty: 3, estHours: 3 },
    { title: 'Virtual Memory & Page Replacement', difficulty: 4, estHours: 4.5 },
  ];

  const mlTopicsData = [
    { title: 'Exploratory Data Analysis & Preprocessing', difficulty: 2, estHours: 3 },
    { title: 'Baseline Classification with Scikit-Learn', difficulty: 3, estHours: 3.5 },
    { title: 'PyTorch CNN Architecture & Training Loop', difficulty: 4, estHours: 5 },
    { title: 'Hyperparameter Tuning & Evaluation Metrics', difficulty: 3, estHours: 3 },
  ];

  const allTopics: Topic[] = [];

  for (let i = 0; i < dsaTopicsData.length; i++) {
    const t = await Store.createTopic(
      {
        goalId: goalDSA.id,
        title: dsaTopicsData[i].title,
        difficulty: dsaTopicsData[i].difficulty,
        estHours: dsaTopicsData[i].estHours,
        status: i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'not_started',
        order: i,
      },
      userId
    );
    allTopics.push(t);
  }

  for (let i = 0; i < osTopicsData.length; i++) {
    const t = await Store.createTopic(
      {
        goalId: goalOS.id,
        title: osTopicsData[i].title,
        difficulty: osTopicsData[i].difficulty,
        estHours: osTopicsData[i].estHours,
        status: 'not_started',
        order: i,
      },
      userId
    );
    allTopics.push(t);
  }

  for (let i = 0; i < mlTopicsData.length; i++) {
    const t = await Store.createTopic(
      {
        goalId: goalML.id,
        title: mlTopicsData[i].title,
        difficulty: mlTopicsData[i].difficulty,
        estHours: mlTopicsData[i].estHours,
        status: 'not_started',
        order: i,
      },
      userId
    );
    allTopics.push(t);
  }

  // 6. Generate deterministic study schedule
  const avail = await Store.getAvailability(userId);
  const blocked = await Store.getBlockedDates(userId);

  // Add 1 completed past session yesterday for streak demonstration
  const yesterday = subDays(now, 1);
  const pastSession = {
    id: `sess_past_1`,
    userId,
    goalId: goalDSA.id,
    topicId: allTopics[0].id,
    title: `Study: ${allTopics[0].title}`,
    start: new Date(yesterday.setHours(17, 0, 0, 0)).toISOString(),
    end: new Date(yesterday.setHours(17, 50, 0, 0)).toISOString(),
    type: 'learn' as const,
    status: 'done' as const,
    actualMinutes: 50,
    confidence: 4,
    notes: 'Completed array two pointer problems on LeetCode with good speed.',
  };

  const scheduleResult = generateSchedule({
    userId,
    goals: [goalDSA, goalOS, goalML],
    topics: allTopics,
    availability: avail,
    blockedDates: blocked,
    preferences,
    existingSessions: [pastSession],
    startDate: now,
    horizonWeeks: 6,
  });

  await Store.replaceFutureSessions(userId, scheduleResult.sessions);

  return {
    goals: [goalDSA, goalOS, goalML],
    topicsCount: allTopics.length,
    sessionsCount: scheduleResult.sessions.length,
  };
}
