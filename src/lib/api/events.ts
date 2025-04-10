import apiClient from './client';
import { 
  GetEventsRequestQuery,
  GetEventsResponse,
  GetEventResponse
} from '@/lib/dtos';

export const eventsApi = {
  getEvents: async (getEventsRequestQuery?: GetEventsRequestQuery): Promise<GetEventsResponse> => {
    const response = await apiClient.get<GetEventsResponse>('/events', { params: getEventsRequestQuery });
    return response.data;
  },

  getEvent: async (eventId: string): Promise<GetEventResponse> => {
    const response = await apiClient.get<GetEventResponse>(`/events/${eventId}`);
    return response.data;
  },
}; 