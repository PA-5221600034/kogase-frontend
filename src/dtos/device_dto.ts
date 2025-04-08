/**
 * Device related DTOs
 */

export interface CreateOrUpdateDeviceRequest {
  identifier: string;
  platform: string;
  platform_version: string;
  app_version: string;
}

export interface GetDeviceResponse {
  device_id: string;
  identifier: string;
  platform: string;
  platform_version: string;
  app_version: string;
  first_seen: string;
  last_seen: string;
  ip_address?: string;
  country?: string;
}

export interface GetDevicesRequestQuery {
  platform?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface GetDevicesResponse {
  devices: GetDeviceResponse[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface UpdateDeviceRequest {
  identifier?: string;
  platform?: string;
  platform_version?: string;
  app_version?: string;
}

export interface CreateOrUpdateDeviceResponse {
  device_id: string;
  identifier: string;
  platform: string;
  platform_version: string;
  app_version: string;
  first_seen: string;
  last_seen: string;
  ip_address?: string;
  country?: string;
}

export interface DeleteDeviceResponse {
  message: string;
} 