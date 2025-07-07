import { z } from 'zod';
import questionTypes from '../../types/questionTypes';

export const questionsSchema = z.object({
    id: z.coerce.number().int().positive("O ID da pergunta deve ser um número inteiro positivo."),
    question: z.string().min(3, "A pergunta deve ter pelo menos 3 caracteres."),
    type: z.enum(questionTypes),
    active: z.boolean(),
    order: z.number().int().positive().nullable(),
    isScore: z.boolean(),
    required: z.boolean(),
});

export type Question = z.infer<typeof questionsSchema>;

export const getAllQuestionsOutSchema = z.object({
    questions: z.array(questionsSchema),
});

export const createQuestionOutSchema = z.object({
    questionId: z.coerce.number().int().positive("O ID da pergunta deve ser um número inteiro positivo."),
});

export const deleteQuestionOutSchema = z.object({
    deleted: z.boolean()
});