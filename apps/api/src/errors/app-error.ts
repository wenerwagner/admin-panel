import { errorCodes, type ErrorCode } from "./error-codes.js";

export type ErrorDetail = {
  field?: string;
  message: string;
};

export type PublicErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetail[];
    requestId?: string;
  };
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: ErrorDetail[];

  constructor({
    code,
    message,
    statusCode,
    details,
  }: {
    code: ErrorCode;
    message: string;
    statusCode: number;
    details?: ErrorDetail[];
  }) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(details?: ErrorDetail[], message = "Request validation failed") {
    super({
      code: errorCodes.validation,
      message,
      statusCode: 400,
      details,
    });
  }
}

export class AuthenticationRequiredError extends AppError {
  constructor(message = "Authentication required") {
    super({ code: errorCodes.authenticationRequired, message, statusCode: 401 });
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password") {
    super({ code: errorCodes.invalidCredentials, message, statusCode: 401 });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super({ code: errorCodes.forbidden, message, statusCode: 403 });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({ code: errorCodes.notFound, message, statusCode: 404 });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super({ code: errorCodes.conflict, message, statusCode: 409 });
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests") {
    super({ code: errorCodes.rateLimited, message, statusCode: 429 });
  }
}
