import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { AppLogger } from "../lib/logger.js";
import { getRequestId } from "../lib/request-id.js";

function routeTemplateFor(request: Request): string {
  if (request.route?.path) {
    return `${request.baseUrl}${String(request.route.path)}`;
  }

  return request.baseUrl || request.path;
}

export function requestLoggingMiddleware(logger: AppLogger): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    const startedAt = process.hrtime.bigint();

    response.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      logger.info(
        {
          requestId: getRequestId(request),
          method: request.method,
          route: routeTemplateFor(request),
          statusCode: response.statusCode,
          durationMs: Math.round(durationMs * 100) / 100,
        },
        "request completed",
      );
    });

    next();
  };
}
