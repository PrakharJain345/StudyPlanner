export * from './schemas.js';

export interface PlanGenerationInput {
  userId: string;
  goals: import('./schemas.js').Goal[];
  topics: import('./schemas.js').Topic[];
  availability: import('./schemas.js').AvailabilitySlot[];
  blockedDates: import('./schemas.js').BlockedDate[];
  preferences: import('./schemas.js').UserPreferences;
  existingSessions?: import('./schemas.js').Session[];
  startDate?: Date;
  horizonWeeks?: number;
}

export interface PlanGenerationResult {
  sessions: import('./schemas.js').Session[];
  diff?: import('./schemas.js').PlanDiff;
  feasibility: 'feasible' | 'tight' | 'infeasible';
  shortfallHours: number;
  warnings: string[];
  metrics: {
    totalAllocatedHours: number;
    totalRequiredHours: number;
    bufferHours: number;
    utilizationPercent: number;
  };
}

export interface ReplanInput extends PlanGenerationInput {
  trigger: 'session_skipped' | 'session_partial' | 'deadline_changed' | 'goal_added' | 'availability_changed' | 'manual';
  triggerDetails?: {
    sessionId?: string;
    goalId?: string;
    date?: string;
  };
}

export interface AIAutoBreakdownRequest {
  title: string;
  type?: import('./schemas.js').GoalType;
  deadline?: string;
  syllabusText?: string;
  targetProficiency?: import('./schemas.js').TargetProficiency;
}

export interface AIAutoBreakdownResponse {
  topics: Array<{
    title: string;
    difficulty: number;
    estHours: number;
    subtopics?: Array<{
      title: string;
      difficulty: number;
      estHours: number;
    }>;
  }>;
  suggestedTotalHours: number;
  reasoning: string;
}
