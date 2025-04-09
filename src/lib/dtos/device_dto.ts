/**
 * Device related DTOs
 */

export interface GetDevicesRequestQuery {
  platform?: string;
  limit?: number;
  offset?: number;
}

export interface GetDevicesResponse {
  devices: GetDeviceResponse[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface GetDeviceResponse {
  device_id: string;
  identifier: string;
  platform: string;
  platform_version: string;
  app_version: string;
  first_seen: string;
  last_seen: string;
  ip_address: string;
  country: string;
}

export interface GetDeviceResponseDetail extends GetDeviceResponse {
  events: Event[];
}

export interface DeleteDeviceResponse {
  message: string;
} 