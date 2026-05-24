import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AppError, errorCodes, errorMiddleware, mapZodError, ValidationError } from "../../src/errors/index.js";

function createMockResponse() {
  const response = {
    headersSent: false,
    getHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    getHeader: ReturnType<typeof vi.fn>;
  };
}

function createMockRequest(headers: Record<string, string> = {}) {
  return {
    get: vi.fn((name: string) => headers[name.toLowerCase()]),
  } as unknown as Request;
}

function callErrorMiddleware(error: unknown, request = createMockRequest(), response = createMockResponse()) {
  const next = vi.fn() as NextFunction;

  errorMiddleware(error, request, response, next);

  return { next, response };
}

describe("errorMiddleware", () => {
  it("maps typed validation errors to ADR-004 validation responses", () => {
    const { response } = callErrorMiddleware(new ValidationError([{ field: "email", message: "Invalid email" }]));

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: errorCodes.validation,
        message: "Request validation failed",
        details: [{ field: "email", message: "Invalid email" }],
      },
    });
  });

  it("maps application errors using their status, code, and public message", () => {
    const { response } = callErrorMiddleware(
      new AppError({
        code: errorCodes.conflict,
        message: "Email already exists",
        statusCode: 409,
      }),
    );

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: errorCodes.conflict,
        message: "Email already exists",
      },
    });
  });

  it("maps Zod errors to controlled validation details without echoing submitted values", () => {
    const schema = z.object({
      email: z.email(),
      cpf: z.string().refine(() => false, "Invalid CPF"),
      password: z.string().min(1),
    });
    const submitted = {
      email: "sensitive@example",
      cpf: "123.456.789-00",
      password: "",
    };
    const result = schema.safeParse(submitted);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    const { response } = callErrorMiddleware(result.error);
    const body = response.json.mock.calls[0]?.[0];

    expect(response.status).toHaveBeenCalledWith(400);
    expect(body).toEqual({
      error: {
        code: errorCodes.validation,
        message: "Request validation failed",
        details: [
          { field: "email", message: "Invalid email" },
          { field: "cpf", message: "Invalid CPF" },
          { field: "password", message: "Required" },
        ],
      },
    });
    expect(JSON.stringify(body)).not.toContain(submitted.email);
    expect(JSON.stringify(body)).not.toContain(submitted.cpf);
  });

  it("returns generic internal errors without stack traces or exception messages", () => {
    const request = createMockRequest({ "x-request-id": "req_123" });
    const { response } = callErrorMiddleware(new Error("database password leaked"), request);
    const body = response.json.mock.calls[0]?.[0];

    expect(response.status).toHaveBeenCalledWith(500);
    expect(body).toEqual({
      error: {
        code: errorCodes.internal,
        message: "Unexpected server error",
        requestId: "req_123",
      },
    });
    expect(JSON.stringify(body)).not.toContain("database password leaked");
    expect(JSON.stringify(body)).not.toContain("stack");
  });

  it("delegates when headers are already sent", () => {
    const response = createMockResponse();
    response.headersSent = true;
    const error = new Error("already started");
    const { next } = callErrorMiddleware(error, createMockRequest(), response);

    expect(next).toHaveBeenCalledWith(error);
    expect(response.status).not.toHaveBeenCalled();
  });
});

describe("mapZodError", () => {
  it("maps missing required fields to Required", () => {
    const result = z.object({ email: z.email() }).safeParse({});

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(mapZodError(result.error)).toEqual([
      {
        field: "email",
        message: "Required",
      },
    ]);
  });

  it("maps enum validation to a controlled option message", () => {
    const result = z.object({ subscribedPlan: z.enum(["basic", "premium"]) }).safeParse({
      subscribedPlan: "enterprise",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(mapZodError(result.error)).toEqual([
      {
        field: "subscribedPlan",
        message: "Must be one of: basic, premium",
      },
    ]);
  });
});
