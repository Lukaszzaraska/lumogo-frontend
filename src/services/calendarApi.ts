import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
// Kalendarz Google nie ma jeszcze backendu: wywołania kończą się błędem, a aplikacja
// traktuje kalendarz jako niepołączony. Adres serwera wspólny z resztą API.
import { API_URL } from '../api/config';

const INSTALLATION_ID_KEY = 'lumogo.installationId';

export type BusyPeriod = {
  end: string;
  start: string;
};

type ExchangeCodeRequest = {
  authorizationCode: string;
};

async function getInstallationId() {
  const existingId = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
  if (existingId) return existingId;

  const installationId = Crypto.randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_ID_KEY, installationId);
  return installationId;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const installationId = await getInstallationId();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Lumo-Installation-Id': installationId,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `Calendar request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export const calendarApi = {
  async exchangeCode(body: ExchangeCodeRequest) {
    return request<{ connected: boolean }>('/api/calendar/oauth/exchange', {
      body: JSON.stringify(body),
      method: 'POST',
    });
  },

  async getBusyPeriods(timeMin: Date, timeMax: Date, timeZone: string) {
    const params = new URLSearchParams({
      timeMax: timeMax.toISOString(),
      timeMin: timeMin.toISOString(),
      timeZone,
    });
    const result = await request<{ busy: BusyPeriod[] }>(`/api/calendar/busy?${params}`);
    return result.busy;
  },

  async getStatus() {
    return request<{ connected: boolean }>('/api/calendar/status');
  },
};
