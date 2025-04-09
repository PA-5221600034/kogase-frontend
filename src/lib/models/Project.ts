/**
 * Project model
 */

import { Device, Event } from '@/lib/models';

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