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
} from '@/lib/dtos';

export const projectsApi = {
  createProject: async (createProjectRequest: CreateProjectRequest): Promise<CreateProjectResponse> => {
    const response = await apiClient.post<CreateProjectResponse>('/projects', createProjectRequest);
    return response.data;
  },

  getProjects: async (): Promise<GetProjectsResponse> => {
    const response = await apiClient.get<GetProjectsResponse>('/projects');
    return response.data;
  },
  
  getProject: async (id: string): Promise<GetProjectResponseDetail> => {
    const response = await apiClient.get<GetProjectResponseDetail>(`/projects/${id}`);
    return response.data;
  },
  
  updateProject: async (id: string, updateProjectRequest: UpdateProjectRequest): Promise<UpdateProjectResponse> => {
    const response = await apiClient.patch<UpdateProjectResponse>(`/projects/${id}`, updateProjectRequest);
    return response.data;
  },
  
  deleteProject: async (id: string): Promise<DeleteProjectResponse> => {
    const response = await apiClient.delete<DeleteProjectResponse>(`/projects/${id}`);
    return response.data;
  },

  regenerateApiKey: async (id: string): Promise<GetProjectResponse> => {
    const response = await apiClient.post<GetProjectResponse>(`/projects/${id}/apikey`);
    return response.data;
  },
}; 