const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://lumogo.onrender.com').replace(/\/$/, '');

export type UserPreferences = {
  defaultDuration: number;
  favoriteActivities: string;
};

async function readErrorMessage(response: Response) {
  const body = await response.json().catch(() => null) as { message?: string } | null;
  return body?.message ?? `Request failed (${response.status}).`;
}

export const preferencesApi = {
  async get(userId: number): Promise<UserPreferences> {
    const response = await fetch(`${API_URL}/api/users/${userId}/preferences`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  async update(userId: number, prefs: UserPreferences): Promise<UserPreferences> {
    const response = await fetch(`${API_URL}/api/users/${userId}/preferences`, {
      body: JSON.stringify(prefs),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },
};
