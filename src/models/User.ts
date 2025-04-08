/**
 * User model
 */
import { Project } from './Project';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  projects?: Project[];
} 