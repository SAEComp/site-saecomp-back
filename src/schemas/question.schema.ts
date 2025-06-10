import { z } from 'zod';

// 1. Primeiro, definimos um objeto base com a "forma" dos dados da pergunta.
const questionObjectSchema = z.object({
  question: z.string().min(3, "A pergunta deve ter pelo menos 3 caracteres."),
  questionType: z.enum(['numeric', 'text']),
  active: z.boolean(),
  order: z.number().int().positive().optional().nullable(),
  isScore: z.boolean(),
});

// 2. O schema de CRIAÇÃO usa o objeto base e adiciona a regra customizada com .refine()
export const createQuestionSchema = questionObjectSchema.refine(
  (data) => !data.isScore || data.questionType === 'numeric',
  {
    message: "Perguntas que contam para a nota (isScore) devem ser do tipo 'numeric'.",
    path: ["isScore"],
  }
);

// 3. O schema de ATUALIZAÇÃO usa o objeto base e aplica o .partial() nele.
//    Isso torna todos os campos opcionais, como esperado.
export const updateQuestionSchema = questionObjectSchema.partial();

// 4. O schema para validar o ID na URL continua o mesmo.
export const questionIdParamSchema = z.object({
  id: z.coerce.number().int().positive("O ID da pergunta deve ser um número inteiro positivo."),
});