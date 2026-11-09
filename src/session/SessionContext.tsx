import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchProfile, type AuthResult, type SessionUser } from '../api/auth';
import { ApiError, setAuthToken, setUnauthorizedHandler } from '../api/client';
import { clearSession, loadSession, saveSession } from './storage';

type SessionContextValue = {
  user: SessionUser | null;
  /** true, dopóki przy starcie aplikacji odczytujemy zapisaną sesję. */
  isRestoring: boolean;
  signIn: (result: AuthResult) => Promise<void>;
  signOut: () => Promise<void>;
  /** Podmiana danych użytkownika po edycji profilu (token bez zmian). */
  updateUser: (user: SessionUser) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await clearSession();
  }, []);

  const signIn = useCallback(async ({ user: signedInUser, token }: AuthResult) => {
    setAuthToken(token);
    setUser(signedInUser);
    await saveSession({ token, user: signedInUser });
  }, []);

  const updateUser = useCallback(async (updated: SessionUser) => {
    setUser(updated);
    const stored = await loadSession();
    if (stored) await saveSession({ token: stored.token, user: updated });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  useEffect(() => {
    let active = true;

    (async () => {
      const stored = await loadSession();
      if (!stored) {
        if (active) setIsRestoring(false);
        return;
      }

      setAuthToken(stored.token);
      if (active) {
        setUser(stored.user);
        // Start aplikacji nie czeka na sieć: odświeżenie profilu leci w tle.
        setIsRestoring(false);
      }

      try {
        // Odświeżenie danych i sprawdzenie, czy token jest nadal ważny.
        const fresh = await fetchProfile();
        if (!active) return;
        setUser(fresh);
        await saveSession({ token: stored.token, user: fresh });
      } catch (error) {
        // Bez sieci zostajemy przy zapisanej sesji; 401 obsługuje handler, 404 = konto usunięte.
        if (error instanceof ApiError && error.status === 404) {
          await signOut();
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [signOut]);

  const value = useMemo(
    () => ({ user, isRestoring, signIn, signOut, updateUser }),
    [user, isRestoring, signIn, signOut, updateUser],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return context;
}
