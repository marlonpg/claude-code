import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/api';
import { UserInfo } from '../services/api';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL for fetch calls (works with Vite proxy in dev and direct calls in prod)
const API_BASE = API_URL.replace('/api', '');

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated, setIsLoading] = useState<false | null | true>(true);

  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  // Get user from localStorage
  const user = localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')!) : null;

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid by fetching user info
          try {
            const info = await getUserInfo();
            if (info.success) {
              localStorage.setItem('auth_user', JSON.stringify(info.data));
              setUser(info.data);
              setIsAuthenticated(true);
            }
          } catch (error) {
            // Token expired, clear storage
            console.error('Token expired:', error);
          }
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const setUser = (user: UserInfo | null) => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('auth_user');
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await axiosInstance.post<{ token: string; email: string; role: string; userId: string; full_name?: string; success: boolean; message?: string }>(
      '/auth/login',
      { email, password, rememberMe }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    const { token: authToken, role, userId, full_name } = response.data;

    // Save token and user
    localStorage.setItem('auth_token', authToken);
    const user: UserInfo = {
      id: userId,
      email,
      name: full_name || email.split('@')[0],
      role,
      ...(full_name && { full_name }),
    };
    setUser(user);
    setToken(authToken);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const refreshTokens = async () => {
    if (!token) {
      logout();
      return;
    }
    try {
      const refreshResponse = await axiosInstance.post('/auth/refresh', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refreshResponse.data.success) {
        // After refresh, fetch user info again to get updated token
        const userInfo = await getUserInfo();
        if (userInfo.success) {
          const user = userInfo.data;
          localStorage.setItem('auth_user', JSON.stringify(user));
          setUser(user);
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
