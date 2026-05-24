import { describe, expect, it } from "vitest";

import {
  createStudentSchema,
  studentListQuerySchema,
  studentStatusToPrisma,
  subscribedPlanToPrisma,
  updateStudentSchema,
} from "../../src/schemas/student.schema.js";

describe("student schemas", () => {
  it("normalizes create input for storage", () => {
    expect(
      createStudentSchema.parse({
        name: " Ana Silva ",
        email: " ANA@Example.COM ",
        cpf: "529.982.247-25",
        phone: "(81) 99999-8888",
        subscribedPlan: "basic",
        status: "active",
      }),
    ).toEqual({
      name: "Ana Silva",
      email: "ana@example.com",
      cpf: "52998224725",
      phone: "+5581999998888",
      subscribedPlan: "basic",
      status: "active",
    });
  });

  it("rejects invalid sensitive fields", () => {
    const result = createStudentSchema.safeParse({
      name: "Ana Silva",
      email: "not-an-email",
      cpf: "000.000.000-00",
      phone: "123",
      subscribedPlan: "basic",
      status: "active",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(["email", "cpf", "phone"]);
  });

  it("rejects empty required fields and invalid enum values", () => {
    const result = createStudentSchema.safeParse({
      name: " ",
      email: "ana@example.com",
      cpf: "52998224725",
      phone: "+5581999998888",
      subscribedPlan: "enterprise",
      status: "archived",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(["name", "subscribedPlan", "status"]);
  });

  it("normalizes partial update input and rejects explicit empty values", () => {
    expect(
      updateStudentSchema.parse({
        email: " ANA@Example.COM ",
        phone: "+55 81 99999-8888",
      }),
    ).toEqual({
      email: "ana@example.com",
      phone: "+5581999998888",
    });

    expect(
      updateStudentSchema.safeParse({
        name: "",
      }).success,
    ).toBe(false);
  });

  it("normalizes list query pagination and optional filters", () => {
    expect(
      studentListQuerySchema.parse({
        q: " Ana ",
        status: "paused",
        subscribedPlan: "premium",
        page: "2",
        pageSize: "50",
      }),
    ).toEqual({
      q: "Ana",
      status: "paused",
      subscribedPlan: "premium",
      page: 2,
      pageSize: 50,
    });

    expect(studentListQuerySchema.parse({})).toEqual({
      q: undefined,
      page: 1,
      pageSize: 20,
    });
  });

  it("maps API enum values to Prisma enum values", () => {
    expect(subscribedPlanToPrisma).toEqual({
      basic: "BASIC",
      premium: "PREMIUM",
    });
    expect(studentStatusToPrisma).toEqual({
      active: "ACTIVE",
      paused: "PAUSED",
      canceled: "CANCELED",
    });
  });
});
