export interface UserResponse {
  id: string; email: string; username: string;
  preferredCurrency: string; createdAt: string; updatedAt: string;
}
export interface UserCreateRequest { email: string; password: string; username: string; preferredCurrency?: string; }
export interface UserUpdateRequest { username: string; preferredCurrency?: string; }
