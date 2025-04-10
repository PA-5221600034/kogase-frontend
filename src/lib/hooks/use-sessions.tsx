"use client";

import { useState } from 'react';
import { sessionsApi } from '@/lib/api';
import { 
  GetSessionsRequestQuery,
  GetSessionsResponse,
  GetSessionResponse
} from '@/lib/dtos';

export function useSessions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getSessions = async (getSessionsRequestQuery?: GetSessionsRequestQuery): Promise<GetSessionsResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionsApi.getSessions(getSessionsRequestQuery);
      return response;
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to fetch sessions');
      throw err;
    } finally {
      setLoading(false);
    }
  };
    
  const getSession = async (sessionId: string): Promise<GetSessionResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionsApi.getSession(sessionId);
      return response;
    } catch (err) {
      console.error(`Failed to fetch session ${sessionId}:`, err);
      setError(`Failed to fetch session ${sessionId}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getSessions,
    getSession
  };
} 