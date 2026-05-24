import type { Request, Response } from "express";

import { parseEnv } from "../config/env.js";
import {
  clearSessionCookie,
  sessionCookie,
  sessionTokenFrom,
  type SessionCookieOptions,
} from "../lib/session-cookie.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { AuthService } from "../services/auth.service.js";

const env = parseEnv(process.env);
const cookieOptions: SessionCookieOptions = {
  name: env.sessionCookieName,
  secure: env.sessionCookieSecure,
};
const authService = new AuthService();

export async function login(request: Request, response: Response): Promise<void> {
  const input = loginSchema.parse(request.body);
  const result = await authService.login(input);

  response.setHeader("Set-Cookie", sessionCookie(result.sessionToken, result.expiresAt, cookieOptions));
  response.status(200).json({
    admin: result.admin,
  });
}

export async function me(request: Request, response: Response): Promise<void> {
  const session = await authService.authenticate(sessionTokenFrom(request, env.sessionCookieName));

  response.status(200).json({
    admin: session.admin,
    csrfToken: authService.csrfTokenFor(session),
  });
}

export async function logout(request: Request, response: Response): Promise<void> {
  await authService.logout(sessionTokenFrom(request, env.sessionCookieName));

  response.setHeader("Set-Cookie", clearSessionCookie(cookieOptions));
  response.status(204).send();
}
