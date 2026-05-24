import { describe, expect, it } from "vitest";

import { EnvValidationError, parseEnv } from "../../src/config/env.js";

const validEnv = {
  NODE_ENV: "development",
  PORT: "3000",
  DATABASE_URL: "postgres://admin_panel:admin_panel_password@localhost:5432/admin_panel",
  SESSION_COOKIE_NAME: "admin_session",
  SESSION_COOKIE_SECURE: "false",
  SESSION_TTL_HOURS: "8",
  CSRF_SECRET: "local_csrf_secret_that_is_long_enough",
  CORS_ALLOWED_ORIGINS: "http://localhost:5173, http://localhost:8080",
  TRUST_PROXY: "false",
  LOG_LEVEL: "info",
};

describe("parseEnv", () => {
  it("returns typed config for valid environment variables", () => {
    expect(parseEnv(validEnv)).toEqual({
      nodeEnv: "development",
      port: 3000,
      databaseUrl: "postgres://admin_panel:admin_panel_password@localhost:5432/admin_panel",
      sessionCookieName: "admin_session",
      sessionCookieSecure: false,
      sessionTtlHours: 8,
      csrfSecret: "local_csrf_secret_that_is_long_enough",
      corsAllowedOrigins: ["http://localhost:5173", "http://localhost:8080"],
      trustProxy: false,
      logLevel: "info",
    });
  });

  it("applies ADR-002 defaults for optional local settings", () => {
    const { SESSION_COOKIE_NAME, SESSION_COOKIE_SECURE, SESSION_TTL_HOURS, TRUST_PROXY, LOG_LEVEL, ...source } =
      validEnv;

    expect(parseEnv(source)).toMatchObject({
      sessionCookieName: "admin_session",
      sessionCookieSecure: false,
      sessionTtlHours: 8,
      trustProxy: false,
      logLevel: "info",
    });
  });

  it("fails clearly when required environment variables are missing", () => {
    expect(() => parseEnv({})).toThrow(EnvValidationError);
    expect(() => parseEnv({})).toThrow(/NODE_ENV/);
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
    expect(() => parseEnv({})).toThrow(/CSRF_SECRET/);
  });

  it("rejects insecure session cookies in production", () => {
    expect(() =>
      parseEnv({
        ...validEnv,
        NODE_ENV: "production",
        SESSION_COOKIE_SECURE: "false",
      }),
    ).toThrow(/SESSION_COOKIE_SECURE must be true in production/);
  });
});
