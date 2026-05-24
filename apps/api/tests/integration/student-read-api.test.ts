import request from "supertest";
import { describe, expect, it } from "vitest";

import { createAdmin } from "../../src/admin/create-admin.js";
import { createApp } from "../../src/app.js";
import { errorCodes } from "../../src/errors/error-codes.js";
import { createStudent } from "../factories/student.factory.js";
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

async function signIn(): Promise<string> {
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

describe("student read API", () => {
  it("requires authentication for student list and detail", async () => {
    const student = await createStudent();

    for (const path of ["/api/students", `/api/students/${student.id}`]) {
      const response = await request(app).get(path).expect(401);

      expect(response.body).toEqual({
        error: {
          code: errorCodes.authenticationRequired,
          message: "Authentication required",
        },
      });
    }
  });

  it("lists only non-deleted students with masked PII", async () => {
    const sessionCookie = await signIn();
    const active = await createStudent({
      name: "Ana Silva",
      email: "ana@example.com",
      cpf: "52998224725",
      phone: "+5581999998888",
      subscribedPlan: "PREMIUM",
      status: "PAUSED",
    });
    await createStudent({
      name: "Deleted Student",
      email: "deleted@example.com",
      cpf: "11144477735",
      phone: "+5581988887777",
      deletedAt: new Date(),
    });

    const response = await request(app).get("/api/students").set("Cookie", sessionCookie).expect(200);

    expect(response.body).toEqual({
      data: [
        expect.objectContaining({
          id: active.id,
          name: "Ana Silva",
          email: "a***@example.com",
          cpf: "***.982.247-**",
          phone: "(**) *****-8888",
          subscribedPlan: "premium",
          status: "paused",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it("returns full formatted PII for student detail", async () => {
    const sessionCookie = await signIn();
    const student = await createStudent({
      name: "Ana Silva",
      email: "ana@example.com",
      cpf: "52998224725",
      phone: "+5581999998888",
      subscribedPlan: "BASIC",
      status: "ACTIVE",
    });

    const response = await request(app).get(`/api/students/${student.id}`).set("Cookie", sessionCookie).expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: student.id,
        name: "Ana Silva",
        email: "ana@example.com",
        cpf: "529.982.247-25",
        phone: "+55 81 99999 8888",
        subscribedPlan: "basic",
        status: "active",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it("returns validation errors for invalid list pagination", async () => {
    const sessionCookie = await signIn();

    const response = await request(app)
      .get("/api/students?page=0&pageSize=101")
      .set("Cookie", sessionCookie)
      .expect(400);

    expect(response.body).toEqual({
      error: {
        code: errorCodes.validation,
        message: "Request validation failed",
        details: [
          {
            field: "page",
            message: "Invalid value",
          },
          {
            field: "pageSize",
            message: "Invalid value",
          },
        ],
      },
    });
  });

  it("searches students by name, email, CPF digits, and phone digits", async () => {
    const sessionCookie = await signIn();
    const ana = await createStudent({
      name: "Ana Silva",
      email: "ana@example.com",
      cpf: "52998224725",
      phone: "+5581999998888",
    });
    const bruno = await createStudent({
      name: "Bruno Souza",
      email: "bruno@example.com",
      cpf: "11144477735",
      phone: "+5581988887777",
    });

    for (const [query, expectedId] of [
      ["silva", ana.id],
      ["BRUNO@example.com", bruno.id],
      ["982.247", ana.id],
      ["8888-7777", bruno.id],
    ]) {
      const response = await request(app)
        .get("/api/students")
        .query({ q: query })
        .set("Cookie", sessionCookie)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(expectedId);
    }
  });

  it("returns not found for deleted student detail", async () => {
    const sessionCookie = await signIn();
    const student = await createStudent({
      deletedAt: new Date(),
    });

    const response = await request(app).get(`/api/students/${student.id}`).set("Cookie", sessionCookie).expect(404);

    expect(response.body).toEqual({
      error: {
        code: errorCodes.notFound,
        message: "Student not found",
      },
    });
  });
});
