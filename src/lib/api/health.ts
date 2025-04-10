import apiClient from './client';
import { HealthResponse } from '@/lib/dtos';

export const healthApi = {
  getHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
}; 