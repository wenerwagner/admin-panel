import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const rootEnvPath = resolve(import.meta.dirname, "../..", ".env");
const localDatabaseUrl = "postgres://admin_panel:admin_panel_password@localhost:5432/admin_panel";

if (existsSync(rootEnvPath)) {
  loadEnv({ path: rootEnvPath });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? localDatabaseUrl,
  },
});
