"use client";

import { useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { 
  GetAnalyticsRequestQuery, 
  GetAnalyticsResponse 
} from '@/lib/dtos';

export function useAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getAnalytics = async (getAnalyticsRequestQuery?: GetAnalyticsRequestQuery): Promise<GetAnalyticsResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getAnalytics(getAnalyticsRequestQuery);
      return response;
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAnalytics
  };
} 