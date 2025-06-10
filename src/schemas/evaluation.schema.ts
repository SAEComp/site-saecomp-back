import { z } from 'zod';

export const getTeachersCoursesSchema = z.object({
    idealYear: z.coerce.number().int().gte(0).optional()
});

export const createEvaluationSchema = z.object({
    nusp: z.string().regex(/^[0-9]{7,8}$/, "NUSP inválido"),
    evaluations: z.array(z.object({
        teacherId: z.number().int().positive(),
        courseId: z.number().int().positive(),
        answers: z.array(z.object({
            questionId: z.number().int().positive(),
            answer: z.string().min(1) // ou .any() se o tipo puder variar
        }))
    })).min(1, "É necessário enviar ao menos uma avaliação."),
});

export const evaluationIdParamSchema = z.object({
  id: z.coerce.number().int().positive("O ID da avaliação deve ser um número inteiro positivo."),
});
