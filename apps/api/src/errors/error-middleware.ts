import type { ErrorRequestHandler, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError, type PublicErrorBody } from "./app-error.js";
import { errorCodes } from "./error-codes.js";
import { validationErrorFromZod } from "./validation-error.js";

function requestIdFrom(request: Request, response: Response): string | undefined {
  const responseRequestId = response.getHeader("X-Request-Id");

  if (typeof responseRequestId === "string" && responseRequestId.length > 0) {
    return responseRequestId;
  }

  const requestHeader = request.get("x-request-id");
  return requestHeader && requestHeader.length > 0 ? requestHeader : undefined;
}

function appErrorBody(error: AppError): PublicErrorBody {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && error.details.length > 0 ? { details: error.details } : {}),
    },
  };
}

function internalErrorBody(request: Request, response: Response): PublicErrorBody {
  const requestId = requestIdFrom(request, response);

  return {
    error: {
      code: errorCodes.internal,
      message: "Unexpected server error",
      ...(requestId ? { requestId } : {}),
    },
  };
}

export const errorMiddleware: ErrorRequestHandler = (error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    const validationError = validationErrorFromZod(error);
    response.status(validationError.statusCode).json(appErrorBody(validationError));
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json(appErrorBody(error));
    return;
  }

  response.status(500).json(internalErrorBody(request, response));
};
