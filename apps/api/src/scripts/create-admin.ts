import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { config as loadEnv } from "dotenv";
import { ZodError } from "zod";

const localDatabaseUrl = "postgres://admin_panel:admin_panel_password@localhost:5432/admin_panel";

function configureEnvironment() {
  const rootEnvPath = resolve(import.meta.dirname, "../../../..", ".env");

  if (existsSync(rootEnvPath)) {
    loadEnv({ path: rootEnvPath });
  }

  process.env.DATABASE_URL ??= localDatabaseUrl;
}

function parseCreateAdminArgs() {
  const { values } = parseArgs({
    options: {
      email: {
        type: "string",
      },
      name: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
  });

  return {
    email: values.email ?? process.env.ADMIN_EMAIL,
    name: values.name ?? process.env.ADMIN_NAME ?? "Local Admin",
    password: values.password ?? process.env.ADMIN_PASSWORD,
  };
}

function printUsage() {
  console.error(
    'Usage: npm run admin:create --workspace apps/api -- --email admin@example.com --password <password> [--name "Admin Name"]',
  );
  console.error("Alternatively set ADMIN_EMAIL, ADMIN_PASSWORD, and optionally ADMIN_NAME.");
}

async function main() {
  configureEnvironment();

  const { AdminAlreadyExistsError, createAdmin } = await import("../admin/create-admin.js");
  const { prisma } = await import("../lib/prisma.js");

  try {
    const admin = await createAdmin(parseCreateAdminArgs(), prisma);
    console.log(`Admin user created: ${admin.email}`);
  } catch (error) {
    if (error instanceof AdminAlreadyExistsError) {
      console.error(`Admin user already exists: ${error.email}`);
      process.exitCode = 2;
      return;
    }

    if (error instanceof ZodError) {
      printUsage();
      console.error(
        error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"),
      );
      process.exitCode = 1;
      return;
    }

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

await main();
