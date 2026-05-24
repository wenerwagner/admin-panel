import { apiRequest } from "./client.js";
import type { AuthResponse, CurrentAdminResponse, LoginRequest } from "../types/api.js";

export function login(input: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
    signal,
  });
}

export function getCurrentAdmin(signal?: AbortSignal): Promise<CurrentAdminResponse> {
  return apiRequest<CurrentAdminResponse>("/auth/me", { signal });
}

export function logout(csrfToken: string, signal?: AbortSignal): Promise<void> {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    csrfToken,
    signal,
  });
}
