import { describe, expect, it } from "vitest";

import { createAdmin, AdminAlreadyExistsError } from "../../src/admin/create-admin.js";
import { verifyPassword } from "../../src/lib/argon2.js";
import { testPrisma } from "../setup.js";

describe("createAdmin", () => {
  it("normalizes admin email and stores an Argon2 password hash", async () => {
    const admin = await createAdmin(
      {
        name: "Breno Admin",
        email: "  BRENO.ADMIN@Example.COM ",
        password: "local-admin-password",
      },
      testPrisma,
    );

    expect(admin.email).toBe("breno.admin@example.com");
    expect(admin.passwordHash).not.toBe("local-admin-password");
    expect(admin.passwordHash).toContain("$argon2id$");
    await expect(verifyPassword(admin.passwordHash, "local-admin-password")).resolves.toBe(true);
  });

  it("does not silently overwrite an existing admin password", async () => {
    const existingAdmin = await createAdmin(
      {
        name: "Existing Admin",
        email: "admin@example.com",
        password: "first-password",
      },
      testPrisma,
    );

    await expect(
      createAdmin(
        {
          name: "Existing Admin",
          email: "ADMIN@example.com",
          password: "second-password",
        },
        testPrisma,
      ),
    ).rejects.toBeInstanceOf(AdminAlreadyExistsError);

    const storedAdmin = await testPrisma.adminUser.findUniqueOrThrow({
      where: {
        email: "admin@example.com",
      },
    });

    expect(storedAdmin.id).toBe(existingAdmin.id);
    await expect(verifyPassword(storedAdmin.passwordHash, "first-password")).resolves.toBe(true);
    await expect(verifyPassword(storedAdmin.passwordHash, "second-password")).resolves.toBe(false);
  });
});
