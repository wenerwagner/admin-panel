import { z } from "zod";

const booleanFromStringSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const integerFromStringSchema = z.coerce.number().int();

const nodeEnvSchema = z.enum(["development", "test", "production"]);

const logLevelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);

const commaSeparatedOriginsSchema = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

const rawEnvSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    PORT: integerFromStringSchema.min(1).max(65535),
    DATABASE_URL: z.string().url(),
    SESSION_COOKIE_NAME: z.string().min(1).default("admin_session"),
    SESSION_COOKIE_SECURE: booleanFromStringSchema.default(false),
    SESSION_TTL_HOURS: integerFromStringSchema.positive().default(8),
    CSRF_SECRET: z.string().min(32),
    CORS_ALLOWED_ORIGINS: commaSeparatedOriginsSchema.default([]),
    TRUST_PROXY: booleanFromStringSchema.default(false),
    LOG_LEVEL: logLevelSchema.default("info"),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production" && !value.SESSION_COOKIE_SECURE) {
      context.addIssue({
        code: "custom",
        path: ["SESSION_COOKIE_SECURE"],
        message: "SESSION_COOKIE_SECURE must be true in production",
      });
    }
  });

export type Env = {
  nodeEnv: z.infer<typeof nodeEnvSchema>;
  port: number;
  databaseUrl: string;
  sessionCookieName: string;
  sessionCookieSecure: boolean;
  sessionTtlHours: number;
  csrfSecret: string;
  corsAllowedOrigins: string[];
  trustProxy: boolean;
  logLevel: z.infer<typeof logLevelSchema>;
};

export class EnvValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid API environment configuration: ${issues.join("; ")}`);
    this.name = "EnvValidationError";
  }
}

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = rawEnvSchema.safeParse(source);

  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map((issue) => {
        const path = issue.path.join(".") || "environment";
        return `${path}: ${issue.message}`;
      }),
    );
  }

  return {
    nodeEnv: result.data.NODE_ENV,
    port: result.data.PORT,
    databaseUrl: result.data.DATABASE_URL,
    sessionCookieName: result.data.SESSION_COOKIE_NAME,
    sessionCookieSecure: result.data.SESSION_COOKIE_SECURE,
    sessionTtlHours: result.data.SESSION_TTL_HOURS,
    csrfSecret: result.data.CSRF_SECRET,
    corsAllowedOrigins: result.data.CORS_ALLOWED_ORIGINS,
    trustProxy: result.data.TRUST_PROXY,
    logLevel: result.data.LOG_LEVEL,
  };
}
