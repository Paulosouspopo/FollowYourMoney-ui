export interface LoginRequest { email: string; password: string; }
export interface AuthResponse { token: string; user?: UserResponse; } // user optionnel → cf. remarque back #5

export interface UserResponse { id: string; email: string; username: string; preferredCurrency: string; createdAt: string; updatedAt: string; }
export interface UserCreateRequest { email: string; password: string; username: string; preferredCurrency?: string; }
export interface UserUpdateRequest { username?: string; preferredCurrency?: string; }