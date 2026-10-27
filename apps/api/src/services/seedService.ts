import { generateSchedule } from '@ai-study-planner/scheduler';
import { AvailabilitySlot, Goal, Topic, UserPreferences } from '@ai-study-planner/shared';
import { addDays, subDays } from 'date-fns';
import { Store } from './store.js';

export interface TrackDefinition {
  id: string;
  name: string;
  tagline: string;
  defaultPreferences: Partial<UserPreferences>;
  availabilitySlots: Omit<AvailabilitySlot, 'id' | 'userId'>[];
  goals: Array<{
    title: string;
    type: 'exam' | 'assignment' | 'project' | 'skill';
    deadlineDays: number;
    priority: number;
    targetProficiency: 'pass' | 'proficient' | 'mastery';
    color: string;
    description: string;
    topics: Array<{
      title: string;
      difficulty: number;
      estHours: number;
    }>;
  }>;
}

export const TRACK_DEFINITIONS: Record<string, TrackDefinition> = {
  engineering: {
    id: 'engineering',
    name: 'Computer Science & AI Systems',
    tagline: 'Operating Systems, Algorithms & Deep Learning Mastery',
    defaultPreferences: {
      sessionLength: 50,
      breakLength: 10,
      maxHoursPerDay: 5,
      preferredTimeOfDay: 'evening',
      daysOff: [0], // Sunday off
      bufferPercent: 15,
      studyTrack: 'engineering',
      timezone: 'UTC',
    },
    availabilitySlots: [
      { dayOfWeek: 1, startTime: '17:00', endTime: '21:00' },
      { dayOfWeek: 2, startTime: '17:00', endTime: '21:00' },
      { dayOfWeek: 3, startTime: '17:00', endTime: '21:00' },
      { dayOfWeek: 4, startTime: '17:00', endTime: '21:00' },
      { dayOfWeek: 5, startTime: '17:00', endTime: '21:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '15:00' },
    ],
    goals: [
      {
        title: 'Data Structures & Algorithms',
        type: 'exam',
        deadlineDays: 18,
        priority: 5,
        targetProficiency: 'mastery',
        color: '#6366f1',
        description: 'Master core LeetCode patterns and algorithm complexity for semester placement exams.',
        topics: [
          { title: 'Array Manipulation & Two Pointers', difficulty: 2, estHours: 2.5 },
          { title: 'Binary Search & Edge Cases', difficulty: 3, estHours: 3 },
          { title: 'Stacks, Queues & Monotonic Stacks', difficulty: 3, estHours: 3 },
          { title: 'Binary Trees & Tree Traversals', difficulty: 4, estHours: 4 },
          { title: 'Graph BFS/DFS & Shortest Paths', difficulty: 4, estHours: 4.5 },
          { title: 'Dynamic Programming: 1D & Knapsack', difficulty: 5, estHours: 5 },
        ],
      },
      {
        title: 'Operating Systems',
        type: 'exam',
        deadlineDays: 26,
        priority: 4,
        targetProficiency: 'proficient',
        color: '#06b6d4',
        description: 'Processes, concurrency, virtual memory and file systems.',
        topics: [
          { title: 'Process Scheduling & Context Switching', difficulty: 2, estHours: 3 },
          { title: 'Threads & Synchronization (Semaphores)', difficulty: 4, estHours: 4 },
          { title: 'Deadlock Detection & Banker Algorithm', difficulty: 3, estHours: 3 },
          { title: 'Virtual Memory & Page Replacement', difficulty: 4, estHours: 4.5 },
        ],
      },
      {
        title: 'Machine Learning Project',
        type: 'project',
        deadlineDays: 32,
        priority: 4,
        targetProficiency: 'proficient',
        color: '#ec4899',
        description: 'End-to-end computer vision classifier project with PyTorch & report.',
        topics: [
          { title: 'Exploratory Data Analysis & Preprocessing', difficulty: 2, estHours: 3 },
          { title: 'Baseline Classification with Scikit-Learn', difficulty: 3, estHours: 3.5 },
          { title: 'PyTorch CNN Architecture & Training Loop', difficulty: 4, estHours: 5 },
          { title: 'Hyperparameter Tuning & Evaluation Metrics', difficulty: 3, estHours: 3 },
        ],
      },
    ],
  },

  medical: {
    id: 'medical',
    name: 'Pre-Med & Healthcare (USMLE)',
    tagline: 'High-yield Clinical Anatomy, Biochemistry & Pharmacology',
    defaultPreferences: {
      sessionLength: 60,
      breakLength: 15,
      maxHoursPerDay: 6,
      preferredTimeOfDay: 'morning',
      daysOff: [0],
      bufferPercent: 20,
      studyTrack: 'medical',
      timezone: 'UTC',
    },
    availabilitySlots: [
      { dayOfWeek: 1, startTime: '07:30', endTime: '13:30' },
      { dayOfWeek: 2, startTime: '07:30', endTime: '13:30' },
      { dayOfWeek: 3, startTime: '07:30', endTime: '13:30' },
      { dayOfWeek: 4, startTime: '07:30', endTime: '13:30' },
      { dayOfWeek: 5, startTime: '07:30', endTime: '13:30' },
      { dayOfWeek: 6, startTime: '08:00', endTime: '13:00' },
    ],
    goals: [
      {
        title: 'Human Anatomy & Physiology',
        type: 'exam',
        deadlineDays: 16,
        priority: 5,
        targetProficiency: 'mastery',
        color: '#e11d48', // Crimson Rose
        description: 'Systemic organ anatomy, cranial nerve innervation, and organ histology.',
        topics: [
          { title: 'Musculoskeletal & Joint Biomechanics', difficulty: 2, estHours: 3 },
          { title: 'Cardiovascular Hemodynamics & ECG Analysis', difficulty: 4, estHours: 4 },
          { title: 'Respiratory Gas Exchange & Acid-Base Physiology', difficulty: 3, estHours: 3.5 },
          { title: 'Neuroanatomy & Cranial Nerve Tracts', difficulty: 5, estHours: 5 },
          { title: 'Renal Clearance & Glomerular Filtration', difficulty: 4, estHours: 4 },
        ],
      },
      {
        title: 'Medical Biochemistry',
        type: 'exam',
        deadlineDays: 24,
        priority: 4,
        targetProficiency: 'proficient',
        color: '#059669', // Emerald
        description: 'Metabolic pathways, rate-limiting enzymes, and genetic storage disorders.',
        topics: [
          { title: 'Glycolysis, Krebs Cycle & Oxidative Phosphorylation', difficulty: 4, estHours: 4 },
          { title: 'Lipid Catabolism & Lipoprotein Transport', difficulty: 3, estHours: 3 },
          { title: 'Amino Acid Degradation & Urea Cycle Defects', difficulty: 4, estHours: 4 },
          { title: 'Enzyme Kinetics & Allosteric Inhibition', difficulty: 3, estHours: 3 },
        ],
      },
      {
        title: 'Clinical Pharmacology',
        type: 'exam',
        deadlineDays: 32,
        priority: 4,
        targetProficiency: 'proficient',
        color: '#d97706', // Amber
        description: 'Mechanisms of drug action, receptor subtypes, and toxicology.',
        topics: [
          { title: 'Autonomic Receptors (Adrenergic vs Cholinergic)', difficulty: 4, estHours: 4 },
          { title: 'Antihypertensives & Antiarrhythmic Agents', difficulty: 3, estHours: 3.5 },
          { title: 'Antibiotic Mechanisms & Resistance Pathways', difficulty: 4, estHours: 4 },
          { title: 'Pharmacokinetics: Volume of Distribution & Clearance', difficulty: 3, estHours: 3 },
        ],
      },
    ],
  },

  business: {
    id: 'business',
    name: 'Business, Finance & MBA Track',
    tagline: 'Financial Valuation, Microeconomics & Corporate Strategy',
    defaultPreferences: {
      sessionLength: 45,
      breakLength: 10,
      maxHoursPerDay: 4.5,
      preferredTimeOfDay: 'afternoon',
      daysOff: [0, 6], // Saturday & Sunday off
      bufferPercent: 15,
      studyTrack: 'business',
      timezone: 'UTC',
    },
    availabilitySlots: [
      { dayOfWeek: 1, startTime: '13:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '13:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '13:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '13:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '13:00', endTime: '18:00' },
    ],
    goals: [
      {
        title: 'Financial Valuation & DCF Modeling',
        type: 'exam',
        deadlineDays: 16,
        priority: 5,
        targetProficiency: 'mastery',
        color: '#2563eb', // Royal Blue
        description: '3-statement financial modeling, DCF valuation, and WACC calculations.',
        topics: [
          { title: 'Balance Sheet & Cash Flow Statement Linkages', difficulty: 3, estHours: 3 },
          { title: 'Discounted Cash Flow (DCF) & Terminal Value', difficulty: 4, estHours: 4.5 },
          { title: 'Trading Multiples & Precedent Transactions', difficulty: 2, estHours: 2.5 },
          { title: 'Capital Structure & Weighted Average Cost of Capital', difficulty: 4, estHours: 4 },
        ],
      },
      {
        title: 'Managerial Economics & Strategy',
        type: 'exam',
        deadlineDays: 25,
        priority: 4,
        targetProficiency: 'proficient',
        color: '#7c3aed', // Purple
        description: 'Price elasticity, game theoretic equilibria, and market structure.',
        topics: [
          { title: 'Supply, Demand & Price Elasticity', difficulty: 2, estHours: 2.5 },
          { title: 'Nash Equilibrium & Simultaneous Pricing Games', difficulty: 4, estHours: 4 },
          { title: 'Monopoly Deadweight Loss & Price Discrimination', difficulty: 3, estHours: 3 },
          { title: 'Porter Five Forces & Sustainable Moats', difficulty: 3, estHours: 3 },
        ],
      },
      {
        title: 'Corporate Finance & M&A Analysis',
        type: 'project',
        deadlineDays: 34,
        priority: 3,
        targetProficiency: 'proficient',
        color: '#0d9488', // Teal
        description: 'Mergers and acquisitions synergy analysis and cap table management.',
        topics: [
          { title: 'Accretion / Dilution Modeling Basics', difficulty: 3, estHours: 3 },
          { title: 'Synergy Valuation & Integration Risks', difficulty: 3, estHours: 3 },
          { title: 'Leveraged Buyout (LBO) Debt Amortization', difficulty: 5, estHours: 5 },
        ],
      },
    ],
  },

  competitive: {
    id: 'competitive',
    name: 'Competitive Exams & Aptitude (GRE/GATE/CAT)',
    tagline: 'High-intensity Quantitative Aptitude, Logic & Verbal Prep',
    defaultPreferences: {
      sessionLength: 45,
      breakLength: 10,
      maxHoursPerDay: 5,
      preferredTimeOfDay: 'night',
      daysOff: [0],
      bufferPercent: 15,
      studyTrack: 'competitive',
      timezone: 'UTC',
    },
    availabilitySlots: [
      { dayOfWeek: 1, startTime: '19:00', endTime: '23:30' },
      { dayOfWeek: 2, startTime: '19:00', endTime: '23:30' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '23:30' },
      { dayOfWeek: 4, startTime: '19:00', endTime: '23:30' },
      { dayOfWeek: 5, startTime: '19:00', endTime: '23:30' },
      { dayOfWeek: 6, startTime: '18:00', endTime: '23:00' },
    ],
    goals: [
      {
        title: 'Quantitative Aptitude Mastery',
        type: 'exam',
        deadlineDays: 17,
        priority: 5,
        targetProficiency: 'mastery',
        color: '#ea580c', // Bright Orange
        description: 'Speed mathematics, algebra, geometry, probability, and numerical problem solving.',
        topics: [
          { title: 'Number Properties, Divisibility & Prime Factors', difficulty: 2, estHours: 2.5 },
          { title: 'Permutations, Combinations & Probability', difficulty: 4, estHours: 4.5 },
          { title: 'Work, Pipes, Time & Relative Speed', difficulty: 3, estHours: 3.5 },
          { title: 'Data Interpretation: Tables, Bar Charts & Pie', difficulty: 3, estHours: 3.5 },
        ],
      },
      {
        title: 'Logical Reasoning & Analytical Puzzles',
        type: 'exam',
        deadlineDays: 24,
        priority: 4,
        targetProficiency: 'proficient',
        color: '#9333ea', // Violet
        description: 'Complex puzzle matrices, syllogisms, and deductive reasoning.',
        topics: [
          { title: 'Circular & Linear Seating Arrangements', difficulty: 4, estHours: 4 },
          { title: 'Syllogisms & Conditional Deductions', difficulty: 3, estHours: 3 },
          { title: 'Critical Reasoning: Assumptions & Inferences', difficulty: 4, estHours: 4 },
        ],
      },
      {
        title: 'Verbal Ability & Reading Comprehension',
        type: 'exam',
        deadlineDays: 31,
        priority: 3,
        targetProficiency: 'proficient',
        color: '#0284c7', // Sky Blue
        description: 'Contextual vocabulary, sentence completion, and argument parsing.',
        topics: [
          { title: 'High-Frequency Etymology & Text Completion', difficulty: 2, estHours: 3 },
          { title: 'Dense Reading Passages & Author Tone', difficulty: 4, estHours: 4 },
          { title: 'Sentence Equivalence & Parallelism Rules', difficulty: 3, estHours: 3 },
        ],
      },
    ],
  },
};

export async function seedUserData(
  userId: string,
  trackKey: string = 'engineering',
  customOptions?: {
    customPreferences?: Partial<UserPreferences>;
    customAvailability?: Omit<AvailabilitySlot, 'id' | 'userId'>[];
  }
) {
  const template = TRACK_DEFINITIONS[trackKey] || TRACK_DEFINITIONS.engineering;

  // 1. User preferences
  const preferences: UserPreferences = {
    sessionLength: template.defaultPreferences.sessionLength || 50,
    breakLength: template.defaultPreferences.breakLength || 10,
    maxHoursPerDay: template.defaultPreferences.maxHoursPerDay || 5,
    preferredTimeOfDay: template.defaultPreferences.preferredTimeOfDay || 'evening',
    daysOff: template.defaultPreferences.daysOff || [0],
    bufferPercent: template.defaultPreferences.bufferPercent || 15,
    studyTrack: trackKey,
    timezone: 'UTC',
    ...customOptions?.customPreferences,
  };
  await Store.updateUserPreferences(userId, preferences);
  await Store.updateUserProfile(userId, { studyTrack: trackKey });

  // 2. Clear existing goals, topics, sessions, availability for this user
  const existingGoals = await Store.getGoals(userId);
  for (const g of existingGoals) {
    await Store.deleteGoal(g.id);
  }

  // 3. Weekly recurring availability
  const availabilitySlots = customOptions?.customAvailability || template.availabilitySlots;
  await Store.setAvailability(userId, availabilitySlots);

  if (trackKey === 'custom') {
    // If custom track, just provide the schedule preferences without pre-creating goals
    await Store.replaceFutureSessions(userId, []);
    return {
      goals: [],
      topicsCount: 0,
      sessionsCount: 0,
      track: 'custom',
    };
  }

  // 4. Create Goals and Topics
  const now = new Date();
  const createdGoals: Goal[] = [];
  const allTopics: Topic[] = [];

  for (const gDef of template.goals) {
    const deadline = addDays(now, gDef.deadlineDays).toISOString();
    const goal = await Store.createGoal({
      userId,
      title: gDef.title,
      type: gDef.type,
      deadline,
      priority: gDef.priority,
      targetProficiency: gDef.targetProficiency,
      color: gDef.color,
      description: gDef.description,
    });
    createdGoals.push(goal);

    for (let i = 0; i < gDef.topics.length; i++) {
      const topData = gDef.topics[i];
      const topic = await Store.createTopic(
        {
          goalId: goal.id,
          title: topData.title,
          difficulty: topData.difficulty,
          estHours: topData.estHours,
          status: i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'not_started',
          order: i,
        },
        userId
      );
      allTopics.push(topic);
    }
  }

  // 5. Generate deterministic study schedule
  const avail = await Store.getAvailability(userId);
  const blocked = await Store.getBlockedDates(userId);

  // Add 1 completed past session yesterday for streak demonstration
  const yesterday = subDays(now, 1);
  const firstGoal = createdGoals[0];
  const firstTopic = allTopics[0];

  const pastSession = {
    id: `sess_past_${userId}_1`,
    userId,
    goalId: firstGoal.id,
    topicId: firstTopic.id,
    title: `Study: ${firstTopic.title}`,
    start: new Date(yesterday.setHours(preferences.preferredTimeOfDay === 'morning' ? 8 : 17, 0, 0, 0)).toISOString(),
    end: new Date(yesterday.setHours(preferences.preferredTimeOfDay === 'morning' ? 8 : 17, preferences.sessionLength, 0, 0)).toISOString(),
    type: 'learn' as const,
    status: 'done' as const,
    actualMinutes: preferences.sessionLength,
    confidence: 5,
    notes: `Completed starter study session in ${firstGoal.title} with solid comprehension.`,
  };

  const scheduleResult = generateSchedule({
    userId,
    goals: createdGoals,
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
    goals: createdGoals,
    topicsCount: allTopics.length,
    sessionsCount: scheduleResult.sessions.length,
    track: trackKey,
  };
}

// Backwards-compatible demo seeder
export async function seedDemoData(userId: string) {
  return seedUserData(userId, 'engineering');
}
