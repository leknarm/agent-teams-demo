import type { ApiError } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

class ApiClientError extends Error {
  public readonly status: number;
  public readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiClientError';
    this.status = apiError.status;
    this.apiError = apiError;
  }
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    let apiError: ApiError;
    try {
      apiError = await res.json();
    } catch {
      apiError = {
        status: res.status,
        error: res.statusText,
        message: `Request failed with status ${res.status}`,
        details: [],
        timestamp: new Date().toISOString(),
        path: '',
      };
    }
    throw new ApiClientError(apiError);
  }

  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDownload(path: string): Promise<Blob> {
  const res = await fetch(buildUrl(path), {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    let apiError: ApiError;
    try {
      apiError = await res.json();
    } catch {
      apiError = {
        status: res.status,
        error: res.statusText,
        message: `Download failed with status ${res.status}`,
        details: [],
        timestamp: new Date().toISOString(),
        path,
      };
    }
    throw new ApiClientError(apiError);
  }
  return res.blob();
}

export { ApiClientError };
