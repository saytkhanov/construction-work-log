/**
 * Тонкая типизированная обёртка над fetch.
 *
 * Базовый URL берётся из VITE_API_URL (например http://localhost:3000).
 * Если переменная не задана — используется относительный путь, который
 * в dev проксирует Vite, а в Docker — nginx.
 */
const API_URL = import.meta.env.VITE_API_URL ?? '';
const API_BASE = `${API_URL}/api`;

export class ApiError extends Error {
  readonly status: number;
  /** Карта ошибок валидации по полям, если backend её вернул. */
  readonly errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload?.errors);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
