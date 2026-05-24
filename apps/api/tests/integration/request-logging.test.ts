import { Writable } from "node:stream";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import { createLogger } from "../../src/lib/logger.js";

class MemoryLogStream extends Writable {
  readonly lines: string[] = [];

  override _write(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    this.lines.push(chunk.toString("utf8"));
    callback();
  }
}

function createLoggedApp() {
  const stream = new MemoryLogStream();
  const logger = createLogger({ stream });
  const app = createApp({ logger });

  return { app, stream };
}

async function waitForLogs() {
  await new Promise((resolve) => setImmediate(resolve));
}

function parsedLogs(stream: MemoryLogStream) {
  return stream.lines
    .join("")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

describe("request logging", () => {
  it("generates a request ID when none is provided and logs request completion", async () => {
    const { app, stream } = createLoggedApp();

    const response = await request(app).get("/api/health").expect(200);
    await waitForLogs();

    const requestId = response.header["x-request-id"];
    expect(requestId).toEqual(expect.any(String));
    expect(requestId).toHaveLength(36);

    expect(parsedLogs(stream)).toEqual([
      expect.objectContaining({
        requestId,
        method: "GET",
        route: "/api/health",
        statusCode: 200,
        msg: "request completed",
      }),
    ]);
    expect(parsedLogs(stream)[0]?.durationMs).toEqual(expect.any(Number));
  });

  it("uses a safe incoming X-Request-Id value", async () => {
    const { app, stream } = createLoggedApp();
    const incomingRequestId = "support-case-123";

    const response = await request(app).get("/api/health").set("X-Request-Id", incomingRequestId).expect(200);
    await waitForLogs();

    expect(response.header["x-request-id"]).toBe(incomingRequestId);
    expect(parsedLogs(stream)[0]).toEqual(
      expect.objectContaining({
        requestId: incomingRequestId,
        method: "GET",
        route: "/api/health",
        statusCode: 200,
      }),
    );
  });

  it("replaces unsafe incoming X-Request-Id values", async () => {
    const { app } = createLoggedApp();
    const unsafeRequestId = "bad/request/id";

    const response = await request(app).get("/api/health").set("X-Request-Id", unsafeRequestId).expect(200);

    expect(response.header["x-request-id"]).not.toBe(unsafeRequestId);
    expect(response.header["x-request-id"]).toEqual(expect.any(String));
  });

  it("does not log cookies, sensitive headers, or sensitive submitted body values", async () => {
    const { app, stream } = createLoggedApp();
    const sensitiveValues = [
      "admin_session=raw-session-token",
      "csrf-secret-token",
      "plain-password",
      "123.456.789-00",
      "+5581999998888",
      "student@example.com",
      "Ana Silva",
    ];

    await request(app)
      .post("/api/unknown")
      .set("Cookie", sensitiveValues[0] ?? "")
      .set("X-CSRF-Token", sensitiveValues[1] ?? "")
      .send({
        password: sensitiveValues[2],
        cpf: sensitiveValues[3],
        phone: sensitiveValues[4],
        email: sensitiveValues[5],
        name: sensitiveValues[6],
      })
      .expect(404);
    await waitForLogs();

    const rawLogs = stream.lines.join("");

    for (const value of sensitiveValues) {
      expect(rawLogs).not.toContain(value);
    }
    expect(parsedLogs(stream)[0]).toEqual(
      expect.objectContaining({
        method: "POST",
        route: "/api/unknown",
        statusCode: 404,
      }),
    );
  });
});
