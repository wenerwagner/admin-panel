import type { Student } from "@prisma/client";

import { testPrisma } from "../setup.js";

let studentSequence = 0;

export type StudentFactoryInput = Partial<{
  name: string;
  email: string;
  cpf: string;
  phone: string;
  subscribedPlan: "BASIC" | "PREMIUM";
  status: "ACTIVE" | "PAUSED" | "CANCELED";
  deletedAt: Date | null;
}>;

export async function createStudent(overrides: StudentFactoryInput = {}): Promise<Student> {
  studentSequence += 1;

  return testPrisma.student.create({
    data: {
      name: overrides.name ?? `Test Student ${studentSequence}`,
      email: overrides.email ?? `student${studentSequence}@example.com`,
      cpf: overrides.cpf ?? uniqueCpf(studentSequence),
      phone: overrides.phone ?? `+558199999${studentSequence.toString().padStart(4, "0")}`,
      subscribedPlan: overrides.subscribedPlan ?? "BASIC",
      status: overrides.status ?? "ACTIVE",
      deletedAt: overrides.deletedAt,
    },
  });
}

function uniqueCpf(sequence: number) {
  return `000000${sequence.toString().padStart(5, "0")}`.slice(-11);
}
