import request from "supertest";
import { describe, expect, it } from "vitest";

import { createAdmin } from "../../src/admin/create-admin.js";
import { createApp } from "../../src/app.js";
import { errorCodes } from "../../src/errors/error-codes.js";
import { testPrisma } from "../setup.js";

const app = createApp();

describe("login rate limiting", () => {
  it("returns RATE_LIMITED after repeated invalid login attempts", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app)
        .post("/api/auth/login")
        .send({
          email: "missing@example.com",
          password: "wrong-password",
        })
        .expect(401);
    }

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "missing@example.com",
        password: "wrong-password",
      })
      .expect(429);

    expect(response.body).toEqual({
      error: {
        code: errorCodes.rateLimited,
        message: "Too many requests",
      },
    });
  });

  it("allows login credential validation without a CSRF token", async () => {
    const admin = await createAdmin(
      {
        name: "Breno Admin",
        email: "admin@example.com",
        password: "correct-password",
      },
      testPrisma,
    );

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "correct-password",
      })
      .expect(200);

    expect(response.body).toEqual({
      admin: {
        id: admin.id,
        name: "Breno Admin",
        email: "admin@example.com",
      },
    });
  });
});
