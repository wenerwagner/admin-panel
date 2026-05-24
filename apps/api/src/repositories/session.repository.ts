import type { PrismaClient, Session } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import type { AdminSummary } from "./admin-user.repository.js";

export type AuthenticatedSession = Pick<Session, "id" | "tokenHash" | "expiresAt" | "revokedAt"> & {
  adminUser: AdminSummary & { isActive: boolean };
};

export class SessionRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  create({
    adminUserId,
    tokenHash,
    expiresAt,
  }: {
    adminUserId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<Session> {
    return this.client.session.create({
      data: {
        adminUserId,
        tokenHash,
        expiresAt,
      },
    });
  }

  findActiveByTokenHash(tokenHash: string, now = new Date()): Promise<AuthenticatedSession | null> {
    return this.client.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      select: {
        id: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });
  }

  async revokeByTokenHash(tokenHash: string, now = new Date()): Promise<void> {
    await this.client.session.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });
  }
}
