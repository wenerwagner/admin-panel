import type { AdminUser } from "@prisma/client";

import { testPrisma } from "../setup.js";

let adminSequence = 0;

export type AdminFactoryInput = Partial<{
  name: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}>;

export async function createAdmin(overrides: AdminFactoryInput = {}): Promise<AdminUser> {
  adminSequence += 1;

  return testPrisma.adminUser.create({
    data: {
      name: overrides.name ?? `Test Admin ${adminSequence}`,
      email: overrides.email ?? `admin${adminSequence}@example.com`,
      passwordHash: overrides.passwordHash ?? "hashed-test-password",
      isActive: overrides.isActive ?? true,
    },
  });
}
