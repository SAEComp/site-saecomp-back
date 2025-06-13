import { z } from 'zod';

// Validação para a query string de /admin/answers
export const getAdminAnswersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().optional().default(10),
  teacherId: z.coerce.number().int().positive().optional(),
  courseId: z.coerce.number().int().positive().optional(),
  status: z.enum(['approved', 'rejected', 'pending']).optional(),
  semester: z.string().regex(/^[0-9]{4}-(1|2)$/, "O semestre deve estar no formato AAAA-S (ex: 2025-1).").optional(),
});

// Validação para o corpo da requisição de PUT /admin/answer/:id
export const updateAnswerSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']).optional(),
  answers: z.array(z.object({
    questionId: z.number().int().positive(),
    editedAnswer: z.string().nullable(),
  })).optional(),
});

// Validação para a query string de /answers (público)
export const getPublicAnswersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
  teacherId: z.coerce.number().int().positive().optional(),
  courseId: z.coerce.number().int().positive().optional(),
});