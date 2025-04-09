/**
 * Device model
 */
import { Event } from '@/lib/models';

export interface Device {
  id: string;
  project_id: string;
  identifier: string;
  platform: string;
  platform_version: string;
  app_version: string;
  first_seen: string;
  last_seen: string;
  ip_address?: string;
  country?: string;
  created_at: string;
  updated_at: string;
  events?: Event[];
} 