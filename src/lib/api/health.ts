import apiClient from './client';
import { HealthResponse } from '../dtos/health_dto';

export const healthApi = {
  // Check health without API key
  getHealth: async (): Promise<string> => {
    const response = await apiClient.get<HealthResponse>('/api/v1/health');
    return response.data.status;
  },
  
  // Check health with API key
  getHealthWithApiKey: async (apiKey: string): Promise<string> => {
    const response = await apiClient.get<HealthResponse>('/api/v1/health/apikey', {
      headers: {
        'X-API-Key': apiKey
      }
    });
    return response.data.status;
  }
}; 