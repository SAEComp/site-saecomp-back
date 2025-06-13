import { Request, Response } from 'express';

import * as answerRepo from '../repositories/answer.repository';
import { getAdminAnswersSchema, updateAnswerSchema } from '../schemas/answer.schema';
import { evaluationIdParamSchema } from '../schemas/evaluation.schema';
import { ApiError } from '../errors/ApiError';


export async function getAdminAnswers(req: Request, res: Response) {
    const queryParams = getAdminAnswersSchema.parse(req.query);
    const result = await answerRepo.findAdminAnswers(queryParams);
    res.status(200).json(result);
}

export async function getAdminAnswerDetails(req: Request, res: Response) {
    const { id } = evaluationIdParamSchema.parse(req.params);
    const details = await answerRepo.findAdminAnswerDetails(id);
    res.status(200).json(details);
}

export async function updateAnswer(req: Request, res: Response) {
    const { id } = evaluationIdParamSchema.parse(req.params);
    const data = updateAnswerSchema.parse(req.body);
    const adminUserId = req.userId;

    if (!adminUserId) throw new ApiError(403, 'Acesso negado. Usuário não autenticado.');
    await answerRepo.updateEvaluationStatusAndAnswers(id, data, adminUserId);

    res.status(204).send();
}
