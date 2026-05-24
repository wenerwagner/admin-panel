export const defaultTestDatabaseUrl = "postgres://admin_panel:admin_panel_password@localhost:5432/admin_panel?schema=test";

export function configureTestEnv() {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? defaultTestDatabaseUrl;
  process.env.PORT ??= "3000";
  process.env.SESSION_COOKIE_NAME ??= "admin_session";
  process.env.SESSION_COOKIE_SECURE ??= "false";
  process.env.SESSION_TTL_HOURS ??= "8";
  process.env.CSRF_SECRET ??= "local_test_csrf_secret_that_is_long_enough";
  process.env.CORS_ALLOWED_ORIGINS ??= "http://localhost:5173,http://localhost:8080";
  process.env.TRUST_PROXY ??= "false";
  process.env.LOG_LEVEL ??= "info";
}

export function getTestDatabaseSchema() {
  const databaseUrl = new URL(process.env.DATABASE_URL ?? defaultTestDatabaseUrl);

  return databaseUrl.searchParams.get("schema") ?? "public";
}
