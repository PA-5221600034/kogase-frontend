/**
 * User related DTOs
 */

import { Project } from "@/lib/models";

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateUserResponse {
  email: string;
  name: string;
}

export interface GetUsersResponse {
  users: GetUserResponse[];
}

export interface GetUserResponse {
  user_id: string;
  email: string;
  name: string;
}

export interface GetUserResponseDetail extends GetUserResponse {
  projects: Project[];
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