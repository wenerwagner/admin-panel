import type { AdminUser, PrismaClient } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

export type AdminSummary = Pick<AdminUser, "id" | "name" | "email">;

export type AdminWithPassword = Pick<
  AdminUser,
  "id" | "name" | "email" | "passwordHash" | "isActive"
>;

export class AdminUserRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  findByEmail(email: string): Promise<AdminWithPassword | null> {
    return this.client.adminUser.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    });
  }
}

export function toAdminSummary(admin: AdminSummary): AdminSummary {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
}
