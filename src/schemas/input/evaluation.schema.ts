import { z } from 'zod';

export const getClassesInSchema = z.object({
    idealYear: z.coerce.number().int().gte(0).optional()
});

const answerSchema = z.object({
    questionId: z.number().int().positive(),
    answer: z.string().min(1)
});

export type IAnswer = z.infer<typeof answerSchema>;

const evaluationSchema = z.object({
    classId: z.coerce.number().int().positive(),
    answers: z.array(answerSchema)
});

export type IEvaluation = z.infer<typeof evaluationSchema>;

export const createEvaluationInSchema = z.object({
    nusp: z.string().regex(/^[0-9]{7,8}$/, "NUSP inválido"),
    evaluations: z.array(evaluationSchema).min(1, "É necessário enviar ao menos uma avaliação."),
});

export const evaluationIdParamSchema = z.object({
    id: z.coerce.number().int().positive("O ID da avaliação deve ser um número inteiro positivo."),
});
