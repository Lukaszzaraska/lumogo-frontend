import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { preferencesApi } from '../services/preferencesApi';

type PreferencesContextValue = {
  defaultDuration: number;
  favoriteActivities: string[];
  loaded: boolean;
  save: (duration: number, activities: string[]) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue>({
  defaultDuration: 30,
  favoriteActivities: [],
  loaded: false,
  save: async () => {},
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [defaultDuration, setDefaultDuration] = useState(30);
  const [favoriteActivities, setFavoriteActivities] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setDefaultDuration(30);
      setFavoriteActivities([]);
      setLoaded(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const prefs = await preferencesApi.get();
        if (cancelled) return;
        setDefaultDuration(prefs.defaultDuration);
        setFavoriteActivities(
          prefs.favoriteActivities ? prefs.favoriteActivities.split(',').filter(Boolean) : [],
        );
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  const save = useCallback(async (duration: number, activities: string[]) => {
    if (!user) return;
    const prefs = await preferencesApi.update({
      defaultDuration: duration,
      favoriteActivities: activities.join(','),
    });
    setDefaultDuration(prefs.defaultDuration);
    setFavoriteActivities(
      prefs.favoriteActivities ? prefs.favoriteActivities.split(',').filter(Boolean) : [],
    );
  }, [user]);

  return (
    <PreferencesContext.Provider value={{ defaultDuration, favoriteActivities, loaded, save }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
