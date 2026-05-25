export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => 'Unknown error');
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}