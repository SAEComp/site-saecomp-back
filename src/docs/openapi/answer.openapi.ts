import { registerRoute } from "../registerRoute";
import { z } from "zod";

import {
    getPublicAnswersInSchema,
    getPublicAnswerDetailsParamInSchema,
} from "../../schemas/input/answer.schema";

import {
    getPublicAnswersOutSchema,
    getPublicAnswerDetailsOutSchema,
} from "../../schemas/output/answer.schema";


export function registerPublicAnswerRoutesDocs() {
    registerRoute({
        method: "get",
        path: "/answers",
        tags: ["Public Answers"],
        summary: "Lista de avaliações públicas disponíveis",
        request: {
            query: getPublicAnswersInSchema.openapi("getPublicAnswersInSchema"),
        },
        responses: {
            200: {
                description: "Avaliações públicas encontradas",
                schema: getPublicAnswersOutSchema.openapi("getPublicAnswersOutSchema"),
            },
        },
    });

    registerRoute({
        method: "get",
        path: "/answers/{id}",
        tags: ["Public Answers"],
        summary: "Detalhes públicos de uma avaliação específica",
        request: {
            params: getPublicAnswerDetailsParamInSchema.openapi("getPublicAnswerDetailsParamInSchema"),
        },
        responses: {
            200: {
                description: "Detalhes da avaliação pública",
                schema: getPublicAnswerDetailsOutSchema.openapi("getPublicAnswerDetailsOutSchema"),
            },
            404: {
                description: "Avaliação não encontrada",
                schema: z.object({
                    code: z.string(),
                    message: z.string(),
                }).openapi("NotFoundError"),
            },
        },
    });
}
