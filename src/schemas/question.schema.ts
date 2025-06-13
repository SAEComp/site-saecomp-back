import { z } from 'zod';

const questionObjectSchema = z.object({
    question: z.string().min(3, "A pergunta deve ter pelo menos 3 caracteres."),
    type: z.enum(['numeric', 'text']),
    active: z.boolean(),
    order: z.number().int().positive().nullable(),
    isScore: z.boolean(),
});

export const createQuestionSchema = questionObjectSchema.refine(
    (data) => !data.isScore || data.type === 'numeric',
    {
        message: "Perguntas que contam para a nota (isScore) devem ser do tipo 'numeric'.",
        path: ["isScore"],
    }
);

export const updateQuestionSchema = questionObjectSchema.partial();

export const questionIdParamSchema = z.object({
    id: z.coerce.number().int().positive("O ID da pergunta deve ser um número inteiro positivo."),
});
