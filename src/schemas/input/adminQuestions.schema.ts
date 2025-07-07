import { z } from 'zod';
import questionTypes from '../../types/questionTypes';

const questionObjectSchema = z.object({
    question: z.string().min(3, "A pergunta deve ter pelo menos 3 caracteres."),
    type: z.enum(questionTypes),
    active: z.boolean(),
    order: z.number().int().positive().nullable(),
    isScore: z.boolean(),
    required: z.boolean(),
});

export const createQuestionInSchema = questionObjectSchema.refine(
    (data) => !data.isScore || data.type === 'numeric' || data.type === 'slider',
    {
        message: "Perguntas que contam para a nota (isScore) devem tem números.",
        path: ["isScore"],
    }
);

export const questionIdParamInSchema = z.object({
    id: z.coerce.number().int().positive("O ID da pergunta deve ser um número inteiro positivo."),
});

export const updateQuestionInSchema = questionObjectSchema.partial();