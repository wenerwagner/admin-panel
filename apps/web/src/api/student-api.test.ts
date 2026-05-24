import { afterEach, describe, expect, it, vi } from "vitest";

import { listStudents } from "./student-api.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("student API", () => {
  it("sends accepted list query parameters", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
          page: 2,
          pageSize: 50,
          total: 0,
          totalPages: 1,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await listStudents({
      q: "ana",
      status: "active",
      subscribedPlan: "premium",
      page: 2,
      pageSize: 50,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/students?q=ana&status=active&subscribedPlan=premium&page=2&pageSize=50",
      {
        method: "GET",
        credentials: "include",
        headers: {},
        body: undefined,
        signal: undefined,
      },
    );
  });
});
