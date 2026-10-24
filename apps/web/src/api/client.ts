import {
  AIAutoBreakdownRequest,
  AIAutoBreakdownResponse,
  AssistantProposal,
  AvailabilitySlot,
  BlockedDate,
  DashboardSummary,
  Goal,
  PlanDiff,
  PlanGenerationResult,
  Session,
  Topic,
  User,
  UserPreferences,
} from '@ai-study-planner/shared';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('study_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('study_token', data.token);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('study_token', data.token);
    return data;
  },

  async demoLogin(): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Demo login failed');
    }
    const data = await res.json();
    localStorage.setItem('study_token', data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<{ preferences: UserPreferences }> {
    const res = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(preferences),
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  },

  // Goals & Topics
  async getGoals(): Promise<{ goals: Goal[] }> {
    const res = await fetch(`${API_BASE}/goals`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },

  async createGoal(goal: Partial<Goal>): Promise<{ goal: Goal }> {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error('Failed to create goal');
    return res.json();
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<{ goal: Goal }> {
    const res = await fetch(`${API_BASE}/goals/${goalId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    return res.json();
  },

  async deleteGoal(goalId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/goals/${goalId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete goal');
    return res.json();
  },

  async getTopics(goalId: string): Promise<{ topics: Topic[] }> {
    const res = await fetch(`${API_BASE}/goals/${goalId}/topics`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch topics');
    return res.json();
  },

  async createTopic(goalId: string, topic: Partial<Topic>): Promise<{ topic: Topic }> {
    const res = await fetch(`${API_BASE}/goals/${goalId}/topics`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(topic),
    });
    if (!res.ok) throw new Error('Failed to create topic');
    return res.json();
  },

  async generateBreakdown(params: {
    goalId?: string;
    title?: string;
    syllabusText?: string;
    autoSave?: boolean;
  }): Promise<{ breakdown: AIAutoBreakdownResponse; savedTopics?: Topic[] }> {
    const res = await fetch(`${API_BASE}/goals/breakdown`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate breakdown');
    return res.json();
  },

  // Availability & Blocked Dates
  async getAvailability(): Promise<{ availability: AvailabilitySlot[] }> {
    const res = await fetch(`${API_BASE}/availability`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch availability');
    return res.json();
  },

  async setAvailability(slots: Omit<AvailabilitySlot, 'id' | 'userId'>[]): Promise<{ availability: AvailabilitySlot[] }> {
    const res = await fetch(`${API_BASE}/availability`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ slots }),
    });
    if (!res.ok) throw new Error('Failed to update availability');
    return res.json();
  },

  async getBlockedDates(): Promise<{ blockedDates: BlockedDate[] }> {
    const res = await fetch(`${API_BASE}/availability/blocked-dates`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch blocked dates');
    return res.json();
  },

  async addBlockedDate(blocked: Omit<BlockedDate, 'id' | 'userId'>): Promise<{ blockedDate: BlockedDate }> {
    const res = await fetch(`${API_BASE}/availability/blocked-dates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(blocked),
    });
    if (!res.ok) throw new Error('Failed to add blocked date');
    return res.json();
  },

  async deleteBlockedDate(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/availability/blocked-dates/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete blocked date');
    return res.json();
  },

  // Plan & Sessions
  async generatePlan(): Promise<PlanGenerationResult> {
    const res = await fetch(`${API_BASE}/plan/generate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate plan');
    return res.json();
  },

  async replan(trigger: string = 'manual'): Promise<PlanGenerationResult> {
    const res = await fetch(`${API_BASE}/plan/replan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ trigger }),
    });
    if (!res.ok) throw new Error('Failed to replan');
    return res.json();
  },

  async applyPlan(sessions: Session[], diff?: PlanDiff): Promise<{ success: boolean; sessions: Session[] }> {
    const res = await fetch(`${API_BASE}/plan/apply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessions, diff }),
    });
    if (!res.ok) throw new Error('Failed to apply plan');
    return res.json();
  },

  async getSessions(from?: string, to?: string): Promise<{ sessions: Session[] }> {
    const query = new URLSearchParams();
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    const res = await fetch(`${API_BASE}/sessions?${query.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async updateSession(
    sessionId: string,
    updates: Partial<Session>
  ): Promise<{ session: Session; replanRecommended: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update session');
    return res.json();
  },

  // Dashboard
  async getDashboardSummary(): Promise<{ summary: DashboardSummary }> {
    const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  // Assistant
  async sendAssistantMessage(message: string): Promise<{ reply: string; proposal?: AssistantProposal }> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Assistant error');
    return res.json();
  },

  async applyAssistantProposal(actionType: string, details: any): Promise<{ success: boolean; message: string; diff?: PlanDiff }> {
    const res = await fetch(`${API_BASE}/assistant/apply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ actionType, details }),
    });
    if (!res.ok) throw new Error('Failed to apply assistant proposal');
    return res.json();
  },

  // Reset Demo
  async resetDemo(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reset-demo`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reset demo');
    return res.json();
  },
};
