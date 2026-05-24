import type { Request, Response } from "express";

import { studentIdParamsSchema, studentListQuerySchema } from "../schemas/student.schema.js";
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
