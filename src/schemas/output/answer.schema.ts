import { z } from 'zod';
import questionTypes from '../../types/questionTypes';

const publicAnswersSchema = z.object({
    evaluationId: z.coerce.number().int().positive("O ID da avaliação deve ser um número inteiro positivo."),
    teacherName: z.string().min(3, "O nome do professor deve ter pelo menos 3 caracteres."),
    teacherId: z.coerce.number().int().positive("O ID do professor deve ser um número inteiro positivo."),
    courseName: z.string().min(3, "O nome do curso deve ter pelo menos 3 caracteres."),
    courseCode: z.string().min(3, "O código do curso deve ter pelo menos 3 caracteres."),
    score: z.number().nullable()
});

export type PublicAnswer = z.infer<typeof publicAnswersSchema>;

export const getPublicAnswersOutSchema = z.object({
    isLastPage: z.boolean(),
    score: z.number().nullable(),
    evaluations: z.array(publicAnswersSchema)
});

const publicEvaluationDetailsSchema = z.object({
    evaluationId: z.coerce.number().int().positive("O ID da avaliação deve ser um número inteiro positivo."),
    teacherName: z.string().min(3, "O nome do professor deve ter pelo menos 3 caracteres."),
    teacherId: z.coerce.number().int().positive("O ID do professor deve ser um número inteiro positivo."),
    courseName: z.string().min(3, "O nome do curso deve ter pelo menos 3 caracteres."),
    courseCode: z.string().min(3, "O código do curso deve ter pelo menos 3 caracteres."),
    courseId: z.coerce.number().int().positive("O ID do curso deve ser um número inteiro positivo."),
    instituteName: z.string().min(3, "O nome do instituto deve ter pelo menos 3 caracteres."),
    instituteCode: z.string().min(3, "O código do instituto deve ter pelo menos 3 caracteres."),
    departmentName: z.string().min(3, "O nome do departamento deve ter pelo menos 3 caracteres."),
    departmentCode: z.string().min(3, "O código do departamento deve ter pelo menos 3 caracteres."),

});

export type PublicEvaluationDetails = z.infer<typeof publicEvaluationDetailsSchema>;

const publicAnswerDetailsSchema = z.object({
    questionId: z.coerce.number().int().positive("O ID da pergunta deve ser um número inteiro positivo."),
    questionType: z.enum(questionTypes),
    question: z.string().min(3, "A pergunta deve ter pelo menos 3 caracteres."),
    answer: z.string().nullable()
});

export type PublicAnswerDetails = z.infer<typeof publicAnswerDetailsSchema>;

export const getPublicAnswerDetailsOutSchema = publicEvaluationDetailsSchema.extend({
    answers: z.array(publicAnswerDetailsSchema)
});
