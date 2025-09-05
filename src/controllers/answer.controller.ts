import { Request, Response } from "express";

// Repositórios
import * as answerRepo from '../repositories/answer.repository';

// Schemas de Validação
import { getPublicAnswersInSchema, getPublicAnswerDetailsParamInSchema } from "../schemas/teacherEvaluation/input/answer.schema";
import { ApiError } from "../errors/ApiError";
import { getPublicAnswersOutSchema, getPublicAnswerDetailsOutSchema } from "../schemas/teacherEvaluation/output/answer.schema";

// GET /api/evaluation/answers
export async function getPublicAnswers(req: Request, res: Response) {
    const queryParams = getPublicAnswersInSchema.parse(req.query);
    const result = await answerRepo.findPublicAnswers(queryParams);
    res.status(200).json(getPublicAnswersOutSchema.parse(result));
}

// GET /api/evaluation/answers/:id
export async function getPublicAnswerDetails(req: Request, res: Response) {
    const { id } = getPublicAnswerDetailsParamInSchema.parse(req.params);
    const result = await answerRepo.findPublicAnswerDetails(id);

    console.log(result);

    if (!result) throw new ApiError(404, "Avaliação não encontrada");
    res.status(200).json(getPublicAnswerDetailsOutSchema.parse(result));

}
