import request from "supertest";
import { describe, expect, it } from "vitest";

import { createAdmin } from "../../src/admin/create-admin.js";
import { createApp } from "../../src/app.js";
import { errorCodes } from "../../src/errors/error-codes.js";
import { createStudent } from "../factories/student.factory.js";
import { testPrisma } from "../setup.js";

const app = createApp();

const validStudentPayload = {
  name: " Ana Silva ",
  email: " ANA@Example.COM ",
  cpf: "529.982.247-25",
  phone: "(81) 99999-8888",
  subscribedPlan: "basic",
  status: "active",
};

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

async function csrfTokenFor(sessionCookie: string): Promise<string> {
  const response = await request(app).get("/api/auth/me").set("Cookie", sessionCookie).expect(200);
  return response.body.csrfToken as string;
}

async function authenticatedContext(): Promise<{ sessionCookie: string; csrfToken: string }> {
  const sessionCookie = await signIn();
  const csrfToken = await csrfTokenFor(sessionCookie);

  return { sessionCookie, csrfToken };
}

describe("student write API", () => {
  it("rejects create, update, and delete without a CSRF token", async () => {
    const sessionCookie = await signIn();
    const student = await createStudent();

    for (const requestBuilder of [
      request(app).post("/api/students").send(validStudentPayload),
      request(app).patch(`/api/students/${student.id}`).send({ name: "Ana Updated" }),
      request(app).delete(`/api/students/${student.id}`),
    ]) {
      const response = await requestBuilder.set("Cookie", sessionCookie).expect(403);

      expect(response.body).toEqual({
        error: {
          code: errorCodes.forbidden,
          message: "Invalid CSRF token",
        },
      });
    }
  });

  it("creates a student and returns full formatted PII", async () => {
    const { sessionCookie, csrfToken } = await authenticatedContext();

    const response = await request(app)
      .post("/api/students")
      .set("Cookie", sessionCookie)
      .set("X-CSRF-Token", csrfToken)
      .send(validStudentPayload)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
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

    const storedStudent = await testPrisma.student.findUniqueOrThrow({
      where: {
        id: response.body.id as string,
      },
    });
    expect(storedStudent).toEqual(
      expect.objectContaining({
        name: "Ana Silva",
        email: "ana@example.com",
        cpf: "52998224725",
        phone: "+5581999998888",
        subscribedPlan: "BASIC",
        status: "ACTIVE",
        deletedAt: null,
      }),
    );
  });

  it("updates a student and returns full formatted PII", async () => {
    const { sessionCookie, csrfToken } = await authenticatedContext();
    const student = await createStudent({
      name: "Ana Silva",
      email: "ana@example.com",
      cpf: "52998224725",
      phone: "+5581999998888",
      subscribedPlan: "BASIC",
      status: "ACTIVE",
    });

    const response = await request(app)
      .patch(`/api/students/${student.id}`)
      .set("Cookie", sessionCookie)
      .set("X-CSRF-Token", csrfToken)
      .send({
        email: " ANA.UPDATED@Example.COM ",
        phone: "+55 81 98888-7777",
        subscribedPlan: "premium",
        status: "paused",
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: student.id,
        name: "Ana Silva",
        email: "ana.updated@example.com",
        cpf: "529.982.247-25",
        phone: "+55 81 98888 7777",
        subscribedPlan: "premium",
        status: "paused",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it("returns validation errors for invalid create and update payloads", async () => {
    const { sessionCookie, csrfToken } = await authenticatedContext();
    const student = await createStudent();

    const createResponse = await request(app)
      .post("/api/students")
      .set("Cookie", sessionCookie)
      .set("X-CSRF-Token", csrfToken)
      .send({
        ...validStudentPayload,
        email: "not-an-email",
        cpf: "000.000.000-00",
        phone: "123",
      })
      .expect(400);

    expect(createResponse.body).toEqual({
      error: {
        code: errorCodes.validation,
        message: "Request validation failed",
        details: [
          { field: "email", message: "Invalid email" },
          { field: "cpf", message: "Invalid CPF" },
          { field: "phone", message: "Invalid phone" },
        ],
      },
    });

    const updateResponse = await request(app)
      .patch(`/api/students/${student.id}`)
      .set("Cookie", sessionCookie)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "",
        email: null,
      })
      .expect(400);

    expect(updateResponse.body).toEqual({
      error: {
        code: errorCodes.validation,
        message: "Request validation failed",
        details: [
          { field: "name", message: "Required" },
          { field: "email", message: "Invalid value" },
        ],
      },
    });
  });

  it("returns conflict for duplicate active email or CPF on create and update", async () => {
    const { sessionCookie, csrfToken } = await authenticatedContext();
    const existing = await createStudent({
      email: "existing@example.com",
      cpf: "52998224725",
    });
    const other = await createStudent({
      email: "other@example.com",
      cpf: "11144477735",
    });

    for (const response of [
      await request(app)
        .post("/api/students")
        .set("Cookie", sessionCookie)
        .set("X-CSRF-Token", csrfToken)
        .send({
          ...validStudentPayload,
          email: "existing@example.com",
          cpf: "111.444.777-35",
        }),
      await request(app)
        .patch(`/api/students/${other.id}`)
        .set("Cookie", sessionCookie)
        .set("X-CSRF-Token", csrfToken)
        .send({
          cpf: "529.982.247-25",
        }),
    ]) {
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: {
          code: errorCodes.conflict,
          message: "Student email or CPF already exists",
        },
      });
    }

    expect(existing.deletedAt).toBeNull();
  });

  it("soft-deletes a student and excludes it from list and detail", async () => {
    const { sessionCookie, csrfToken } = await authenticatedContext();
    const student = await createStudent({
      email: "deleted@example.com",
      cpf: "52998224725",
    });

    await request(app)
      .delete(`/api/students/${student.id}`)
      .set("Cookie", sessionCookie)
      .set("X-CSRF-Token", csrfToken)
      .expect(204);

    await expect(testPrisma.student.findUniqueOrThrow({ where: { id: student.id } })).resolves.toEqual(
      expect.objectContaining({
        deletedAt: expect.any(Date),
      }),
    );

    const listResponse = await request(app).get("/api/students").set("Cookie", sessionCookie).expect(200);
    expect(listResponse.body.data).toEqual([]);

    await request(app).get(`/api/students/${student.id}`).set("Cookie", sessionCookie).expect(404);
  });

  it("returns not found when updating a deleted student", async () => {
    const { sessionCookie, csrfToken } = await authenticatedContext();
    const student = await createStudent({
      deletedAt: new Date(),
    });

    const response = await request(app)
      .patch(`/api/students/${student.id}`)
      .set("Cookie", sessionCookie)
      .set("X-CSRF-Token", csrfToken)
      .send({ name: "Updated Name" })
      .expect(404);

    expect(response.body).toEqual({
      error: {
        code: errorCodes.notFound,
        message: "Student not found",
      },
    });
  });
});
