export type Role = 'USER' | 'ADMIN';

export interface UserResponse {
  id: string; email: string; username: string;
  preferredCurrency: string; role: Role; createdAt: string; updatedAt: string;
  /** Compte invité du mode démo (données fictives, supprimé après 24 h). */
  demo: boolean;
}
export interface UserCreateRequest { email: string; password: string; username: string; preferredCurrency?: string; }
export interface UserUpdateRequest { username: string; preferredCurrency?: string; }
