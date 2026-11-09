/** Ekrany LUM-54 importują authApi; implementacja w src/api/auth.ts (token JWT). */
export { changePassword, deleteAccount, login, register, updateProfile } from '../api/auth';
export type { AuthResult, ProfileUpdate, RegisterInput, SessionUser } from '../api/auth';

import { changePassword, deleteAccount, login, register, updateProfile } from '../api/auth';

export const authApi = { changePassword, deleteAccount, login, register, updateProfile };
