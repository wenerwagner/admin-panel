import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteStudent, listStudents } from "./student-api.js";

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

  it("sends delete requests with CSRF token", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await deleteStudent("student-id", "csrf-token");

    expect(fetchMock).toHaveBeenCalledWith("/api/students/student-id", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRF-Token": "csrf-token",
      },
      body: undefined,
      signal: undefined,
    });
  });
});
