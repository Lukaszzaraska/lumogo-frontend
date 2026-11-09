const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://lumogo.onrender.com').replace(/\/$/, '');

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
  userId: number;
  activityEmoji: string;
  activityLabel: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  plannedDate: string;
};

async function readErrorMessage(response: Response) {
  const body = await response.json().catch(() => null) as { message?: string } | null;
  return body?.message ?? `Request failed (${response.status}).`;
}

export const plansApi = {
  async savePlan(request: SavePlanRequest): Promise<SavedPlan> {
    const response = await fetch(`${API_URL}/api/plans`, {
      body: JSON.stringify(request),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  async getPlans(userId: number): Promise<SavedPlan[]> {
    const response = await fetch(`${API_URL}/api/plans/${userId}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  async deletePlan(planId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/plans/${planId}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(await readErrorMessage(response));
    }
  },
};
