import express from "express";

import { apiRoutes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use("/api", apiRoutes);

  return app;
}

export const app = createApp();
