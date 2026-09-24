export interface LoginRequest { email: string; password: string; }
export interface ResetPasswordRequest { token: string; newPassword: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }
export type { AuthResponse } from '@/shared/auth/session';
