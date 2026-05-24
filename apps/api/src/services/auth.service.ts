import { createHash, randomBytes } from "node:crypto";

import { parseEnv, type Env } from "../config/env.js";
import { AuthenticationRequiredError, InvalidCredentialsError } from "../errors/index.js";
import { verifyPassword } from "../lib/argon2.js";
import { createCsrfToken } from "../lib/csrf.js";
import {
  AdminUserRepository,
  toAdminSummary,
  type AdminSummary,
} from "../repositories/admin-user.repository.js";
import { SessionRepository, type AuthenticatedSession } from "../repositories/session.repository.js";
import type { LoginInput } from "../schemas/auth.schema.js";

export type AuthSession = {
  id: string;
  tokenHash: string;
  admin: AdminSummary;
};

export type LoginResult = {
  admin: AdminSummary;
  sessionToken: string;
  expiresAt: Date;
};

export class AuthService {
  constructor(
    private readonly adminUsers = new AdminUserRepository(),
    private readonly sessions = new SessionRepository(),
    private readonly env: Env = parseEnv(process.env),
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const admin = await this.adminUsers.findByEmail(input.email);

    if (!admin?.isActive) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await verifyPassword(admin.passwordHash, input.password);

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = sessionExpiry(this.env.sessionTtlHours);

    await this.sessions.create({
      adminUserId: admin.id,
      tokenHash,
      expiresAt,
    });

    return {
      admin: toAdminSummary(admin),
      sessionToken,
      expiresAt,
    };
  }

  async authenticate(sessionToken: string | undefined): Promise<AuthSession> {
    if (!sessionToken) {
      throw new AuthenticationRequiredError();
    }

    const tokenHash = hashSessionToken(sessionToken);
    const session = await this.sessions.findActiveByTokenHash(tokenHash);

    if (!session?.adminUser.isActive) {
      throw new AuthenticationRequiredError();
    }

    return sessionToAuthSession(session);
  }

  async logout(sessionToken: string | undefined): Promise<void> {
    if (!sessionToken) {
      return;
    }

    await this.sessions.revokeByTokenHash(hashSessionToken(sessionToken));
  }

  csrfTokenFor(session: AuthSession): string {
    return createCsrfToken(session.tokenHash, this.env.csrfSecret);
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(sessionToken: string): string {
  return createHash("sha256").update(sessionToken).digest("hex");
}

function sessionExpiry(ttlHours: number): Date {
  return new Date(Date.now() + ttlHours * 60 * 60 * 1000);
}

function sessionToAuthSession(session: AuthenticatedSession): AuthSession {
  return {
    id: session.id,
    tokenHash: session.tokenHash,
    admin: toAdminSummary(session.adminUser),
  };
}
