/**
 * User related DTOs
 */

import { Project } from "@/models";

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateUserResponse {
  email: string;
  name: string;
}

export interface GetUserResponseDetail {
  user_id: string;
  email: string;
  name: string;
  projects: Project[];
}

export interface GetUserResponse {
  user_id: string;
  email: string;
  name: string;
}

export interface GetUsersResponse {
  users: GetUserResponse[];
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
}

export interface UpdateUserResponse {
  email: string;
  name: string;
}

export interface DeleteUserResponse {
  message: string;
} 