import { afterAll, beforeAll, beforeEach } from "vitest";

import { configureTestEnv } from "./test-env.js";

configureTestEnv();

const { prisma } = await import("../src/lib/prisma.js");

export const testPrisma = prisma;

export async function resetDatabase() {
  await testPrisma.session.deleteMany();
  await testPrisma.student.deleteMany();
  await testPrisma.adminUser.deleteMany();
}

beforeAll(async () => {
  await testPrisma.$connect();
});

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});
