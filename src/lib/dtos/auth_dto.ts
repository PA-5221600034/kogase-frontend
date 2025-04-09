/**
 * Authentication related DTOs
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LogoutResponse {
  message: string;
} 