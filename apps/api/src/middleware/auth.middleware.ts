import type { NextFunction, Request, Response } from "express";

import { parseEnv } from "../config/env.js";
import { sessionTokenFrom } from "../lib/session-cookie.js";
import { AuthService, type AuthSession } from "../services/auth.service.js";

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthSession;
  }
}

const env = parseEnv(process.env);
const authService = new AuthService();

export async function requireAuth(request: Request, _response: Response, next: NextFunction): Promise<void> {
  try {
    request.auth = await authService.authenticate(sessionTokenFrom(request, env.sessionCookieName));
    next();
  } catch (error) {
    next(error);
  }
}
