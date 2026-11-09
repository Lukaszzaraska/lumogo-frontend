import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { LoginResponse } from '../services/authApi';

type AuthContextValue = {
  user: LoginResponse | null;
  setUser: (user: LoginResponse | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const logout = useCallback(() => setUser(null), []);
  const value = useMemo(() => ({ user, setUser, logout }), [user, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
