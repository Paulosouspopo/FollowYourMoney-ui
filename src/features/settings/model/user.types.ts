export type Role = 'USER' | 'ADMIN';

export interface UserResponse {
  id: string; email: string; username: string;
  preferredCurrency: string; role: Role; createdAt: string; updatedAt: string;
}
export interface UserCreateRequest { email: string; password: string; username: string; preferredCurrency?: string; }
export interface UserUpdateRequest { username: string; preferredCurrency?: string; }
