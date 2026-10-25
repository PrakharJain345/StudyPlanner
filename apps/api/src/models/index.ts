import mongoose, { Document, Schema } from 'mongoose';
import {
  AvailabilitySlot,
  BlockedDate,
  Goal,
  PlanDiff,
  Session,
  Topic,
  User,
  UserPreferences,
} from '@ai-study-planner/shared';

// User Schema
export interface UserDoc extends Document, Omit<User, 'id'> {
  password?: string;
}

const UserPreferencesSchema = new Schema<UserPreferences>(
  {
    sessionLength: { type: Number, default: 50 },
    breakLength: { type: Number, default: 10 },
    maxHoursPerDay: { type: Number, default: 6 },
    preferredTimeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'evening',
    },
    daysOff: { type: [Number], default: [0] },
    bufferPercent: { type: Number, default: 15 },
    timezone: { type: String, default: 'UTC' },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDoc>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  preferences: { type: UserPreferencesSchema, default: () => ({}) },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const UserModel = mongoose.model<UserDoc>('User', UserSchema);

// Goal Schema
export interface GoalDoc extends Document, Omit<Goal, 'id'> {}

const GoalMongooseSchema = new Schema<GoalDoc>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['exam', 'assignment', 'project', 'skill'],
    required: true,
  },
  deadline: { type: String, required: true, index: true },
  priority: { type: Number, default: 3 },
  targetProficiency: {
    type: String,
    enum: ['pass', 'proficient', 'mastery'],
    default: 'proficient',
  },
  color: { type: String, default: '#6366f1' },
  description: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const GoalModel = mongoose.model<GoalDoc>('Goal', GoalMongooseSchema);

// Topic Schema
export interface TopicDoc extends Document, Omit<Topic, 'id'> {
  userId: string;
}

const TopicMongooseSchema = new Schema<TopicDoc>({
  goalId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  parentId: { type: String, default: null },
  title: { type: String, required: true },
  difficulty: { type: Number, default: 3 },
  estHours: { type: Number, default: 2 },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  order: { type: Number, default: 0 },
});

export const TopicModel = mongoose.model<TopicDoc>('Topic', TopicMongooseSchema);

// AvailabilitySlot Schema
export interface AvailabilitySlotDoc extends Document, Omit<AvailabilitySlot, 'id'> {}

const AvailabilitySlotMongooseSchema = new Schema<AvailabilitySlotDoc>({
  userId: { type: String, required: true, index: true },
  dayOfWeek: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

export const AvailabilitySlotModel = mongoose.model<AvailabilitySlotDoc>(
  'AvailabilitySlot',
  AvailabilitySlotMongooseSchema
);

// BlockedDate Schema
export interface BlockedDateDoc extends Document, Omit<BlockedDate, 'id'> {}

const BlockedDateMongooseSchema = new Schema<BlockedDateDoc>({
  userId: { type: String, required: true, index: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
});

export const BlockedDateModel = mongoose.model<BlockedDateDoc>(
  'BlockedDate',
  BlockedDateMongooseSchema
);

// Session Schema
export interface SessionDoc extends Document, Omit<Session, 'id'> {}

const SessionMongooseSchema = new Schema<SessionDoc>({
  userId: { type: String, required: true, index: true },
  goalId: { type: String, required: true, index: true },
  topicId: { type: String, default: null },
  title: { type: String, required: true },
  start: { type: String, required: true, index: true },
  end: { type: String, required: true },
  type: {
    type: String,
    enum: ['learn', 'practice', 'revise', 'buffer'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'done', 'partial', 'skipped'],
    default: 'pending',
    index: true,
  },
  actualMinutes: { type: Number },
  confidence: { type: Number },
  notes: { type: String },
  revisionNumber: { type: Number },
});

export const SessionModel = mongoose.model<SessionDoc>('Session', SessionMongooseSchema);

// PlanVersion Schema
export interface PlanVersionDoc extends Document {
  userId: string;
  trigger: string;
  summary: string;
  diff: PlanDiff;
  createdAt: string;
}

const PlanVersionSchema = new Schema<PlanVersionDoc>({
  userId: { type: String, required: true, index: true },
  trigger: { type: String, required: true },
  summary: { type: String, required: true },
  diff: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const PlanVersionModel = mongoose.model<PlanVersionDoc>('PlanVersion', PlanVersionSchema);
