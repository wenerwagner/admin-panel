import { Router, type NextFunction, type Request, type Response } from "express";

import * as studentController from "../controllers/student.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCsrfToken } from "../middleware/csrf.middleware.js";

export const studentRoutes = Router();

studentRoutes.get("/students", requireAuth, asyncHandler(studentController.list));
studentRoutes.post("/students", requireAuth, requireCsrfToken, asyncHandler(studentController.create));
studentRoutes.get("/students/:studentId", requireAuth, asyncHandler(studentController.detail));
studentRoutes.patch("/students/:studentId", requireAuth, requireCsrfToken, asyncHandler(studentController.update));
studentRoutes.delete("/students/:studentId", requireAuth, requireCsrfToken, asyncHandler(studentController.remove));

function asyncHandler(handler: (request: Request, response: Response) => Promise<void>) {
  return (request: Request, response: Response, next: NextFunction) => {
    void handler(request, response).catch(next);
  };
}
