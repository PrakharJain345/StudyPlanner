import { z } from 'zod';

export const PreferredTimeOfDaySchema = z.enum(['morning', 'afternoon', 'evening', 'night']);
export type PreferredTimeOfDay = z.infer<typeof PreferredTimeOfDaySchema>;

export const GoalTypeSchema = z.enum(['exam', 'assignment', 'project', 'skill']);
export type GoalType = z.infer<typeof GoalTypeSchema>;

export const TargetProficiencySchema = z.enum(['pass', 'proficient', 'mastery']);
export type TargetProficiency = z.infer<typeof TargetProficiencySchema>;

export const TopicStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);
export type TopicStatus = z.infer<typeof TopicStatusSchema>;

export const SessionTypeSchema = z.enum(['learn', 'practice', 'revise', 'buffer']);
export type SessionType = z.infer<typeof SessionTypeSchema>;

export const SessionStatusSchema = z.enum(['pending', 'done', 'partial', 'skipped']);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const StudyTrackSchema = z.enum([
  'engineering',
  'medical',
  'business',
  'competitive',
  'highschool',
  'custom',
]);
export type StudyTrack = z.infer<typeof StudyTrackSchema>;

export const UserPreferencesSchema = z.object({
  sessionLength: z.number().min(20).max(180).default(50), // minutes
  breakLength: z.number().min(5).max(45).default(10), // minutes
  maxHoursPerDay: z.number().min(1).max(16).default(6),
  preferredTimeOfDay: PreferredTimeOfDaySchema.default('evening'),
  daysOff: z.array(z.number().min(0).max(6)).default([0]), // 0 = Sunday
  bufferPercent: z.number().min(5).max(30).default(15),
  timezone: z.string().default('UTC'),
  studyTrack: z.string().default('engineering').optional(),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  studyTrack: z.string().default('engineering').optional(),
  avatar: z.string().optional(),
  preferences: UserPreferencesSchema,
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const GoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1),
  type: GoalTypeSchema,
  deadline: z.string(), // ISO string
  priority: z.number().min(1).max(5).default(3),
  targetProficiency: TargetProficiencySchema.default('proficient'),
  color: z.string().default('#6366f1'),
  description: z.string().optional(),
  createdAt: z.string().optional(),
});
export type Goal = z.infer<typeof GoalSchema>;

export const TopicSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  parentId: z.string().nullable().optional(),
  title: z.string().min(1),
  difficulty: z.number().min(1).max(5).default(3), // 1 = very easy, 5 = very hard
  estHours: z.number().min(0.5).max(100).default(2),
  status: TopicStatusSchema.default('not_started'),
  order: z.number().default(0),
});
export type Topic = z.infer<typeof TopicSchema>;

export const AvailabilitySlotSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 1 = Monday ... 6 = Saturday
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm
});
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;

export const BlockedDateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  startDate: z.string(), // ISO
  endDate: z.string(), // ISO
  reason: z.string().min(1),
});
export type BlockedDate = z.infer<typeof BlockedDateSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  goalId: z.string(),
  topicId: z.string().nullable().optional(),
  title: z.string(),
  start: z.string(), // ISO
  end: z.string(), // ISO
  type: SessionTypeSchema,
  status: SessionStatusSchema.default('pending'),
  actualMinutes: z.number().optional(),
  confidence: z.number().min(1).max(5).optional(), // 1-5 rating after session
  notes: z.string().optional(),
  revisionNumber: z.number().optional(),
});
export type Session = z.infer<typeof SessionSchema>;

export const PlanDiffSessionActionSchema = z.object({
  action: z.enum(['added', 'moved', 'removed', 'adjusted']),
  session: SessionSchema,
  previousStart: z.string().optional(),
  previousEnd: z.string().optional(),
});
export type PlanDiffSessionAction = z.infer<typeof PlanDiffSessionActionSchema>;

export const PlanDiffSchema = z.object({
  affectedSessions: z.array(PlanDiffSessionActionSchema),
  summary: z.string(),
  totalMoved: z.number(),
  totalAdjusted: z.number(),
  shortfallHours: z.number().optional(),
  feasibility: z.enum(['feasible', 'tight', 'infeasible']),
  recommendations: z.array(z.string()).optional(),
});
export type PlanDiff = z.infer<typeof PlanDiffSchema>;

export const AssistantActionTypeSchema = z.enum([
  'block_date',
  'move_session',
  'change_deadline',
  'replan',
  'add_goal',
  'mark_session',
]);
export type AssistantActionType = z.infer<typeof AssistantActionTypeSchema>;

export const AssistantProposalSchema = z.object({
  id: z.string(),
  actionType: AssistantActionTypeSchema,
  description: z.string(),
  details: z.record(z.any()),
  diffPreview: PlanDiffSchema.optional(),
});
export type AssistantProposal = z.infer<typeof AssistantProposalSchema>;

export const DashboardSummarySchema = z.object({
  totalHoursStudied: z.number(),
  totalTargetHours: z.number(),
  completionRate: z.number(), // 0 - 100
  streakDays: z.number(),
  sessionsCompleted: z.number(),
  sessionsUpcoming: z.number(),
  sessionsSkipped: z.number(),
  goalStatuses: z.array(
    z.object({
      goalId: z.string(),
      title: z.string(),
      color: z.string(),
      deadline: z.string(),
      progressPercent: z.number(),
      risk: z.enum(['on-track', 'at-risk', 'behind']),
      requiredHoursRemaining: z.number(),
      availableHoursRemaining: z.number(),
    })
  ),
});
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
