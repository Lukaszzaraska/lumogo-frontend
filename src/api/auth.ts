import { apiRequest } from './client';

/** Odpowiedź z /api/auth/* (AuthResponse w backendzie). */
type AuthResponseDto = {
  status: 'success' | 'error';
  message: string;
  email: string;
  firstName: string;
  lastName: string | null;
  interests: string | null;
  token?: string | null;
};

export type SessionUser = {
  email: string;
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
    email: dto.email,
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
  passwordConfirm: string;
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
