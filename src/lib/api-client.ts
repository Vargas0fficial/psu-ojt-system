export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    });
    const json = await res.json();
    return json as ApiResult<T>;
  } catch {
    return { success: false, error: "Network error. Please check your connection." };
  }
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url),
  post: <T>(url: string, body?: unknown) =>
    apiRequest<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: unknown) =>
    apiRequest<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: "DELETE" }),
};
