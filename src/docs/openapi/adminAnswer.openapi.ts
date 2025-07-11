import { registerRoute } from "../registerRoute";
import { z } from "zod";
import {
    getAdminAnswersInSchema,
    getAdminAnswerDetailsParamsInSchema,
    updateAnswerInSchema,
    updateAnswerParamsInSchema,
} from "../../schemas/teacherEvaluation/input/adminAnswer.schema";

import {
    getAdminAnswersOutSchema,
    getAdminAnswerDetailsOutSchema,
} from "../../schemas/teacherEvaluation/output/adminAnswer.schema";

export function registerAdminAnswerRoutesDocs() {
    // GET /api/evaluation/admin/answers
    registerRoute({
        method: "get",
        path: "/admin/answers",
        tags: ["Admin Answers"],
        summary: "Lista de avaliações com filtros",
        request: {
            query: getAdminAnswersInSchema.openapi("getAdminAnswersInSchema"),
        },
        responses: {
            200: {
                description: "Lista paginada de avaliações",
                schema: getAdminAnswersOutSchema.openapi("getAdminAnswersOutSchema"),
            },
        },
    });

    // GET /api/evaluation/admin/answers/:id
    registerRoute({
        method: "get",
        path: "/admin/answers/{id}",
        tags: ["Admin Answers"],
        summary: "Detalhes das respostas de uma avaliação",
        request: {
            params: getAdminAnswerDetailsParamsInSchema.openapi("getAdminAnswerDetailsParamsInSchema"),
        },
        responses: {
            200: {
                description: "Detalhes da avaliação",
                schema: getAdminAnswerDetailsOutSchema.openapi("getAdminAnswerDetailsOutSchema"),
            },
        },
    });

    // PUT /api/evaluation/admin/answers/:id
    registerRoute({
        method: "put",
        path: "/admin/answers/{id}",
        tags: ["Admin Answers"],
        summary: "Atualiza status e respostas editadas de uma avaliação",
        request: {
            params: updateAnswerParamsInSchema.openapi("updateAnswerParamsInSchema"),
            body: updateAnswerInSchema.openapi("updateAnswerInSchema"),
        },
        responses: {
            204: {
                description: "Atualização realizada com sucesso"
            },
        },
    });
}
