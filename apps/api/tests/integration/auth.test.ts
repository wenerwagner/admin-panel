import request from "supertest";
import { describe, expect, it } from "vitest";

import { createAdmin } from "../../src/admin/create-admin.js";
import { createApp } from "../../src/app.js";
import { errorCodes } from "../../src/errors/error-codes.js";
import { hashSessionToken } from "../../src/services/auth.service.js";
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

function sessionTokenFromCookie(cookie: string): string {
  const token = cookie.split("=")[1];

  if (!token) {
    throw new Error("Expected session cookie token");
  }

  return decodeURIComponent(token);
}

describe("auth endpoints", () => {
  it("sets an HTTP-only session cookie and returns the admin summary for valid credentials", async () => {
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
        email: "  ADMIN@example.com ",
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

    const setCookie = response.header["set-cookie"] as string[] | undefined;
    expect(setCookie?.[0]).toContain("admin_session=");
    expect(setCookie?.[0]).toContain("HttpOnly");
    expect(setCookie?.[0]).toContain("SameSite=Lax");
    expect(setCookie?.[0]).toContain("Path=/");
    expect(setCookie?.[0]).toContain("Max-Age=");

    const sessionCookie = sessionCookieFrom(response);
    const rawToken = sessionTokenFromCookie(sessionCookie);
    const storedSession = await testPrisma.session.findFirstOrThrow({
      where: {
        adminUserId: admin.id,
      },
    });

    expect(storedSession.tokenHash).toBe(hashSessionToken(rawToken));
    expect(storedSession.tokenHash).not.toBe(rawToken);
    expect(storedSession.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("returns generic invalid credentials for an unknown email or wrong password", async () => {
    await createAdmin(
      {
        name: "Breno Admin",
        email: "admin@example.com",
        password: "correct-password",
      },
      testPrisma,
    );

    for (const credentials of [
      { email: "missing@example.com", password: "correct-password" },
      { email: "admin@example.com", password: "wrong-password" },
    ]) {
      const response = await request(app).post("/api/auth/login").send(credentials).expect(401);

      expect(response.body).toEqual({
        error: {
          code: errorCodes.invalidCredentials,
          message: "Invalid email or password",
        },
      });
    }

    await expect(testPrisma.session.count()).resolves.toBe(0);
  });

  it("rejects inactive admins", async () => {
    const admin = await createAdmin(
      {
        name: "Inactive Admin",
        email: "inactive@example.com",
        password: "correct-password",
      },
      testPrisma,
    );
    await testPrisma.adminUser.update({
      where: {
        id: admin.id,
      },
      data: {
        isActive: false,
      },
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "inactive@example.com",
        password: "correct-password",
      })
      .expect(401);

    expect(response.body.error.code).toBe(errorCodes.invalidCredentials);
    await expect(testPrisma.session.count()).resolves.toBe(0);
  });

  it("returns the current admin and CSRF token for a valid session", async () => {
    const admin = await createAdmin(
      {
        name: "Breno Admin",
        email: "admin@example.com",
        password: "correct-password",
      },
      testPrisma,
    );
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "correct-password",
      })
      .expect(200);

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", sessionCookieFrom(loginResponse))
      .expect(200);

    expect(response.body).toEqual({
      admin: {
        id: admin.id,
        name: "Breno Admin",
        email: "admin@example.com",
      },
      csrfToken: expect.any(String),
    });
  });

  it("rejects existing sessions after an admin is deactivated", async () => {
    const admin = await createAdmin(
      {
        name: "Breno Admin",
        email: "admin@example.com",
        password: "correct-password",
      },
      testPrisma,
    );
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "correct-password",
      })
      .expect(200);
    const sessionCookie = sessionCookieFrom(loginResponse);

    await testPrisma.adminUser.update({
      where: {
        id: admin.id,
      },
      data: {
        isActive: false,
      },
    });

    const response = await request(app).get("/api/auth/me").set("Cookie", sessionCookie).expect(401);
    expect(response.body.error.code).toBe(errorCodes.authenticationRequired);
  });

  it("requires authentication for the current-admin endpoint", async () => {
    const response = await request(app).get("/api/auth/me").expect(401);

    expect(response.body).toEqual({
      error: {
        code: errorCodes.authenticationRequired,
        message: "Authentication required",
      },
    });
  });

  it("revokes the current session on logout", async () => {
    await createAdmin(
      {
        name: "Breno Admin",
        email: "admin@example.com",
        password: "correct-password",
      },
      testPrisma,
    );
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "correct-password",
      })
      .expect(200);
    const sessionCookie = sessionCookieFrom(loginResponse);
    const meResponse = await request(app).get("/api/auth/me").set("Cookie", sessionCookie).expect(200);

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", sessionCookie)
      .set("X-CSRF-Token", meResponse.body.csrfToken as string)
      .expect(204);

    expect(logoutResponse.header["set-cookie"]?.[0]).toContain("Max-Age=0");
    await expect(
      testPrisma.session.findFirstOrThrow({
        where: {
          tokenHash: hashSessionToken(sessionTokenFromCookie(sessionCookie)),
        },
      }),
    ).resolves.toMatchObject({
      revokedAt: expect.any(Date),
    });

    const response = await request(app).get("/api/auth/me").set("Cookie", sessionCookie).expect(401);
    expect(response.body.error.code).toBe(errorCodes.authenticationRequired);
  });
});
