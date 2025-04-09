import apiClient from './client';
import { 
  GetSessionsRequestQuery,
  GetSessionsResponse,
  GetSessionResponse
} from '../dtos/session_dto';

export const sessionsApi = {  
  // API calls requiring Auth token (for dashboard)
  getSessions: async (query?: GetSessionsRequestQuery): Promise<GetSessionsResponse> => {
    const response = await apiClient.get<GetSessionsResponse>('/sessions', { params: query });
    return response.data;
  },
  
  getSession: async (sessionId: string): Promise<GetSessionResponse> => {
    const response = await apiClient.get<GetSessionResponse>(`/sessions/${sessionId}`);
    
    return response.data;
  },
}; 