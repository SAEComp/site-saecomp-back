import { z } from "zod";
import { registerRoute } from "../registerRoute";

import {
    createQuestionInSchema,
    questionIdParamInSchema,
    updateQuestionInSchema,
} from "../../schemas/teacherEvaluation/input/adminQuestions.schema";

import {
    getAllQuestionsOutSchema,
    createQuestionOutSchema,
    deleteQuestionOutSchema,
} from "../../schemas/teacherEvaluation/output/adminQuestions.schema";


export function registerAdminQuestionRoutesDocs() {
    registerRoute({
        method: "get",
        path: "/admin/questions",
        tags: ["Admin Questions"],
        summary: "Lista todas as perguntas cadastradas",
        responses: {
            200: {
                description: "Perguntas retornadas com sucesso",
                schema: getAllQuestionsOutSchema.openapi("getAllQuestionsOutSchema"),
            },
        },
    });

    registerRoute({
        method: "post",
        path: "/admin/questions",
        tags: ["Admin Questions"],
        summary: "Cria uma nova pergunta",
        request: {
            body: createQuestionInSchema.openapi("createQuestionInSchema"),
        },
        responses: {
            201: {
                description: "Pergunta criada com sucesso",
                schema: createQuestionOutSchema.openapi("createQuestionOutSchema"),
            },
        },
    });

    registerRoute({
        method: "put",
        path: "/admin/questions/{id}",
        tags: ["Admin Questions"],
        summary: "Atualiza uma pergunta existente",
        request: {
            params: questionIdParamInSchema.openapi("questionIdParamInSchema"),
            body: updateQuestionInSchema.openapi("updateQuestionInSchema"),
        },
        responses: {
            204: {
                description: "Atualizada com sucesso (sem corpo)"
            },
        },
    });

    registerRoute({
        method: "delete",
        path: "/admin/questions/{id}",
        tags: ["Admin Questions"],
        summary: "Deleta ou desativa uma pergunta",
        request: {
            params: questionIdParamInSchema.openapi("questionIdParamInSchema"),
        },
        responses: {
            200: {
                description: "Resultado da exclusão",
                schema: deleteQuestionOutSchema.openapi("DeleteQuestionResponse"),
            },
        },
    });
}
