import { Router, type NextFunction, type Request, type Response } from "express";

import * as studentController from "../controllers/student.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const studentRoutes = Router();

studentRoutes.get("/students", requireAuth, asyncHandler(studentController.list));
studentRoutes.get("/students/:studentId", requireAuth, asyncHandler(studentController.detail));

function asyncHandler(handler: (request: Request, response: Response) => Promise<void>) {
  return (request: Request, response: Response, next: NextFunction) => {
    void handler(request, response).catch(next);
  };
}
