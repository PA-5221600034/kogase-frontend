import apiClient from './client';
import { 
  GetSessionsRequestQuery,
  GetSessionsResponse,
  GetSessionResponse
} from '@/lib/dtos';

export const sessionsApi = {  
  getSessions: async (getSessionsRequestQuery?: GetSessionsRequestQuery): Promise<GetSessionsResponse> => {
    const response = await apiClient.get<GetSessionsResponse>('/sessions', { params: getSessionsRequestQuery });
    return response.data;
  },
    
  getSession: async (sessionId: string): Promise<GetSessionResponse> => {
    const response = await apiClient.get<GetSessionResponse>(`/sessions/${sessionId}`);
    return response.data;
  },
}; 