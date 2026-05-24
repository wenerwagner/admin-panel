import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest, parseApiError } from "./client.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client", () => {
  it("preserves API error code and details when parsing error responses", async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: [{ field: "email", message: "Invalid email" }],
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const error = await parseApiError(response);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Request validation failed");
    expect(error.details).toEqual([{ field: "email", message: "Invalid email" }]);
  });

  it("sends JSON state-changing requests with optional CSRF token support", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "student-id" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest<{ id: string }>("/students", {
      method: "POST",
      body: { name: "Ana Silva" },
      csrfToken: "csrf-token",
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/students", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "csrf-token",
      },
      body: JSON.stringify({ name: "Ana Silva" }),
      signal: undefined,
    });
  });
});
