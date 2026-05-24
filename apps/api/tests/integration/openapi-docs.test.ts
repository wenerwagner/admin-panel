import { readFile } from "node:fs/promises";

import SwaggerParser from "@apidevtools/swagger-parser";
import request from "supertest";
import { parse as parseYaml } from "yaml";
import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import { errorCodes } from "../../src/errors/error-codes.js";

const openApiPath = new URL("../../openapi.yaml", import.meta.url);
const originalNodeEnv = process.env.NODE_ENV;
const originalSessionCookieSecure = process.env.SESSION_COOKIE_SECURE;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  process.env.SESSION_COOKIE_SECURE = originalSessionCookieSecure;
});

describe("OpenAPI documentation", () => {
  it("serves Swagger UI and the OpenAPI YAML outside production", async () => {
    process.env.NODE_ENV = "development";
    process.env.SESSION_COOKIE_SECURE = "false";
    const app = createApp();

    const docsResponse = await request(app).get("/api/docs").expect(200);
    expect(docsResponse.text).toContain("Escola do Breno Admin Panel API");
    expect(docsResponse.text).toContain("swagger-ui");

    const specResponse = await request(app).get("/api/docs/openapi.yaml").expect(200);
    expect(specResponse.type).toBe("application/yaml");
    expect(specResponse.text).toContain("openapi: 3.1.0");
  });

  it("does not expose Swagger UI or the OpenAPI YAML in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.SESSION_COOKIE_SECURE = "true";
    const app = createApp();

    for (const path of ["/api/docs", "/api/docs/openapi.yaml"]) {
      const response = await request(app).get(path).expect(404);

      expect(response.body).toEqual({
        error: {
          code: errorCodes.notFound,
          message: "Route not found",
        },
      });
    }
  });

  it("keeps a valid OpenAPI document for the v1 API contract", async () => {
    const openApiYaml = await readFile(openApiPath, "utf8");
    const document = parseYaml(openApiYaml) as {
      openapi: string;
      paths: Record<string, unknown>;
      components: { schemas: Record<string, unknown>; responses: Record<string, unknown> };
    };

    await expect(SwaggerParser.validate(openApiPath.pathname)).resolves.toMatchObject({
      openapi: "3.1.0",
      info: {
        title: "Escola do Breno Admin Panel API",
      },
    });

    expect(Object.keys(document.paths).sort()).toEqual([
      "/auth/login",
      "/auth/logout",
      "/auth/me",
      "/health",
      "/students",
      "/students/{studentId}",
    ]);
    expect(document.components.schemas).toHaveProperty("ErrorResponse");
    expect(document.components.responses).toHaveProperty("ValidationError");
  });
});
