/**
 * Event model
 */

export type Payloads = Record<string, unknown>;

export interface Event {
  id: string;
  project_id: string;
  device_id: string;
  event_type: string;
  event_name: string;
  payloads: Payloads;
  timestamp: string;
  received_at: string;
  created_at: string;
  updated_at: string;
} 