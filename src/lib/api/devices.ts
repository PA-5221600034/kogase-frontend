import apiClient from './client';
import { 
  CreateOrUpdateDeviceRequest, 
  CreateOrUpdateDeviceResponse, 
  GetDeviceResponse,
  GetDevicesResponse,
  GetDevicesRequestQuery,
  UpdateDeviceRequest,
  DeleteDeviceResponse
} from '../dtos/device_dto';
import { Device } from '../models/Device';

export const devicesApi = {
  // API calls requiring API key (for game clients)
  createOrUpdateDevice: async (apiKey: string, data: CreateOrUpdateDeviceRequest): Promise<Device> => {
    const response = await apiClient.post<CreateOrUpdateDeviceResponse>('/api/v1/devices', data, {
      headers: {
        'X-API-Key': apiKey
      }
    });
    return {
      id: response.data.device_id,
      project_id: '', // Not returned by API
      identifier: response.data.identifier,
      platform: response.data.platform,
      platform_version: response.data.platform_version,
      app_version: response.data.app_version,
      first_seen: response.data.first_seen,
      last_seen: response.data.last_seen,
      ip_address: response.data.ip_address,
      country: response.data.country,
      created_at: '', // Not returned by API
      updated_at: '' // Not returned by API
    };
  },
  
  getDevice: async (apiKey: string, id: string): Promise<Device> => {
    const response = await apiClient.get<GetDeviceResponse>(`/api/v1/devices/${id}`, {
      headers: {
        'X-API-Key': apiKey
      }
    });
    return {
      id: response.data.device_id,
      project_id: '', // Not returned by API
      identifier: response.data.identifier,
      platform: response.data.platform,
      platform_version: response.data.platform_version,
      app_version: response.data.app_version,
      first_seen: response.data.first_seen,
      last_seen: response.data.last_seen,
      ip_address: response.data.ip_address,
      country: response.data.country,
      created_at: '', // Not returned by API
      updated_at: '' // Not returned by API
    };
  },
  
  updateDevice: async (apiKey: string, id: string, data: UpdateDeviceRequest): Promise<Device> => {
    const response = await apiClient.patch<CreateOrUpdateDeviceResponse>(`/api/v1/devices/${id}`, data, {
      headers: {
        'X-API-Key': apiKey
      }
    });
    return {
      id: response.data.device_id,
      project_id: '', // Not returned by API
      identifier: response.data.identifier,
      platform: response.data.platform,
      platform_version: response.data.platform_version,
      app_version: response.data.app_version,
      first_seen: response.data.first_seen,
      last_seen: response.data.last_seen,
      ip_address: response.data.ip_address,
      country: response.data.country,
      created_at: '', // Not returned by API
      updated_at: '' // Not returned by API
    };
  },
  
  // API calls requiring Auth token (for dashboard)
  getDevices: async (query?: GetDevicesRequestQuery): Promise<{ devices: Device[], total: number, limit: number, offset: number }> => {
    const response = await apiClient.get<GetDevicesResponse>('/api/v1/devices', { params: query });
    
    return {
      devices: response.data.devices.map(device => ({
        id: device.device_id,
        project_id: '', // Not returned by API
        identifier: device.identifier,
        platform: device.platform,
        platform_version: device.platform_version,
        app_version: device.app_version,
        first_seen: device.first_seen,
        last_seen: device.last_seen,
        ip_address: device.ip_address,
        country: device.country,
        created_at: '', // Not returned by API
        updated_at: '' // Not returned by API
      })),
      total: response.data.total_count,
      limit: response.data.limit,
      offset: response.data.offset
    };
  },
  
  deleteDevice: async (id: string): Promise<void> => {
    await apiClient.delete<DeleteDeviceResponse>(`/api/v1/devices/${id}`);
  }
}; 