import type { Prisma, PrismaClient, Student } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { digitsOnly } from "../utils/cpf.js";

export type StudentListFilters = {
  q?: string;
  status?: Prisma.StudentWhereInput["status"];
  subscribedPlan?: Prisma.StudentWhereInput["subscribedPlan"];
  page: number;
  pageSize: number;
};

export type CreateStudentData = Pick<Student, "name" | "email" | "cpf" | "phone" | "subscribedPlan" | "status">;

export type UpdateStudentData = Partial<CreateStudentData>;

export type StudentListResult = {
  students: Student[];
  total: number;
};

export class StudentRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async list(filters: StudentListFilters): Promise<StudentListResult> {
    const where = activeStudentWhere(filters);

    const [students, total] = await this.client.$transaction([
      this.client.student.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.client.student.count({
        where,
      }),
    ]);

    return { students, total };
  }

  findActiveById(id: string): Promise<Student | null> {
    return this.client.student.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  create(data: CreateStudentData): Promise<Student> {
    return this.client.student.create({
      data,
    });
  }

  async updateActive(id: string, data: UpdateStudentData): Promise<Student | null> {
    const result = await this.client.student.updateManyAndReturn({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });

    return result[0] ?? null;
  }

  async softDeleteActive(id: string, deletedAt = new Date()): Promise<Student | null> {
    const result = await this.client.student.updateManyAndReturn({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt,
      },
    });

    return result[0] ?? null;
  }
}

function activeStudentWhere(filters: StudentListFilters): Prisma.StudentWhereInput {
  const searchDigits = filters.q ? digitsOnly(filters.q) : undefined;

  return {
    deletedAt: null,
    status: filters.status,
    subscribedPlan: filters.subscribedPlan,
    OR: filters.q
      ? [
          {
            name: {
              contains: filters.q,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: filters.q,
              mode: "insensitive",
            },
          },
          ...(searchDigits
            ? [
                {
                  cpf: {
                    contains: searchDigits,
                  },
                },
                {
                  phone: {
                    contains: searchDigits,
                  },
                },
              ]
            : []),
        ]
      : undefined,
  };
}
