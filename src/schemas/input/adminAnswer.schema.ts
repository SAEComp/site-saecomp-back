import { z } from 'zod';

export const getAdminAnswersInSchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(10),
    teacherId: z.coerce.number().int().positive().optional(),
    courseId: z.coerce.number().int().positive().optional(),
    status: z.enum(['approved', 'rejected', 'pending']).optional(),
    semester: z.string().regex(/^[0-9]{4}-(1|2)$/, "O semestre deve estar no formato AAAA-S (ex: 2025-1).").optional(),
});

export type GetAdminAnswersParams = z.infer<typeof getAdminAnswersInSchema>;

export const getAdminAnswerDetailsParamsInSchema = z.object({
    id: z.coerce.number().int().positive("O ID da avaliação deve ser um número inteiro positivo."),
});

export const updateAnswerParamsInSchema = z.object({
    id: z.coerce.number().int().positive("O ID da avaliação deve ser um número inteiro positivo."),
});

export const updateAnswerInSchema = z.object({
    status: z.enum(['approved', 'rejected', 'pending']).optional(),
    answers: z.array(z.object({
        questionId: z.number().int().positive(),
        editedAnswer: z.string().nullable(),
    })).optional(),
});

export type UpdateAnswerPayload = z.infer<typeof updateAnswerInSchema>;