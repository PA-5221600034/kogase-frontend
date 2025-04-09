"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import { LoginRequest } from '@/lib/dtos/auth_dto';
import { User } from '@/lib/models/User';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('kogase-token');
    if (!token) {
      setLoading(false);
      return;
    }

    // We have a token, try to get the user profile
    authApi.me()
      .then(user => {
        setUser(user);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to fetch user profile:', err);
        // If we can't get the profile, clear the token
        localStorage.removeItem('kogase-token');
        setError('Session expired. Please login again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authApi.login(data);
      
      // Token should already be stored in localStorage by the authApi.login function
      // Update user state with the returned user data
      setUser(response.user);
      setError(null);
    } catch (err) {
      console.error('Login failed:', err);
      
      // Clear any token that might be in localStorage
      localStorage.removeItem('kogase-token');
      
      // Set error message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    try {
      setLoading(true);
      const response = await authApi.register(data);
      
      // Token should already be stored in localStorage by the authApi.register function
      // Update user state with the returned user data
      setUser(response.user);
      setError(null);
    } catch (err) {
      console.error('Registration failed:', err);
      
      // Clear any token that might be in localStorage
      localStorage.removeItem('kogase-token');
      
      // Set error message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authApi.logout();
      // Clear the user state
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
      
      // Even if logout fails on the server, remove the token from localStorage
      localStorage.removeItem('kogase-token');
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Logout failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
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