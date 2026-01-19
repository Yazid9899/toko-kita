import type { SafeUser } from "@shared/types";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const refreshToken = async () => {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { accessToken?: string };
  if (data.accessToken) setAccessToken(data.accessToken);
  return true;
};

const request = async <T>(path: string, options: RequestInit & { retry?: boolean } = {}): Promise<T> => {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: "include"
  });

  if (res.status === 401 && !options.retry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return request<T>(path, { ...options, retry: true });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error?.message || "Request failed");
  }

  return res.json() as Promise<T>;
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" })
};

export type AuthResponse = {
  user: SafeUser;
  accessToken?: string;
};
