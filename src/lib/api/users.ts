import apiClient from './client';
import { 
  GetUsersResponse,
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse
} from '@/lib/dtos';

export const usersApi = {
  getUsers: async (): Promise<GetUsersResponse> => {
    const response = await apiClient.get<GetUsersResponse>('/users');
    return response.data;
  },

  getUser: async (userId: string): Promise<GetUserResponse> => {
    const response = await apiClient.get<GetUserResponse>(`/users/${userId}`);
    return response.data;
  },

  createUser: async (createUserRequest: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>('/users', createUserRequest);
    return response.data;
  },

  updateUser: async (userId: string, updateUserRequest: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await apiClient.put<UpdateUserResponse>(`/users/${userId}`, updateUserRequest);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<DeleteUserResponse> => {
    const response = await apiClient.delete<DeleteUserResponse>(`/users/${userId}`);
    return response.data;
  },
};  
