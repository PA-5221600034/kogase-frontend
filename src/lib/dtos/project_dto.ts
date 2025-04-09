/**
 * Project related DTOs
 */

import { Device, Event } from "@/lib/models";

export interface CreateProjectRequest {
  name: string;
}

export interface CreateProjectResponse {
  project_id: string;
  name: string;
  api_key: string;
  owner: OwnerDto;
}

export interface GetProjectsResponse {
  projects: GetProjectResponse[];
}

export interface GetProjectResponse {
  project_id: string;
  name: string;
  api_key: string;
  owner: OwnerDto;
}

export interface GetProjectResponseDetail extends GetProjectResponse {
  devices: Device[];
  events: Event[];
}

export interface UpdateProjectRequest {
  name?: string;
}

export interface UpdateProjectResponse {
  project_id: string;
  name: string;
  api_key: string;
  owner: OwnerDto;
}

export interface DeleteProjectResponse {
  message: string;
} 

export interface OwnerDto {
  id: string;
  email: string;
  name: string;
}
