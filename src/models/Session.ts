/**
 * Session model
 */

export interface Session {
  id: string;
  project_id: string;
  device_id: string;
  begin_at: string;
  end_at?: string;
  duration?: number; // Duration in milliseconds
  created_at: string;
  updated_at: string;
} 