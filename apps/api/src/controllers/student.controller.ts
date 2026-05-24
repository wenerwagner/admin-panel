import type { Request, Response } from "express";

import {
  createStudentSchema,
  studentIdParamsSchema,
  studentListQuerySchema,
  updateStudentSchema,
} from "../schemas/student.schema.js";
import { StudentService } from "../services/student.service.js";

const studentService = new StudentService();

export async function list(request: Request, response: Response): Promise<void> {
  const query = studentListQuerySchema.parse(request.query);
  const students = await studentService.list(query);

  response.status(200).json(students);
}

export async function detail(request: Request, response: Response): Promise<void> {
  const { studentId } = studentIdParamsSchema.parse(request.params);
  const student = await studentService.detail(studentId);

  response.status(200).json(student);
}

export async function create(request: Request, response: Response): Promise<void> {
  const input = createStudentSchema.parse(request.body);
  const student = await studentService.create(input);

  response.status(201).json(student);
}

export async function update(request: Request, response: Response): Promise<void> {
  const { studentId } = studentIdParamsSchema.parse(request.params);
  const input = updateStudentSchema.parse(request.body);
  const student = await studentService.update(studentId, input);

  response.status(200).json(student);
}

export async function remove(request: Request, response: Response): Promise<void> {
  const { studentId } = studentIdParamsSchema.parse(request.params);
  await studentService.softDelete(studentId);

  response.status(204).send();
}
