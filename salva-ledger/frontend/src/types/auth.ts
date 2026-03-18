export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DRIVER';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
