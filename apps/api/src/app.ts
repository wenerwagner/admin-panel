import express from "express";

import { errorMiddleware, NotFoundError } from "./errors/index.js";
import { apiRoutes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use("/api", apiRoutes);
  app.use("/api", () => {
    throw new NotFoundError("Route not found");
  });
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
