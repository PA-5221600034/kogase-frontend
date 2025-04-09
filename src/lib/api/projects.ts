import apiClient from './client';
import { 
  CreateProjectRequest, 
  CreateProjectResponse, 
  GetProjectResponseDetail, 
  GetProjectsResponse, 
  UpdateProjectRequest, 
  UpdateProjectResponse, 
  DeleteProjectResponse, 
  GetProjectResponse
} from '../dtos/project_dto';

export const projectsApi = {
  getProjects: async (): Promise<GetProjectsResponse> => {
    const response = await apiClient.get<GetProjectsResponse>('/projects');
    return response.data;
  },
  
  getProject: async (id: string): Promise<GetProjectResponseDetail> => {
    const response = await apiClient.get<GetProjectResponseDetail>(`/projects/${id}`);
    return response.data;
  },
  
  createProject: async (data: CreateProjectRequest): Promise<CreateProjectResponse> => {
    const response = await apiClient.post<CreateProjectResponse>('/projects', data);
    return response.data;
  },
  
  updateProject: async (id: string, data: UpdateProjectRequest): Promise<UpdateProjectResponse> => {
    const response = await apiClient.patch<UpdateProjectResponse>(`/projects/${id}`, data);
    return response.data;
  },
  
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete<DeleteProjectResponse>(`/projects/${id}`);
  },

  regenerateApiKey: async (id: string): Promise<GetProjectResponse> => {
    const response = await apiClient.post<GetProjectResponse>(`/projects/${id}/apikey`);
    return response.data;
  },
}; 