import { apiRequest } from '../api/client';

export type SavedPlan = {
  id: number;
  userId: number;
  activityEmoji: string;
  activityLabel: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  plannedDate: string | null;
  createdAt: string;
};

type SavePlanRequest = {
  activityEmoji: string;
  activityLabel: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  plannedDate: string;
};

/** Plany zalogowanego użytkownika: użytkownik wynika z tokena, nie z userId w adresie. */
export const plansApi = {
  savePlan(request: SavePlanRequest): Promise<SavedPlan> {
    return apiRequest<SavedPlan>('/api/plans', { method: 'POST', body: request });
  },

  getPlans(): Promise<SavedPlan[]> {
    return apiRequest<SavedPlan[]>('/api/plans');
  },

  async deletePlan(planId: number): Promise<void> {
    await apiRequest<null>(`/api/plans/${planId}`, { method: 'DELETE' });
  },
};
