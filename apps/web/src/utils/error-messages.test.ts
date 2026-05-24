import { describe, expect, it } from "vitest";

import { ApiError } from "../api/client.js";
import type { ApiErrorDetail, ErrorCode } from "../types/api.js";
import { apiErrorMessage, apiFieldErrors } from "./error-messages.js";

describe("API error messages", () => {
  it("maps known API error codes to safe user-facing messages", () => {
    expect(apiErrorMessage(apiError("INVALID_CREDENTIALS"))).toBe("Invalid email or password.");
    expect(apiErrorMessage(apiError("AUTHENTICATION_REQUIRED"))).toBe("Please sign in to continue.");
    expect(apiErrorMessage(apiError("CONFLICT"))).toBe("A record with the same email or CPF already exists.");
    expect(apiErrorMessage(new Error("network failed"))).toBe("Something went wrong. Please try again.");
  });

  it("extracts validation field errors without exposing raw response bodies", () => {
    const error = apiError("VALIDATION_ERROR", [
      { field: "email", message: "Invalid email" },
      { field: "cpf", message: "Invalid CPF" },
      { message: "Request validation failed" },
    ]);

    expect(apiFieldErrors(error)).toEqual({
      email: "Invalid email",
      cpf: "Invalid CPF",
    });
  });

  it("extracts conflict field errors when the API provides field details", () => {
    const error = apiError("CONFLICT", [{ field: "cpf", message: "CPF already exists" }]);

    expect(apiFieldErrors(error)).toEqual({
      cpf: "CPF already exists",
    });
  });
});

function apiError(code: ErrorCode, details: ApiErrorDetail[] = []) {
  return new ApiError({
    status: 400,
    body: {
      error: {
        code,
        message: "API error",
        details,
      },
    },
  });
}
