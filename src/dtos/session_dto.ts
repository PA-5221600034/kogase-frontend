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

export interface GetDeviceSessionsRequestQuery {
  project_id?: string;
  device_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface GetProjectSessionsRequestQuery {
  project_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface GetAllSessionsRequestQuery {
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface GetSessionResponse {
  session_id: string;
  project_id: string;
  device_id: string;
  begin_at: string;
  end_at: string;
}

export interface GetSessionsResponse {
  sessions: GetSessionResponse[];
  total: number;
  limit: number;
  offset: number;
} 