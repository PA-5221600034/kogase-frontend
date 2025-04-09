import apiClient from './client';
import { LoginRequest, LoginResponse, MeResponse, LogoutResponse } from '../dtos/auth_dto';
import { User } from '../models/User';
import { AuthToken } from '../models/AuthToken';

export const authApi = {
  login: async (data: LoginRequest): Promise<{ user: User; token: AuthToken['token'] }> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    
    // Store the token immediately after login
    const token = response.data.token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kogase-token', token);
    }
    
    // Fetch user profile after login and after token is stored
    const userResponse = await apiClient.get<MeResponse>('/auth/me');
    
    return {
      user: {
        id: userResponse.data.id,
        email: userResponse.data.email,
        name: userResponse.data.name,
        created_at: userResponse.data.created_at,
        updated_at: userResponse.data.updated_at
      },
      token: token
    };
  },
  
  register: async (data: { email: string; password: string; name: string }): Promise<{ user: User; token: AuthToken['token'] }> => {
    const response = await apiClient.post<LoginResponse>('/users', data);
    
    // Store the token immediately after registration
    const token = response.data.token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kogase-token', token);
    }
    
    const userResponse = await apiClient.get<MeResponse>('/auth/me');
    return {
      user: {
        id: userResponse.data.id,
        email: userResponse.data.email,
        name: userResponse.data.name,
        created_at: userResponse.data.created_at,
        updated_at: userResponse.data.updated_at
      },
      token: token
    };
  },
  
  me: async (): Promise<User> => {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name,
      created_at: response.data.created_at,
      updated_at: response.data.updated_at
    };
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post<LogoutResponse>('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kogase-token');
    }
  }
}; 