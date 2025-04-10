"use client";

import { useState } from 'react';
import { devicesApi } from '@/lib/api';
import { 
  GetDevicesRequestQuery,
  GetDevicesResponse,
  GetDeviceResponse,
  DeleteDeviceResponse
} from '@/lib/dtos';

export function useDevices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getDevices = async (getDevicesRequestQuery?: GetDevicesRequestQuery): Promise<GetDevicesResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await devicesApi.getDevices(getDevicesRequestQuery);
      return response;
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError('Failed to fetch devices');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDevice = async (deviceId: string): Promise<GetDeviceResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await devicesApi.getDevice(deviceId);
      return response;
    } catch (err) {
      console.error(`Failed to fetch device ${deviceId}:`, err);
      setError(`Failed to fetch device ${deviceId}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (deviceId: string): Promise<DeleteDeviceResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await devicesApi.deleteDevice(deviceId);
      return response;
    } catch (err) {
      console.error(`Failed to delete device ${deviceId}:`, err);
      setError(`Failed to delete device ${deviceId}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getDevices,
    getDevice,
    deleteDevice
  };
} 