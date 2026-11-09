import { apiRequest } from './client';

/** Odpowiedź z /api/auth/register i /api/auth/login (AuthResponse w backendzie). */
type AuthResponseDto = {
  status: 'success' | 'error';
  message: string;
  email: string;
  firstName: string;
  lastName: string | null;
  interests: string | null;
};

export type SessionUser = {
  email: string;
  firstName: string;
  lastName: string | null;
  interests: string[];
};

function toSessionUser(dto: AuthResponseDto): SessionUser {
  return {
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName || null,
    interests: dto.interests ? dto.interests.split(',').filter(Boolean) : [],
  };
}

export type RegisterInput = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export async function register(input: RegisterInput): Promise<SessionUser> {
  const dto = await apiRequest<AuthResponseDto>('/api/auth/register', {
    method: 'POST',
    body: { ...input, email: input.email.trim(), firstName: input.firstName.trim() },
  });
  return toSessionUser(dto);
}

export async function login(email: string, password: string): Promise<SessionUser> {
  const dto = await apiRequest<AuthResponseDto>('/api/auth/login', {
    method: 'POST',
    body: { email: email.trim(), password },
  });
  return toSessionUser(dto);
}
