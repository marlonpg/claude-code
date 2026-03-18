export interface User {
  id: string;
  email: string;
  fullName?: string;
  displayName?: string;
  role: 'ROLE_ADMIN' | 'ROLE_ASSISTANT' | 'ROLE_DRIVER' | 'ROLE_USER';
  active?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
