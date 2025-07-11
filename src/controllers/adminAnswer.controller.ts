import { Request, Response } from 'express';

import * as answerRepo from '../repositories/answer.repository';
import { ApiError } from '../errors/ApiError';
import {
    getAdminAnswersInSchema,
    updateAnswerInSchema,
    getAdminAnswerDetailsParamsInSchema,
    updateAnswerParamsInSchema
} from '../schemas/teacherEvaluation/input/adminAnswer.schema';

import { getAdminAnswersOutSchema, getAdminAnswerDetailsOutSchema } from '../schemas/teacherEvaluation/output/adminAnswer.schema';

// GET /api/evaluation/admin/answers
export async function getAdminAnswers(req: Request, res: Response) {
    const queryParams = getAdminAnswersInSchema.parse(req.query);
    const result = await answerRepo.findAdminAnswers(queryParams);
    res.status(200).json(getAdminAnswersOutSchema.parse(result));
}

// GET /api/evaluation/admin/answers/:id
export async function getAdminAnswerDetails(req: Request, res: Response) {
    const { id } = getAdminAnswerDetailsParamsInSchema.parse(req.params);
    const details = await answerRepo.findAdminAnswerDetails(id);
    res.status(200).json(getAdminAnswerDetailsOutSchema.parse(details));
}

// PUT /api/evaluation/admin/answers/:id
export async function updateAnswer(req: Request, res: Response) {
    const { id } = updateAnswerParamsInSchema.parse(req.params);
    const data = updateAnswerInSchema.parse(req.body);
    const adminUserId = req.userId;

    if (!adminUserId) throw new ApiError(403, 'Acesso negado. Usuário não autenticado.');
    await answerRepo.updateEvaluationStatusAndAnswers(id, data, adminUserId);

    res.status(204).send();
}
