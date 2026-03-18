import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserInfo } from '../services/api';
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

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: userInfoData, isLoading: userInfoLoading } = useUserInfo();

  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  // Get user from API response or localStorage
  const user = userInfoData || (
    (localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')!) : null)
  );

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Verify token is still valid by fetching user info
          try {
            const infoData = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${storedToken}` },
            }).then(res => res.json());

            if (infoData.success) {
              const userFromApi = infoData.data as UserInfo;
              localStorage.setItem('auth_user', JSON.stringify(userFromApi));
              setUser(userFromApi);
              setIsAuthenticated(true);
            }
          } catch (apiError) {
            // Token expired, clear storage
            console.error('Token expired:', apiError);
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
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    const { token: authToken, email, role, userId, full_name } = data.data;

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
      await fetch('/api/auth/logout', { method: 'POST' });
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
      const response = await fetch('/api/auth/refresh', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      // After refresh, fetch user info again to get updated token
      const infoResponse = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (infoResponse.ok) {
        const info = await infoResponse.json();
        if (info.success) {
          const user = info.data as UserInfo;
          localStorage.setItem('auth_user', JSON.stringify(user));
          setUser(user);
        }
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
