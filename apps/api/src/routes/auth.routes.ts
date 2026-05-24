import { Router, type NextFunction, type Request, type Response } from "express";

import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCsrfToken } from "../middleware/csrf.middleware.js";
import { loginRateLimit } from "../middleware/rate-limit.middleware.js";

export const authRoutes = Router();

authRoutes.post("/auth/login", loginRateLimit, asyncHandler(authController.login));
authRoutes.get("/auth/me", asyncHandler(authController.me));
authRoutes.post("/auth/logout", requireAuth, requireCsrfToken, asyncHandler(authController.logout));

function asyncHandler(handler: (request: Request, response: Response) => Promise<void>) {
  return (request: Request, response: Response, next: NextFunction) => {
    void handler(request, response).catch(next);
  };
}
