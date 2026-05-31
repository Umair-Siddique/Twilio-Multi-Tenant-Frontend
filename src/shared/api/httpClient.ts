import { appConfig } from "@/shared/config/appConfig";
import { authSession } from "@/shared/session/authSession";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
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

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
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

// Merge a caller-supplied signal with a timeout signal so either can abort the request.
function mergeSignals(callerSignal: AbortSignal | undefined, timeoutSignal: AbortSignal): AbortSignal {
  if (!callerSignal) return timeoutSignal;
  const controller = new AbortController();
  const abort = (reason?: unknown) => controller.abort(reason);
  if (callerSignal.aborted) { abort(callerSignal.reason); return controller.signal; }
  if (timeoutSignal.aborted) { abort(timeoutSignal.reason); return controller.signal; }
  callerSignal.addEventListener("abort", () => abort(callerSignal.reason), { once: true });
  timeoutSignal.addEventListener("abort", () => abort(timeoutSignal.reason), { once: true });
  return controller.signal;
}

const REQUEST_TIMEOUT_MS = 15_000;

export async function request<T>(
  path: string,
  { method = "GET", body, auth = false, signal }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (auth) {
    const token = authSession.getAccessToken();
    if (token) {
      const trimmedToken = token.trim();
      // Validate JWT format before sending
      if (trimmedToken.split(".").length === 3) {
        headers.Authorization = `Bearer ${trimmedToken}`;
      } else {
        throw new ApiError("Invalid access token format", 401, { error: "Token is malformed" });
      }
    } else {
      throw new ApiError("Authorization token required", 401, { error: "No token available" });
    }
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const combinedSignal = mergeSignals(signal, timeoutController.signal);

  let response: Response;
  try {
    response = await fetch(joinUrl(appConfig.apiBaseUrl, path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: combinedSignal
    });
  } catch (networkErr) {
    clearTimeout(timeoutId);
    // Re-throw AbortError so callers can distinguish cancellation from real failures
    if (isAbortError(networkErr)) throw networkErr;
    throw new ApiError(
      "Server is unreachable right now. Please wait a few seconds and try again.",
      0,
      { error: networkErr instanceof Error ? networkErr.message : "Network error" }
    );
  }
  clearTimeout(timeoutId);

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
