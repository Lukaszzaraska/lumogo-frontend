import { API_URL, REQUEST_TIMEOUT_MS } from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

const NETWORK_ERROR_MESSAGE = 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.';

function buildUrl(path: string, query?: RequestOptions['query']) {
  const params = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${API_URL}${path}${params ? `?${params}` : ''}`;
}

/**
 * Wspólne wywołanie API. Rzuca ApiError, gdy:
 * - nie ma połączenia lub minął limit czasu,
 * - serwer zwrócił kod inny niż 2xx,
 * - serwer zwrócił 200, ale z polem status: "error" (tak odpowiada część endpointów).
 */
export async function apiRequest<T>(path: string, { method = 'GET', body, query }: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, null);
  } finally {
    clearTimeout(timeout);
  }

  const payload: unknown = await response.json().catch(() => null);
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  const serverMessage = typeof record?.message === 'string' ? record.message : null;

  if (!response.ok || record?.status === 'error') {
    throw new ApiError(serverMessage ?? `Błąd serwera (${response.status}).`, response.status);
  }

  return payload as T;
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : NETWORK_ERROR_MESSAGE;
}
