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
const swaggerHtml = swaggerUi.generateHTML(openApiDocument, swaggerUiOptions);

export const docsRoutes = Router();

docsRoutes.get("/docs/openapi.yaml", requireLocalDocs, (_request, response) => {
  response.type("application/yaml").send(openApiYaml);
});
docsRoutes.get("/docs", requireLocalDocs, (_request, response) => {
  response.type("html").send(swaggerHtml);
});
docsRoutes.get("/docs/", requireLocalDocs, (_request, response) => {
  response.type("html").send(swaggerHtml);
});
docsRoutes.use("/docs", requireLocalDocs, ...swaggerUi.serveFiles(openApiDocument, swaggerUiOptions));

function requireLocalDocs(request: Request, _response: Response, next: NextFunction): void {
  const env = parseEnv(process.env);

  if (env.nodeEnv === "production") {
    next(new NotFoundError("Route not found"));
    return;
  }

  next();
}
