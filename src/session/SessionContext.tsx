import React, { createContext, useContext, useMemo, useState } from 'react';
import type { SessionUser } from '../api/auth';

type SessionContextValue = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Zalogowany użytkownik trzymany w pamięci. Po zamknięciu aplikacji trzeba
 * zalogować się ponownie; trwała sesja wymaga tokena z backendu (obecnie go nie ma).
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return context;
}
