import apiClient from './client';
import { 
  GetDevicesRequestQuery,
  GetDevicesResponse,
  GetDeviceResponse,
  DeleteDeviceResponse
} from '@/lib/dtos';

export const devicesApi = {
  getDevices: async (getDevicesRequestQuery?: GetDevicesRequestQuery): Promise<GetDevicesResponse> => {
    const response = await apiClient.get<GetDevicesResponse>('/devices', { params: getDevicesRequestQuery });
    return response.data;
  },

  getDevice: async (deviceId: string): Promise<GetDeviceResponse> => {
    const response = await apiClient.get<GetDeviceResponse>(`/devices/${deviceId}`);
    return response.data;
  },

  deleteDevice: async (deviceId: string): Promise<DeleteDeviceResponse> => {
    const response = await apiClient.delete<DeleteDeviceResponse>(`/devices/${deviceId}`);
    return response.data;
  },
}; 
