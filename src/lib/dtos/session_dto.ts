/**
 * Session related DTOs
 */

export interface GetSessionsRequestQuery {
  project_id?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface GetSessionsResponse {
  sessions: GetSessionResponse[];
  total: number;
  limit: number;
  offset: number;
} 

export interface GetSessionRequest {
  session_id: string;
}

export interface GetSessionResponse {
  session_id: string;
  begin_at: string;
  end_at: string;
  duration: number;
}