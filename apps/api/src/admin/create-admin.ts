import { Prisma, type AdminUser, type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { hashPassword } from "../lib/argon2.js";
import { prisma } from "../lib/prisma.js";

const createAdminSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type CreateAdminInput = Partial<z.input<typeof createAdminSchema>>;

export class AdminAlreadyExistsError extends Error {
  constructor(readonly email: string) {
    super(`Admin user already exists for email: ${email}`);
    this.name = "AdminAlreadyExistsError";
  }
}

export async function createAdmin(
  input: CreateAdminInput,
  client: PrismaClient = prisma,
): Promise<AdminUser> {
  const parsed = createAdminSchema.parse(input);
  const existingAdmin = await client.adminUser.findUnique({
    where: {
      email: parsed.email,
    },
    select: {
      id: true,
    },
  });

  if (existingAdmin) {
    throw new AdminAlreadyExistsError(parsed.email);
  }

  const passwordHash = await hashPassword(parsed.password);

  try {
    return await client.adminUser.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash,
        isActive: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AdminAlreadyExistsError(parsed.email);
    }

    throw error;
  }
}
