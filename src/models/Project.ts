/**
 * Project model
 */
import { Device } from './Device';
import { Event } from './Event';

export interface Project {
  id: string;
  name: string;
  api_key?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  devices?: Device[];
  events?: Event[];
} 