import { ApiError } from "../api/client.js";
import type { ApiErrorDetail, ErrorCode } from "../types/api.js";

const userFacingMessages = {
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
  AUTHENTICATION_REQUIRED: "Please sign in to continue.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested record was not found.",
  CONFLICT: "A record with the same email or CPF already exists.",
  RATE_LIMITED: "Too many attempts. Please wait and try again.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
} as const satisfies Record<ErrorCode, string>;

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return userFacingMessages[error.code];
  }

  return userFacingMessages.INTERNAL_ERROR;
}

export function apiFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.code !== "VALIDATION_ERROR") {
    return {};
  }

  return error.details.reduce<Record<string, string>>((fieldErrors, detail) => {
    if (detail.field) {
      fieldErrors[detail.field] = safeFieldMessage(detail);
    }

    return fieldErrors;
  }, {});
}

function safeFieldMessage(detail: ApiErrorDetail): string {
  return detail.message || "Invalid value";
}
