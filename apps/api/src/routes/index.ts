import { Router } from "express";

import { authRoutes } from "./auth.routes.js";
import { healthRoutes } from "./health.routes.js";

export const apiRoutes = Router();

apiRoutes.use(authRoutes);
apiRoutes.use(healthRoutes);
