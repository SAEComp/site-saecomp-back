import { z } from 'zod';

export const getPublicAnswersInSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
    teacherId: z.coerce.number().int().positive().optional(),
    courseId: z.coerce.number().int().positive().optional(),
});

export type GetPublicAnswersParams = z.infer<typeof getPublicAnswersInSchema>;

export const getPublicAnswerDetailsParamInSchema = z.object({
    id: z.coerce.number().int().positive("O ID da avaliação deve ser um número inteiro positivo."),
});