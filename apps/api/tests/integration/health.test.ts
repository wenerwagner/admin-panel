import request from "supertest";
import { describe, it } from "vitest";

import { createApp } from "../../src/app.js";

describe("GET /api/health", () => {
  it("returns 200 through the Express app", async () => {
    const app = createApp();

    await request(app).get("/api/health").expect(200, { status: "ok" });
  });
});
