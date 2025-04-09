/**
 * Session related DTOs
 */

export interface BeginSessionRequest {
  identifier: string;
}

export interface BeginSessionResponse {
  session_id: string;
}

export interface EndSessionRequest {
  session_id: string;
}

export interface EndSessionResponse {
  message: string;
}

export interface GetSessionsRequestQuery {
  project_id?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface GetSessionResponse {
  session_id: string;
  begin_at: string;
  end_at: string;
  duration: number;
}

export interface GetSessionsResponse {
  sessions: GetSessionResponse[];
  total: number;
  limit: number;
  offset: number;
} 