import express from "express";

import { errorMiddleware, NotFoundError } from "./errors/index.js";
import { logger as defaultLogger, type AppLogger } from "./lib/logger.js";
import { requestIdMiddleware } from "./lib/request-id.js";
import { requestLoggingMiddleware } from "./middleware/request-logging.middleware.js";
import { apiRoutes } from "./routes/index.js";

export function createApp({ logger = defaultLogger }: { logger?: AppLogger } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware(logger));
  app.use(express.json());
  app.use("/api", apiRoutes);
  app.use("/api", () => {
    throw new NotFoundError("Route not found");
  });
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
