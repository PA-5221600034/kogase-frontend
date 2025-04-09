/**
 * Event related DTOs
 */

export interface GetEventsRequestQuery {
    project_id: string;
    from_date: string;
    to_date: string;
    event_type: string;
    event_name: string;
    limit: number;
    offset: number;
}

export interface GetEventsResponse {
    events: GetEventResponse[];
    total: number;
}

export interface GetEventRequest {
    event_id: string;
}

export interface GetEventResponse {
    event_id: string;
    event_type: string;
    event_name: string;
    payloads: Record<string, unknown>;
    timestamp: Date;
    received_at: Date;
}