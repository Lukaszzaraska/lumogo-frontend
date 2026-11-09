import { apiRequest } from './client';

/** Odpowiedź z /api/auth/* (AuthResponse w backendzie). */
type AuthResponseDto = {
  status: 'success' | 'error';
  id: number;
  gender: string | null;
  message: string;
  email: string;
  firstName: string;
  lastName: string | null;
  interests: string | null;
  token?: string | null;
};

export type SessionUser = {
  id: number;
  email: string;
  gender: string | null;
  firstName: string;
  lastName: string | null;
  interests: string[];
};

export type AuthResult = {
  user: SessionUser;
  token: string;
};

function toSessionUser(dto: AuthResponseDto): SessionUser {
  return {
    id: dto.id,
    email: dto.email,
    gender: dto.gender ?? null,
    firstName: dto.firstName,
    lastName: dto.lastName || null,
    interests: dto.interests ? dto.interests.split(',').filter(Boolean) : [],
  };
}

function toAuthResult(dto: AuthResponseDto): AuthResult {
  if (!dto.token) {
    throw new Error('Backend did not return a token');
  }
  return { user: toSessionUser(dto), token: dto.token };
}

export type RegisterInput = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  /** "-" albo brak = nie podano. */
  gender?: string;
};

export async function register(input: RegisterInput): Promise<AuthResult> {
  const dto = await apiRequest<AuthResponseDto>('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: { ...input, email: input.email.trim(), firstName: input.firstName.trim() },
  });
  return toAuthResult(dto);
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const dto = await apiRequest<AuthResponseDto>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { email: email.trim(), password },
  });
  return toAuthResult(dto);
}

/** Profil zalogowanego użytkownika (z tokena). */
export async function fetchProfile(): Promise<SessionUser> {
  return toSessionUser(await apiRequest<AuthResponseDto>('/api/auth/profile'));
}

export type ProfileUpdate = {
  firstName?: string;
  lastName?: string;
  gender?: string;
};

export async function updateProfile(update: ProfileUpdate): Promise<SessionUser> {
  return toSessionUser(await apiRequest<AuthResponseDto>('/api/auth/profile', { method: 'PUT', body: update }));
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiRequest<null>('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
}

/** Trwale usuwa konto, plany i preferencje. */
export async function deleteAccount(): Promise<void> {
  await apiRequest<null>('/api/auth/account', { method: 'DELETE' });
}
