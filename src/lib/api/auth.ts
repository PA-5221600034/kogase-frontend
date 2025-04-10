import apiClient from './client';
import { 
  LoginRequest, 
  LoginResponse, 
  MeResponse, 
  LogoutResponse, 
  CreateUserRequest,
  CreateUserResponse
} from '@/lib/dtos';

export const authApi = {
  login: async (loginRequest: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', loginRequest);

    const token = response.data.token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kogase-token', token);
    }

    return response.data;
  },
  
  register: async (registerRequest: CreateUserRequest): Promise<LoginResponse> => {
    await apiClient.post<CreateUserResponse>('/users', registerRequest);

    const loginRequest: LoginRequest = {
      email: registerRequest.email,
      password: registerRequest.password
    };
    const loginResponse = await authApi.login(loginRequest);

    return loginResponse;
  },
  
  me: async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  },
  
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kogase-token');
    }
    return response.data;
  }
}; 