import { randomUUID } from "node:crypto";

import type { Request, Response, NextFunction } from "express";

const requestIdHeader = "X-Request-Id";
const safeRequestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

export type RequestWithId = Request & {
  requestId: string;
};

export function isSafeRequestId(value: string): boolean {
  return safeRequestIdPattern.test(value);
}

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction) {
  const incomingRequestId = request.get(requestIdHeader);
  const requestId = incomingRequestId && isSafeRequestId(incomingRequestId) ? incomingRequestId : randomUUID();

  (request as RequestWithId).requestId = requestId;
  response.setHeader(requestIdHeader, requestId);
  next();
}

export function getRequestId(request: Request): string | undefined {
  return (request as Partial<RequestWithId>).requestId;
}
