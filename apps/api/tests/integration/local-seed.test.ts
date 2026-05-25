import { afterEach, describe, expect, it } from "vitest";

import { verifyPassword } from "../../src/lib/argon2.js";
import { seedLocalData } from "../../src/scripts/seed-local.js";
import { testPrisma } from "../setup.js";

const originalAdminEnv = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_NAME: process.env.ADMIN_NAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};

afterEach(() => {
  restoreEnv("ADMIN_EMAIL", originalAdminEnv.ADMIN_EMAIL);
  restoreEnv("ADMIN_NAME", originalAdminEnv.ADMIN_NAME);
  restoreEnv("ADMIN_PASSWORD", originalAdminEnv.ADMIN_PASSWORD);
});

describe("seedLocalData", () => {
  it("creates the local admin and demo students idempotently", async () => {
    process.env.ADMIN_EMAIL = "seed-admin@example.com";
    process.env.ADMIN_NAME = "Seed Admin";
    process.env.ADMIN_PASSWORD = "seed-admin-password";

    const firstResult = await seedLocalData(testPrisma);
    const secondResult = await seedLocalData(testPrisma);

    expect(firstResult).toEqual({
      adminEmail: "seed-admin@example.com",
      createdAdmin: true,
      createdStudents: 15,
      skippedStudents: 0,
    });
    expect(secondResult).toEqual({
      adminEmail: "seed-admin@example.com",
      createdAdmin: false,
      createdStudents: 0,
      skippedStudents: 15,
    });

    const admin = await testPrisma.adminUser.findUniqueOrThrow({
      where: {
        email: "seed-admin@example.com",
      },
    });
    const students = await testPrisma.student.findMany({
      where: {
        deletedAt: null,
      },
    });

    expect(admin.name).toBe("Seed Admin");
    await expect(verifyPassword(admin.passwordHash, "seed-admin-password")).resolves.toBe(true);
    expect(students).toHaveLength(15);
  });
});

function restoreEnv(name: "ADMIN_EMAIL" | "ADMIN_NAME" | "ADMIN_PASSWORD", value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
