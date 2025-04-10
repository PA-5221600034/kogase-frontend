"use client";

import { useState } from 'react';
import { healthApi } from '@/lib/api';
import { HealthResponse } from '@/lib/dtos';

export function useHealth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getHealth = async (): Promise<HealthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await healthApi.getHealth();
      return response;
    } catch (err) {
      console.error('Failed to fetch health status:', err);
      setError('Failed to fetch health status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getHealth
  };
} 