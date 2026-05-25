import { readFileSync } from "node:fs";

import { Router, type NextFunction, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";
import { parse as parseYaml } from "yaml";

import { parseEnv } from "../config/env.js";
import { NotFoundError } from "../errors/index.js";

const openApiYaml = readFileSync(new URL("../../openapi.yaml", import.meta.url), "utf8");
const openApiDocument = parseYaml(openApiYaml) as swaggerUi.JsonObject;
const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  customCss: "",
  customSiteTitle: "Escola do Breno Admin Panel API",
  swaggerOptions: {
    persistAuthorization: false,
  },
};

export const docsRoutes = Router();

docsRoutes.get("/docs/openapi.yaml", requireLocalDocs, (_request, response) => {
  response.type("application/yaml").send(openApiYaml);
});
docsRoutes.use("/docs", requireLocalDocs, ensureDocsTrailingSlash);
docsRoutes.use(
  "/docs",
  ...swaggerUi.serveFiles(openApiDocument, swaggerUiOptions),
  swaggerUi.setup(openApiDocument, swaggerUiOptions),
);

function requireLocalDocs(request: Request, _response: Response, next: NextFunction): void {
  const env = parseEnv(process.env);

  if (env.nodeEnv === "production") {
    next(new NotFoundError("Route not found"));
    return;
  }

  next();
}

function ensureDocsTrailingSlash(request: Request, response: Response, next: NextFunction): void {
  if ((request.path === "" || request.path === "/") && !request.originalUrl.endsWith("/")) {
    response.redirect(302, `${request.originalUrl}/`);
    return;
  }

  next();
}
