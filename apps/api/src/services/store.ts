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
import { isDbConnected } from '../db.js';
import {
  AvailabilitySlotModel,
  BlockedDateModel,
  GoalModel,
  PlanVersionModel,
  SessionModel,
  TopicModel,
  UserModel,
} from '../models/index.js';

// In-Memory Fallback State
const memUsers: Map<string, User & { password?: string }> = new Map();
const memGoals: Map<string, Goal> = new Map();
const memTopics: Map<string, Topic> = new Map();
const memAvailability: Map<string, AvailabilitySlot> = new Map();
const memBlockedDates: Map<string, BlockedDate> = new Map();
const memSessions: Map<string, Session> = new Map();
const memPlanVersions: Map<string, { id: string; userId: string; trigger: string; summary: string; diff: PlanDiff; createdAt: string }> = new Map();

export const Store = {
  // Users
  async findUserByEmail(email: string): Promise<(User & { password?: string }) | null> {
    if (isDbConnected()) {
      const doc = await UserModel.findOne({ email }).lean();
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name,
        password: doc.password,
        studyTrack: doc.studyTrack || 'engineering',
        avatar: doc.avatar,
        preferences: doc.preferences as UserPreferences,
        createdAt: doc.createdAt,
      };
    }
    for (const u of memUsers.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  },

  async findUserById(id: string): Promise<User | null> {
    if (isDbConnected()) {
      const doc = await UserModel.findById(id).lean();
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name,
        studyTrack: doc.studyTrack || 'engineering',
        avatar: doc.avatar,
        preferences: doc.preferences as UserPreferences,
        createdAt: doc.createdAt,
      };
    }
    const u = memUsers.get(id);
    if (!u) return null;
    const { password: _, ...userSafe } = u;
    return userSafe;
  },

  async createUser(user: Omit<User, 'id'> & { password?: string }): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const studyTrack = user.studyTrack || 'engineering';
    if (isDbConnected()) {
      const doc = await UserModel.create({ ...user, studyTrack });
      return {
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name,
        studyTrack: doc.studyTrack || 'engineering',
        avatar: doc.avatar,
        preferences: doc.preferences as UserPreferences,
        createdAt: doc.createdAt,
      };
    }
    const created: User & { password?: string } = { ...user, id, studyTrack };
    memUsers.set(id, created);
    const { password: _, ...safe } = created;
    return safe;
  },

  async updateUserProfile(
    userId: string,
    updates: { name?: string; studyTrack?: string; avatar?: string }
  ): Promise<User | null> {
    if (isDbConnected()) {
      const doc = await UserModel.findByIdAndUpdate(userId, updates, { new: true }).lean();
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name,
        studyTrack: doc.studyTrack || 'engineering',
        avatar: doc.avatar,
        preferences: doc.preferences as UserPreferences,
        createdAt: doc.createdAt,
      };
    }
    const user = memUsers.get(userId);
    if (!user) return null;
    const updated = { ...user, ...updates };
    memUsers.set(userId, updated);
    const { password: _, ...safe } = updated;
    return safe;
  },

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    if (isDbConnected()) {
      const doc = await UserModel.findById(userId);
      if (doc) {
        doc.preferences = { ...doc.preferences, ...preferences };
        if (preferences.studyTrack) {
          doc.studyTrack = preferences.studyTrack;
        }
        await doc.save();
        return doc.preferences as UserPreferences;
      }
    }
    const user = memUsers.get(userId);
    if (user) {
      user.preferences = { ...user.preferences, ...preferences };
      if (preferences.studyTrack) {
        user.studyTrack = preferences.studyTrack;
      }
      memUsers.set(userId, user);
      return user.preferences;
    }
    return preferences as UserPreferences;
  },

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    if (isDbConnected()) {
      const docs = await GoalModel.find({ userId }).lean();
      return docs.map((d) => ({
        id: d._id.toString(),
        userId: d.userId,
        title: d.title,
        type: d.type as any,
        deadline: d.deadline,
        priority: d.priority,
        targetProficiency: d.targetProficiency as any,
        color: d.color,
        description: d.description,
        createdAt: d.createdAt,
      }));
    }
    return Array.from(memGoals.values()).filter((g) => g.userId === userId);
  },

  async createGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (isDbConnected()) {
      const doc = await GoalModel.create(goal);
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        title: doc.title,
        type: doc.type as any,
        deadline: doc.deadline,
        priority: doc.priority,
        targetProficiency: doc.targetProficiency as any,
        color: doc.color,
        description: doc.description,
        createdAt: doc.createdAt,
      };
    }
    const created: Goal = { ...goal, id };
    memGoals.set(id, created);
    return created;
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    if (isDbConnected()) {
      const doc = await GoalModel.findByIdAndUpdate(goalId, updates, { new: true }).lean();
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        title: doc.title,
        type: doc.type as any,
        deadline: doc.deadline,
        priority: doc.priority,
        targetProficiency: doc.targetProficiency as any,
        color: doc.color,
        description: doc.description,
      };
    }
    const existing = memGoals.get(goalId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    memGoals.set(goalId, updated);
    return updated;
  },

  async deleteGoal(goalId: string): Promise<boolean> {
    if (isDbConnected()) {
      await GoalModel.findByIdAndDelete(goalId);
      await TopicModel.deleteMany({ goalId });
      await SessionModel.deleteMany({ goalId });
      return true;
    }
    memGoals.delete(goalId);
    for (const [tId, topic] of memTopics.entries()) {
      if (topic.goalId === goalId) memTopics.delete(tId);
    }
    for (const [sId, sess] of memSessions.entries()) {
      if (sess.goalId === goalId) memSessions.delete(sId);
    }
    return true;
  },

  // Topics
  async getTopics(goalId?: string, userId?: string): Promise<Topic[]> {
    if (isDbConnected()) {
      const query: any = {};
      if (goalId) query.goalId = goalId;
      if (userId) query.userId = userId;
      const docs = await TopicModel.find(query).sort({ order: 1 }).lean();
      return docs.map((d) => ({
        id: d._id.toString(),
        goalId: d.goalId,
        parentId: d.parentId || null,
        title: d.title,
        difficulty: d.difficulty,
        estHours: d.estHours,
        status: d.status as any,
        order: d.order,
      }));
    }
    return Array.from(memTopics.values()).filter((t) => {
      if (goalId && t.goalId !== goalId) return false;
      return true;
    });
  },

  async createTopic(topic: Omit<Topic, 'id'>, userId: string): Promise<Topic> {
    const id = `top_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (isDbConnected()) {
      const doc = await TopicModel.create({ ...topic, userId });
      return {
        id: doc._id.toString(),
        goalId: doc.goalId,
        parentId: doc.parentId || null,
        title: doc.title,
        difficulty: doc.difficulty,
        estHours: doc.estHours,
        status: doc.status as any,
        order: doc.order,
      };
    }
    const created: Topic = { ...topic, id };
    memTopics.set(id, created);
    return created;
  },

  async updateTopic(topicId: string, updates: Partial<Topic>): Promise<Topic | null> {
    if (isDbConnected()) {
      const doc = await TopicModel.findByIdAndUpdate(topicId, updates, { new: true }).lean();
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        goalId: doc.goalId,
        parentId: doc.parentId || null,
        title: doc.title,
        difficulty: doc.difficulty,
        estHours: doc.estHours,
        status: doc.status as any,
        order: doc.order,
      };
    }
    const existing = memTopics.get(topicId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    memTopics.set(topicId, updated);
    return updated;
  },

  // Availability
  async getAvailability(userId: string): Promise<AvailabilitySlot[]> {
    if (isDbConnected()) {
      const docs = await AvailabilitySlotModel.find({ userId }).sort({ dayOfWeek: 1, startTime: 1 }).lean();
      return docs.map((d) => ({
        id: d._id.toString(),
        userId: d.userId,
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
      }));
    }
    return Array.from(memAvailability.values()).filter((a) => a.userId === userId);
  },

  async setAvailability(userId: string, slots: Omit<AvailabilitySlot, 'id' | 'userId'>[]): Promise<AvailabilitySlot[]> {
    if (isDbConnected()) {
      await AvailabilitySlotModel.deleteMany({ userId });
      const createdDocs = await AvailabilitySlotModel.insertMany(
        slots.map((s) => ({ ...s, userId }))
      );
      return createdDocs.map((d) => ({
        id: d._id.toString(),
        userId: d.userId,
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
      }));
    }
    for (const [id, slot] of memAvailability.entries()) {
      if (slot.userId === userId) memAvailability.delete(id);
    }
    const result: AvailabilitySlot[] = [];
    slots.forEach((s, idx) => {
      const id = `avail_${Date.now()}_${idx}`;
      const slot: AvailabilitySlot = { ...s, id, userId };
      memAvailability.set(id, slot);
      result.push(slot);
    });
    return result;
  },

  // Blocked Dates
  async getBlockedDates(userId: string): Promise<BlockedDate[]> {
    if (isDbConnected()) {
      const docs = await BlockedDateModel.find({ userId }).sort({ startDate: 1 }).lean();
      return docs.map((d) => ({
        id: d._id.toString(),
        userId: d.userId,
        startDate: d.startDate,
        endDate: d.endDate,
        reason: d.reason,
      }));
    }
    return Array.from(memBlockedDates.values()).filter((b) => b.userId === userId);
  },

  async addBlockedDate(blocked: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    const id = `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (isDbConnected()) {
      const doc = await BlockedDateModel.create(blocked);
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        startDate: doc.startDate,
        endDate: doc.endDate,
        reason: doc.reason,
      };
    }
    const created: BlockedDate = { ...blocked, id };
    memBlockedDates.set(id, created);
    return created;
  },

  async deleteBlockedDate(id: string): Promise<boolean> {
    if (isDbConnected()) {
      await BlockedDateModel.findByIdAndDelete(id);
      return true;
    }
    return memBlockedDates.delete(id);
  },

  // Sessions
  async getSessions(userId: string, from?: string, to?: string): Promise<Session[]> {
    if (isDbConnected()) {
      const query: any = { userId };
      if (from || to) {
        query.start = {};
        if (from) query.start.$gte = from;
        if (to) query.start.$lte = to;
      }
      const docs = await SessionModel.find(query).sort({ start: 1 }).lean();
      return docs.map((d) => ({
        id: d._id.toString(),
        userId: d.userId,
        goalId: d.goalId,
        topicId: d.topicId || null,
        title: d.title,
        start: d.start,
        end: d.end,
        type: d.type as any,
        status: d.status as any,
        actualMinutes: d.actualMinutes,
        confidence: d.confidence,
        notes: d.notes,
        revisionNumber: d.revisionNumber,
      }));
    }
    return Array.from(memSessions.values())
      .filter((s) => {
        if (s.userId !== userId) return false;
        if (from && s.start < from) return false;
        if (to && s.start > to) return false;
        return true;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  },

  async replaceFutureSessions(userId: string, newSessions: Session[]): Promise<Session[]> {
    const now = new Date().toISOString();
    if (isDbConnected()) {
      // Remove pending future sessions
      await SessionModel.deleteMany({
        userId,
        status: 'pending',
        start: { $gte: now },
      });

      // Filter only new sessions that need inserting
      const toInsert = newSessions
        .filter((s) => s.status === 'pending' && s.start >= now)
        .map((s) => ({
          userId: s.userId,
          goalId: s.goalId,
          topicId: s.topicId || null,
          title: s.title,
          start: s.start,
          end: s.end,
          type: s.type,
          status: s.status,
          revisionNumber: s.revisionNumber,
        }));

      if (toInsert.length > 0) {
        await SessionModel.insertMany(toInsert);
      }
      return this.getSessions(userId);
    }

    // In-memory update
    for (const [id, s] of memSessions.entries()) {
      if (s.userId === userId && s.status === 'pending' && s.start >= now) {
        memSessions.delete(id);
      }
    }
    for (const s of newSessions) {
      memSessions.set(s.id, s);
    }
    return Array.from(memSessions.values()).filter((s) => s.userId === userId);
  },

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
    if (isDbConnected()) {
      const doc = await SessionModel.findByIdAndUpdate(sessionId, updates, { new: true }).lean();
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        goalId: doc.goalId,
        topicId: doc.topicId || null,
        title: doc.title,
        start: doc.start,
        end: doc.end,
        type: doc.type as any,
        status: doc.status as any,
        actualMinutes: doc.actualMinutes,
        confidence: doc.confidence,
        notes: doc.notes,
        revisionNumber: doc.revisionNumber,
      };
    }
    const sess = memSessions.get(sessionId);
    if (!sess) return null;
    const updated = { ...sess, ...updates };
    memSessions.set(sessionId, updated);
    return updated;
  },

  async savePlanVersion(userId: string, trigger: string, summary: string, diff: PlanDiff) {
    const id = `plan_${Date.now()}`;
    if (isDbConnected()) {
      await PlanVersionModel.create({ userId, trigger, summary, diff });
      return;
    }
    memPlanVersions.set(id, { id, userId, trigger, summary, diff, createdAt: new Date().toISOString() });
  },

  async getLatestPlanVersion(userId: string) {
    if (isDbConnected()) {
      return PlanVersionModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
    }
    const versions = Array.from(memPlanVersions.values()).filter((v) => v.userId === userId);
    return versions.length > 0 ? versions[versions.length - 1] : null;
  },
};
