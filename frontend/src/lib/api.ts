export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  integrity?: string;
  keepalive?: boolean;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: string;
  signal?: AbortSignal;
}

export async function apiFetch<T = unknown>(path: string, options?: FetchOptions): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const fetchOptions: RequestInit = {
    method: options?.method,
    headers,
    credentials: options?.credentials,
    cache: options?.cache,
    integrity: options?.integrity,
    keepalive: options?.keepalive,
    mode: options?.mode,
    redirect: options?.redirect,
    referrer: options?.referrer,
    referrerPolicy: options?.referrerPolicy,
    signal: options?.signal,
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(path, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => 'Unknown error');
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T = unknown>(path: string) => apiFetch<T>(path),
  post: <T = unknown>(path: string, data: unknown) => apiFetch<T>(path, { method: 'POST', body: data }),
  put: <T = unknown>(path: string, data: unknown) => apiFetch<T>(path, { method: 'PUT', body: data }),
  delete: <T = unknown>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
