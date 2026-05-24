import type { ApiErrorBody, ApiErrorDetail, ErrorCode } from "../types/api.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  csrfToken?: string;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly details: ApiErrorDetail[];
  readonly requestId?: string;
  readonly status: number;

  constructor({ body, status }: { body: ApiErrorBody; status: number }) {
    super(body.error.message);
    this.name = "ApiError";
    this.code = body.error.code;
    this.details = body.error.details ?? [];
    this.requestId = body.error.requestId;
    this.status = status;
  }
}

export async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const response = await fetch(apiUrl(path), {
    method: options.method ?? "GET",
    credentials: "include",
    headers: requestHeaders(options),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const body = await parseApiErrorBody(response);
  return new ApiError({ body, status: response.status });
}

function requestHeaders(options: ApiRequestOptions): HeadersInit {
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.csrfToken) {
    headers["X-CSRF-Token"] = options.csrfToken;
  }

  return headers;
}

function apiUrl(path: string): string {
  const normalizedBaseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function parseApiErrorBody(response: Response): Promise<ApiErrorBody> {
  const fallback: ApiErrorBody = {
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    },
  };

  try {
    const body = (await response.json()) as unknown;

    if (isApiErrorBody(body)) {
      return body;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!value || typeof value !== "object" || !("error" in value)) {
    return false;
  }

  const { error } = value as { error: unknown };
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Partial<ApiErrorBody["error"]>;
  return isErrorCode(candidate.code) && typeof candidate.message === "string";
}

function isErrorCode(value: unknown): value is ErrorCode {
  return (
    value === "VALIDATION_ERROR" ||
    value === "AUTHENTICATION_REQUIRED" ||
    value === "INVALID_CREDENTIALS" ||
    value === "FORBIDDEN" ||
    value === "NOT_FOUND" ||
    value === "CONFLICT" ||
    value === "RATE_LIMITED" ||
    value === "INTERNAL_ERROR"
  );
}
