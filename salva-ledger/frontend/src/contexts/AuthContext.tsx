import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi, LoginRequest, LoginResponse, UserInfo } from '../services/api';
import { User } from '../types/auth';

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  userInfo: UserInfo | null;
}

interface AuthContext extends AuthContextType {}

// Create context with default values
const AuthContext = createContext<AuthContext | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
      } catch {
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    setIsLoading(false);
  }, []);

  // Login mutation
  const loginMutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.token);
      const parsedUser = data.role ? {
        id: data.userId,
        email: data.email,
        role: data.role,
        displayName: data.role,
      } : null;

      setUser(parsedUser);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(parsedUser));
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const login = async (data: LoginRequest) => {
    // Use remember me checkbox if checked
    if (data.rememberMe) {
      await loginMutation.mutateAsync({ ...data, rememberMe: true });
    } else {
      await loginMutation.mutateAsync({ ...data, rememberMe: false });
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    // Redirect to login
    window.location.href = '/';
  };

  // Clear token on error
  loginMutation.onError = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        userInfo,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
