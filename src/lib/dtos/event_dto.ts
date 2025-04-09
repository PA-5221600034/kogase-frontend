/**
 * Event related DTOs
 */

export interface RecordEventRequest {
  identifier: string;
  event_type: string;
  event_name: string;
  payloads?: Record<string, unknown>;
  timestamp?: string;
}

export interface RecordEventResponse {
  message: string;
}

export interface RecordEventsRequest {
  events: RecordEventRequest[];
}

export interface RecordEventsResponse {
  message: string;
  count: number;
} 