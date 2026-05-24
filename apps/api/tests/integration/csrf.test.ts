import request from "supertest";
import { describe, expect, it } from "vitest";

import { createAdmin } from "../../src/admin/create-admin.js";
import { createApp } from "../../src/app.js";
import { errorCodes } from "../../src/errors/error-codes.js";
import { testPrisma } from "../setup.js";

const app = createApp();

function sessionCookieFrom(response: request.Response): string {
  const setCookie = response.header["set-cookie"];
  const firstCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;

  if (!firstCookie) {
    throw new Error("Expected Set-Cookie header");
  }

  return firstCookie.split(";")[0] ?? firstCookie;
}

async function signIn() {
  await createAdmin(
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

  return sessionCookieFrom(response);
}

async function csrfTokenFor(sessionCookie: string): Promise<string> {
  const response = await request(app).get("/api/auth/me").set("Cookie", sessionCookie).expect(200);
  return response.body.csrfToken as string;
}

describe("CSRF protection", () => {
  it("rejects authenticated logout requests without a CSRF token", async () => {
    const sessionCookie = await signIn();

    const response = await request(app).post("/api/auth/logout").set("Cookie", sessionCookie).expect(403);

    expect(response.body).toEqual({
      error: {
        code: errorCodes.forbidden,
        message: "Invalid CSRF token",
      },
    });
  });

  it("allows authenticated logout requests with a valid CSRF token", async () => {
    const sessionCookie = await signIn();
    const csrfToken = await csrfTokenFor(sessionCookie);

    await request(app)
      .post("/api/auth/logout")
      .set("Cookie", sessionCookie)
      .set("X-CSRF-Token", csrfToken)
      .expect(204);
  });
});
