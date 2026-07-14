import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../services/authApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authApi.clearAuthHeader();
  };

  const restoreSession = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    authApi.setAuthHeader(storedToken);

    try {
      const response = await authApi.getProfile();
      const profile = response.data.data;
      setUser(profile);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const loginResponse = await authApi.login(payload);
      const accessToken = loginResponse.data.data.token;
      authApi.setAuthHeader(accessToken);
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setIsAuthenticated(true);

      const profileResponse = await authApi.getProfile();
      const profile = profileResponse.data.data;
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));

      return profile;
    } catch (error) {
      clearSession();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      await authApi.register(payload);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // logout endpoint may be a placeholder; ignore errors
    }
    clearSession();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
