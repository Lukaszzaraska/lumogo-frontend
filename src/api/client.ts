import { t, type TranslationKey } from '../i18n';
import { API_URL, REQUEST_TIMEOUT_MS } from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    /** Kod HTTP; null, gdy nie udało się połączyć z serwerem. */
    readonly status: number | null,
    /** Kod błędu z backendu, np. EMAIL_TAKEN. */
    readonly code: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Domyślnie true: dołącz token, jeśli jest. */
  auth?: boolean;
};

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Ustawiane przez SessionProvider po zalogowaniu i przy starcie aplikacji. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Wywoływane, gdy serwer odrzuci token (wygasł lub jest nieważny). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const params = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${API_URL}${path}${params ? `?${params}` : ''}`;
}

/**
 * Wspólne wywołanie API. Rzuca ApiError, gdy:
 * - nie ma połączenia lub minął limit czasu (status null),
 * - serwer zwrócił kod inny niż 2xx lub pole status: "error".
 */
export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, query, auth = true }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const sendsToken = auth && authToken !== null;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (sendsToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('Network request failed', null);
  } finally {
    clearTimeout(timeout);
  }

  const payload: unknown = await response.json().catch(() => null);
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  const serverMessage = typeof record?.message === 'string' ? record.message : null;
  const code = typeof record?.code === 'string' ? record.code : null;

  if (response.status === 401 && sendsToken) {
    onUnauthorized?.();
  }

  if (!response.ok || record?.status === 'error') {
    throw new ApiError(serverMessage ?? `HTTP ${response.status}`, response.status, code);
  }

  return payload as T;
}

const knownErrorCodes = ['EMAIL_TAKEN', 'INVALID_CREDENTIALS', 'VALIDATION_ERROR', 'USER_NOT_FOUND'] as const;

/** Komunikat dla użytkownika w języku aplikacji (tłumaczony z kodu, nie z polskiego `message`). */
export function errorMessage(error: unknown) {
  if (!(error instanceof ApiError) || error.status === null) {
    return t('errors.network');
  }
  const code = knownErrorCodes.find((known) => known === error.code);
  if (code) {
    return t(`errors.${code}` as TranslationKey);
  }
  return t('errors.generic');
}
