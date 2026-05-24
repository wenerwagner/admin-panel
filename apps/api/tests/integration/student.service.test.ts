import { describe, expect, it } from "vitest";

import { ConflictError, NotFoundError } from "../../src/errors/index.js";
import { StudentRepository } from "../../src/repositories/student.repository.js";
import { StudentService } from "../../src/services/student.service.js";
import { createStudent } from "../factories/student.factory.js";
import { testPrisma } from "../setup.js";

const service = new StudentService(new StudentRepository(testPrisma));

describe("StudentService", () => {
  it("lists active students and excludes soft-deleted students", async () => {
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
      deletedAt: new Date(),
    });

    const result = await service.list({
      page: 1,
      pageSize: 20,
    });

    expect(result).toMatchObject({
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
    expect(result.data).toEqual([
      expect.objectContaining({
        id: active.id,
        name: "Ana Silva",
        email: "a***@example.com",
        cpf: "***.982.247-**",
        phone: "(**) *****-8888",
        subscribedPlan: "premium",
        status: "paused",
      }),
    ]);
  });

  it("throws NOT_FOUND when a deleted student detail is requested", async () => {
    const deleted = await createStudent({
      deletedAt: new Date(),
    });

    await expect(service.detail(deleted.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns full formatted PII for active student detail", async () => {
    const student = await createStudent({
      email: "ana@example.com",
      cpf: "52998224725",
      phone: "+5581999998888",
      subscribedPlan: "BASIC",
      status: "ACTIVE",
    });

    await expect(service.detail(student.id)).resolves.toEqual(
      expect.objectContaining({
        id: student.id,
        email: "ana@example.com",
        cpf: "529.982.247-25",
        phone: "+55 81 99999 8888",
        subscribedPlan: "basic",
        status: "active",
      }),
    );
  });

  it("throws CONFLICT when creating a duplicate active email or CPF", async () => {
    await createStudent({
      email: "duplicate@example.com",
      cpf: "52998224725",
    });

    await expect(
      service.create({
        name: "Duplicate Email",
        email: "duplicate@example.com",
        cpf: "11144477735",
        phone: "+5581988887777",
        subscribedPlan: "basic",
        status: "active",
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    await expect(
      service.create({
        name: "Duplicate CPF",
        email: "new@example.com",
        cpf: "52998224725",
        phone: "+5581988886666",
        subscribedPlan: "basic",
        status: "active",
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("throws CONFLICT when updating to a duplicate active email or CPF", async () => {
    const existing = await createStudent({
      email: "existing@example.com",
      cpf: "52998224725",
    });
    const student = await createStudent({
      email: "student@example.com",
      cpf: "11144477735",
    });

    await expect(
      service.update(student.id, {
        email: existing.email,
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    await expect(
      service.update(student.id, {
        cpf: existing.cpf,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("allows creating with an email or CPF used only by a soft-deleted student", async () => {
    await createStudent({
      email: "deleted@example.com",
      cpf: "52998224725",
      deletedAt: new Date(),
    });

    await expect(
      service.create({
        name: "Replacement Student",
        email: "deleted@example.com",
        cpf: "52998224725",
        phone: "+5581988887777",
        subscribedPlan: "premium",
        status: "paused",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        email: "deleted@example.com",
        cpf: "529.982.247-25",
        phone: "+55 81 98888 7777",
        subscribedPlan: "premium",
        status: "paused",
      }),
    );
  });

  it("soft deletes an active student and excludes it from follow-up reads", async () => {
    const student = await createStudent();

    await service.softDelete(student.id);

    await expect(service.detail(student.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(testPrisma.student.findUniqueOrThrow({ where: { id: student.id } })).resolves.toMatchObject({
      deletedAt: expect.any(Date),
    });
  });
});
