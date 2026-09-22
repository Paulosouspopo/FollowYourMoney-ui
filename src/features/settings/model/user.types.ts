export interface UserResponse {
  id: string; email: string; username: string;
  preferredCurrency: string; createdAt: string; updatedAt: string;
}
// À CONFIRMER : champs exacts de UserCreateRequest / UserUpdateRequest
export interface UserCreateRequest { email: string; username: string; password: string; }
export interface UserUpdateRequest { username?: string; preferredCurrency?: string; }