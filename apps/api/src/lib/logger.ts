import pino, { type DestinationStream, type Logger } from "pino";

const redactPaths = [
  "password",
  "passwordHash",
  "sessionToken",
  "csrfToken",
  "cookie",
  "cpf",
  "phone",
  "email",
  "name",
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.x-csrf-token",
  "headers.authorization",
  "headers.cookie",
  "headers.x-csrf-token",
];

export type AppLogger = Logger;

export function createLogger({
  level = process.env.LOG_LEVEL ?? "info",
  stream,
}: {
  level?: string;
  stream?: DestinationStream;
} = {}): AppLogger {
  return pino(
    {
      level,
      redact: {
        paths: redactPaths,
        censor: "[Redacted]",
      },
      serializers: {
        error: pino.stdSerializers.err,
      },
    },
    stream,
  );
}

export const logger = createLogger();
