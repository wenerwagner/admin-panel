import type { NextFunction, Request, Response } from "express";

import { parseEnv } from "../config/env.js";
import { ForbiddenError } from "../errors/index.js";
import { verifyCsrfToken } from "../lib/csrf.js";

const csrfHeaderName = "x-csrf-token";
const env = parseEnv(process.env);

export function requireCsrfToken(request: Request, _response: Response, next: NextFunction): void {
  const session = request.auth;

  if (!session || !verifyCsrfToken(session.tokenHash, env.csrfSecret, request.get(csrfHeaderName))) {
    next(new ForbiddenError("Invalid CSRF token"));
    return;
  }

  next();
}
