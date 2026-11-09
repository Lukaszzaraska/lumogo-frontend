import { useSession } from '../session/SessionContext';

/**
 * Zgodność z ekranami LUM-54: `useAuth()` to cienka nakładka na SessionContext
 * (token JWT, sesja w expo-secure-store). Logowanie: `signIn(await login(...))`.
 */
export function useAuth() {
  const { user, signIn, signOut, updateUser } = useSession();
  return {
    user,
    signIn,
    updateUser,
    logout: () => void signOut(),
  };
}
