export const errorCodes = {
  validation: "VALIDATION_ERROR",
  authenticationRequired: "AUTHENTICATION_REQUIRED",
  invalidCredentials: "INVALID_CREDENTIALS",
  forbidden: "FORBIDDEN",
  notFound: "NOT_FOUND",
  conflict: "CONFLICT",
  rateLimited: "RATE_LIMITED",
  internal: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes];
