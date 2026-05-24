import { Prisma, type Student } from "@prisma/client";

import { ConflictError, NotFoundError } from "../errors/index.js";
import {
  StudentRepository,
  type CreateStudentData,
  type UpdateStudentData,
} from "../repositories/student.repository.js";
import {
  studentStatusToPrisma,
  subscribedPlanToPrisma,
  type CreateStudentInput,
  type StudentListQueryInput,
  type StudentStatusInput,
  type SubscribedPlanInput,
  type UpdateStudentInput,
} from "../schemas/student.schema.js";
import { formatSensitiveStudentFields, maskSensitiveStudentFields } from "../utils/mask-pii.js";

type PrismaSubscribedPlan = keyof typeof prismaToSubscribedPlan;
type PrismaStudentStatus = keyof typeof prismaToStudentStatus;

export type StudentDetail = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  subscribedPlan: SubscribedPlanInput;
  status: StudentStatusInput;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentSummary = StudentDetail;

export type StudentList = {
  data: StudentSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const prismaToSubscribedPlan = {
  BASIC: "basic",
  PREMIUM: "premium",
} as const;

const prismaToStudentStatus = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELED: "canceled",
} as const;

export class StudentService {
  constructor(private readonly students = new StudentRepository()) {}

  async list(input: StudentListQueryInput): Promise<StudentList> {
    const result = await this.students.list({
      q: input.q,
      status: input.status ? studentStatusToPrisma[input.status] : undefined,
      subscribedPlan: input.subscribedPlan ? subscribedPlanToPrisma[input.subscribedPlan] : undefined,
      page: input.page,
      pageSize: input.pageSize,
    });

    return {
      data: result.students.map((student) => maskSensitiveStudentFields(studentToDetail(student))),
      page: input.page,
      pageSize: input.pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / input.pageSize),
    };
  }

  async detail(id: string): Promise<StudentDetail> {
    const student = await this.students.findActiveById(id);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    return formatSensitiveStudentFields(studentToDetail(student));
  }

  async create(input: CreateStudentInput): Promise<StudentDetail> {
    try {
      const student = await this.students.create(createInputToData(input));
      return formatSensitiveStudentFields(studentToDetail(student));
    } catch (error) {
      throwConflictForUniqueStudent(error);
      throw error;
    }
  }

  async update(id: string, input: UpdateStudentInput): Promise<StudentDetail> {
    try {
      const student = await this.students.updateActive(id, updateInputToData(input));

      if (!student) {
        throw new NotFoundError("Student not found");
      }

      return formatSensitiveStudentFields(studentToDetail(student));
    } catch (error) {
      throwConflictForUniqueStudent(error);
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    const student = await this.students.softDeleteActive(id);

    if (!student) {
      throw new NotFoundError("Student not found");
    }
  }
}

function createInputToData(input: CreateStudentInput): CreateStudentData {
  return {
    ...input,
    subscribedPlan: subscribedPlanToPrisma[input.subscribedPlan],
    status: studentStatusToPrisma[input.status],
  };
}

function updateInputToData(input: UpdateStudentInput): UpdateStudentData {
  return {
    ...input,
    subscribedPlan: input.subscribedPlan ? subscribedPlanToPrisma[input.subscribedPlan] : undefined,
    status: input.status ? studentStatusToPrisma[input.status] : undefined,
  };
}

function studentToDetail(student: Student): StudentDetail {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    cpf: student.cpf,
    phone: student.phone,
    subscribedPlan: prismaToSubscribedPlan[student.subscribedPlan as PrismaSubscribedPlan],
    status: prismaToStudentStatus[student.status as PrismaStudentStatus],
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
}

function throwConflictForUniqueStudent(error: unknown): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new ConflictError("Student email or CPF already exists");
  }
}
