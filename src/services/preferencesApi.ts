import { apiRequest } from '../api/client';

export type UserPreferences = {
  defaultDuration: number;
  favoriteActivities: string;
};

/** Preferencje zalogowanego użytkownika (z tokena). */
export const preferencesApi = {
  get(): Promise<UserPreferences> {
    return apiRequest<UserPreferences>('/api/preferences');
  },

  update(prefs: UserPreferences): Promise<UserPreferences> {
    return apiRequest<UserPreferences>('/api/preferences', { method: 'PUT', body: prefs });
  },
};
