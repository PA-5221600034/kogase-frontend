/**
 * AuthToken model
 */

export interface AuthToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  last_used_at: string;
  created_at: string;
  updated_at: string;
} 