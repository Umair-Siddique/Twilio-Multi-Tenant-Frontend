import { appConfig } from "@/shared/config/appConfig";
import { authSession } from "@/shared/session/authSession";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
};

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getErrorMessage(payload: unknown): string {
  if (typeof payload === "object" && payload && "error" in payload) {
    const maybeError = (payload as { error?: unknown }).error;
    if (typeof maybeError === "string") {
      return maybeError;
    }
  }
  return "Something went wrong. Please try again.";
}

export async function request<T>(
  path: string,
  { method = "GET", body, auth = false }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (auth) {
    const token = authSession.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(joinUrl(appConfig.apiBaseUrl, path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      payload = { error: raw };
    }
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status, payload);
  }

  return payload as T;
}

