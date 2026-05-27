export interface NewsSource {
  id: number;
  name: string;
  url: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  published_at: string;
  source: NewsSource;
  country: string;
  tags: string[];
  priority: number;
}

export interface NewsItemCreate {
  title: string;
  summary: string;
  url: string;
  published_at: string;
  source_id: number;
  country: string;
  tags: string[];
  priority: number;
}

export interface NewsItemUpdate {
  title?: string;
  summary?: string;
  url?: string;
  published_at?: string;
  source_id?: number;
  country?: string;
  tags?: string[];
  priority?: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  message: string;
  status: number;
}