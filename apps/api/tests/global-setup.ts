import { execFileSync } from "node:child_process";

import { configureTestEnv, getTestDatabaseSchema } from "./test-env.js";

export default async function globalSetup() {
  configureTestEnv();

  const { prisma } = await import("../src/lib/prisma.js");

  const schema = getTestDatabaseSchema().replaceAll('"', '""');

  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

  execFileSync("npx", ["prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"], {
    cwd: import.meta.dirname.replace(/\/tests$/, ""),
    env: process.env,
    stdio: "inherit",
  });

  await prisma.$disconnect();
}
