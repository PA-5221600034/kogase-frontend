/**
 * Analytics related DTOs
 */

export interface GetAnalyticsRequestQuery {
    project_id?: string;
    from_date?: string;
    to_date?: string;
}

export interface GetAnalyticsResponse {
  dau: number;
  mau: number;
  total_duration: number;
  total_installs: number;
}
