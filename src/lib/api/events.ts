import apiClient from './client';
import { RecordEventRequest, RecordEventResponse, RecordEventsRequest, RecordEventsResponse } from '../dtos/event_dto';
import { Event, Payloads } from '../models/Event';

export interface EventQueryParams {
  projectId: string;
  startDate?: string;
  endDate?: string;
  eventType?: string;
  eventName?: string;
  deviceId?: string;
  limit?: number;
  offset?: number;
}

export interface EventsResponse {
  events: Array<{
    id: string;
    project_id: string;
    device_id: string;
    event_type: string;
    event_name: string;
    payloads: Payloads;
    timestamp: string;
    received_at: string;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  offset: number;
  limit: number;
}

export interface EventsCountByType {
  eventType: string;
  count: number;
}

export interface EventsCountByDay {
  date: string;
  count: number;
}

export interface DeviceStats {
  totalDevices: number;
  newDevicesToday: number;
  activeDevicesToday: number;
  devicesCountByPlatform: { platform: string; count: number }[];
}

export const eventsApi = {
  getEvents: async (params: EventQueryParams): Promise<EventsResponse> => {
    const response = await apiClient.get<EventsResponse>('/api/v1/events', { params });
    return response.data;
  },
  
  getEventById: async (id: string): Promise<Event> => {
    const response = await apiClient.get<Event>(`/api/v1/events/${id}`);
    return response.data;
  },
  
  getEventCountByType: async (projectId: string, startDate?: string, endDate?: string): Promise<EventsCountByType[]> => {
    const params = { projectId, startDate, endDate };
    const response = await apiClient.get<EventsCountByType[]>('/api/v1/events/count-by-type', { params });
    return response.data;
  },
  
  getEventCountByDay: async (projectId: string, startDate?: string, endDate?: string): Promise<EventsCountByDay[]> => {
    const params = { projectId, startDate, endDate };
    const response = await apiClient.get<EventsCountByDay[]>('/api/v1/events/count-by-day', { params });
    return response.data;
  },
  
  getDeviceStats: async (projectId: string): Promise<DeviceStats> => {
    const response = await apiClient.get<DeviceStats>(`/api/v1/projects/${projectId}/device-stats`);
    return response.data;
  }
}; 