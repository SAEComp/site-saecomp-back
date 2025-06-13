import { Request, Response } from "express";

// Repositórios
import * as answerRepo from '../repositories/answer.repository';

// Schemas de Validação
import { evaluationIdParamSchema } from "../schemas/evaluation.schema";
import { getPublicAnswersSchema } from "../schemas/answer.schema";
import { ApiError } from "../errors/ApiError";


// GET /answers
export async function getPublicAnswers(req: Request, res: Response) {
    const queryParams = getPublicAnswersSchema.parse(req.query);
    const result = await answerRepo.findPublicAnswers(queryParams);
    res.status(200).json(result);
}

// GET /answers/:id
export async function getPublicAnswerDetails(req: Request, res: Response) {
    const { id } = evaluationIdParamSchema.parse(req.params);
    const result = await answerRepo.findPublicAnswerDetails(id);

    if (!result) throw new ApiError(404, "Avaliação não encontrada");
    res.status(200).json(result);
}
