const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://lumogo.onrender.com').replace(/\/$/, '');

export type RegisterRequest = {
  email: string;
  firstName: string;
  gender: string;
  password: string;
};

type ApiErrorBody = {
  error?: string;
  message?: string;
};

async function readErrorMessage(response: Response) {
  const body = await response.json().catch(() => null) as ApiErrorBody | null;
  return body?.message ?? body?.error ?? `Request failed (${response.status}).`;
}

export type LoginResponse = {
  id: number;
  email: string;
  firstName: string;
  gender: string;
};

export const authApi = {
  async register(body: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      body: JSON.stringify(body),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      body: JSON.stringify({ email, currentPassword, newPassword }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      body: JSON.stringify({ email, password }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },
};
