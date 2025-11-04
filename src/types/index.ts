export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  settings?: Record<string, unknown>;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface DataStream {
  id: string;
  organization_id: string;
  platform_type: PlatformType;
  name: string;
  config: Record<string, unknown>;
  status: 'active' | 'inactive' | 'error';
  last_synced_at?: string;
  created_at: string;
}

export type PlatformType = 
  | 'facebook' 
  | 'instagram' 
  | 'linkedin' 
  | 'google_analytics' 
  | 'google_ads' 
  | 'tiktok' 
  | 'twitter' 
  | 'youtube'
  | 'csv_upload';

export interface AnalyticsData {
  id: string;
  organization_id: string;
  data_stream_id: string;
  date: string;
  metrics: Record<string, number>;
  raw_data: Record<string, unknown>;
  created_at: string;
}

export interface UserObjective {
  id: string;
  organization_id: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  description: string;
  target_metrics: Record<string, number>;
  start_date: string;
  end_date: string;
}

export interface CompetitorData {
  id: string;
  organization_id: string;
  name: string;
  platform: string;
  url: string;
  notes?: string;
  created_at: string;
}

export interface ContentSuggestion {
  id: string;
  organization_id: string;
  posting_date: string;
  title: string;
  platform: PlatformType;
  content_type: string;
  objective: string;
  content_pillar: string;
  description: string;
  creative_guidance: string;
  caption: string;
  hashtags: string[];
  status: 'draft' | 'approved' | 'rejected';
  created_at: string;
  generated_by: string;
}

export interface ContentCalendar {
  id: string;
  organization_id: string;
  posting_date: string;
  title: string;
  platform: PlatformType;
  content_type: string;
  objective: string;
  content_pillar: string;
  description: string;
  creative_guidance: string;
  caption: string;
  hashtags: string[];
  attachments: Record<string, unknown>[];
  notes: string;
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CsvUpload {
  id: string;
  organization_id: string;
  file_name: string;
  file_url: string;
  column_mapping: Record<string, string>;
  uploaded_at: string;
  processed: boolean;
}

export interface IntegrationToken {
  id: string;
  organization_id: string;
  platform: PlatformType;
  encrypted_tokens: string;
  expires_at?: string;
  created_at: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface DashboardMetrics {
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
  followers: number;
  [key: string]: number;
}

export interface TimeRange {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

export interface PlatformMetrics {
  platform: PlatformType;
  metrics: DashboardMetrics;
  change: number;
  trend: 'up' | 'down' | 'stable';
}
