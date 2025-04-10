"use client";

import { useState } from 'react';
import { eventsApi } from '@/lib/api';
import { 
  GetEventsRequestQuery,
  GetEventsResponse,
  GetEventResponse
} from '@/lib/dtos';

export function useEvents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getEvents = async (getEventsRequestQuery?: GetEventsRequestQuery): Promise<GetEventsResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsApi.getEvents(getEventsRequestQuery);
      return response;
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to fetch events');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEvent = async (eventId: string): Promise<GetEventResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsApi.getEvent(eventId);
      return response;
    } catch (err) {
      console.error(`Failed to fetch event ${eventId}:`, err);
      setError(`Failed to fetch event ${eventId}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getEvents,
    getEvent
  };
} 