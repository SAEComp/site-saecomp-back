import { z } from "zod";
import { registerRoute } from "../registerRoute";

import {
    createEvaluationInSchema,
    getClassesInSchema
} from "../../schemas/input/evaluation.schema";

import {
    getClassesOutSchema,
    getActiveQuestionsOutSchema,
} from "../../schemas/output/evaluation.schema";


export function registerEvaluationRoutesDocs() {
    registerRoute({
        method: "get",
        path: "/classes",
        tags: ["Evaluation"],
        summary: "Consulta as turmas que o usuário pode avaliar",
        request: {
            query: getClassesInSchema.openapi("getClassesInSchema"),
        },
        responses: {
            200: {
                description: "Lista de turmas disponíveis para avaliação",
                schema: getClassesOutSchema.openapi("getClassesOutSchema"),
            },
        },
    });

    registerRoute({
        method: "get",
        path: "/questions",
        tags: ["Evaluation"],
        summary: "Retorna as perguntas ativas para avaliação",
        responses: {
            200: {
                description: "Perguntas disponíveis para preencher avaliações",
                schema: getActiveQuestionsOutSchema.openapi("getActiveQuestionsOutSchema"),
            },
        },
    });

    registerRoute({
        method: "post",
        path: "/create",
        tags: ["Evaluation"],
        summary: "Cria avaliações para um usuário autenticado",
        request: {
            body: createEvaluationInSchema.openapi("createEvaluationInSchema"),
        },
        responses: {
            201: {
                description: "Avaliações criadas com sucesso"
            },
            400: {
                description: "Erro de validação ou turmas inválidas",
                schema: z.object({
                    code: z.string(),
                    message: z.string(),
                }).openapi("InvalidEvaluationError"),
            },
            401: {
                description: "Usuário não autenticado",
                schema: z.object({
                    code: z.string(),
                    message: z.string(),
                }).openapi("UnauthorizedError"),
            },
        },
    });
}
