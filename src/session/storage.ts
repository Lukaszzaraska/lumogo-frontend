import * as SecureStore from 'expo-secure-store';
import type { SessionUser } from '../api/auth';

const KEY = 'lumogo.session.v1';

export type StoredSession = {
  token: string;
  user: SessionUser;
};

/**
 * Token w Keystore (Android) / Keychain (iOS). W przeglądarce SecureStore nie działa:
 * wtedy sesja nie jest zapamiętywana, a błędy są ignorowane.
 */
export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    return parsed.token && parsed.user ? (parsed as StoredSession) : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: StoredSession) {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(session));
  } catch {
    // brak trwałej sesji (np. web) nie blokuje logowania
  }
}

export async function clearSession() {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // jak wyżej
  }
}
