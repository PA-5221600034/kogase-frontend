"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';

import { authApi } from '@/lib/api';
import { 
  LoginRequest, 
  LoginResponse,
  MeResponse,
  LogoutResponse,
  CreateUserRequest,
  CreateUserResponse
} from '@/lib/dtos';

interface AuthContextType {
  me: MeResponse | null;
  loading: boolean;
  error: string | null;
  login: (loginRequest: LoginRequest) => Promise<LoginResponse>;
  register: (registerRequest: CreateUserRequest) => Promise<CreateUserResponse>;
  logout: () => Promise<LogoutResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('kogase-token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then(me => {
        setMe(me);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to fetch user profile:', err);
        localStorage.removeItem('kogase-token');
        setError('Session expired. Please login again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (loginRequest: LoginRequest): Promise<LoginResponse> => {
    try {
      setLoading(true);
      const response = await authApi.login(loginRequest);
      
      const meResponse = await authApi.me();
      setMe(meResponse);
      setError(null);
      
      return response;
    } catch (err) { 
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerRequest: CreateUserRequest): Promise<CreateUserResponse> => {
    try {
      setLoading(true);
      const response = await authApi.register(registerRequest);
      
      const meResponse = await authApi.me();
      setMe(meResponse);
      setError(null);
      
      return response as unknown as CreateUserResponse;
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<LogoutResponse> => {
    try {
      setLoading(true);
      const response = await authApi.logout();
      setMe(null);
      setError(null);
      return response;
    } catch (err) {
      console.error('Logout failed:', err);
      localStorage.removeItem('kogase-token');
      setError('Logout failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ me, loading, error, login, register, logout }}>
      {children}
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