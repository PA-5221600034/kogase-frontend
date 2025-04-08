/**
 * Project related DTOs
 */

import { Device, Event } from "@/models";

export interface CreateProjectRequest {
  name: string;
}

export interface CreateProjectResponse {
  project_id: string;
  name: string;
  api_key: string;
  owner_id: string;
}

export interface GetProjectResponseDetail {
  project_id: string;
  name: string;
  api_key: string;
  owner_id: string;
  devices: Device[];
  events: Event[];
}

export interface GetProjectResponse {
  project_id: string;
  name: string;
  api_key: string;
  owner_id: string;
}

export interface GetProjectsResponse {
  projects: GetProjectResponse[];
}

export interface UpdateProjectRequest {
  name?: string;
}

export interface UpdateProjectResponse {
  project_id: string;
  name: string;
  api_key: string;
  owner_id: string;
}

export interface DeleteProjectResponse {
  message: string;
} 