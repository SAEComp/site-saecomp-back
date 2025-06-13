import { Request, Response } from 'express';

import * as questionRepo from '../repositories/question.repository';
import { createQuestionSchema, updateQuestionSchema, questionIdParamSchema } from '../schemas/question.schema';

export async function getAllQuestions(req: Request, res: Response) {
    const questions = await questionRepo.findAllQuestions();
    res.status(200).json({ questions });
}

export async function createQuestion(req: Request, res: Response) {
    const data = createQuestionSchema.parse(req.body);

    const newQuestionId = await questionRepo.createQuestion(data);
    res.status(201).json({ questionId: newQuestionId });
}

export async function updateQuestion(req: Request, res: Response) {
    const { id } = questionIdParamSchema.parse(req.params);
    const data = updateQuestionSchema.parse(req.body);

    await questionRepo.updateQuestion(id, data);

    res.status(204).send();
}

export async function deleteQuestion(req: Request, res: Response) {
    const { id } = questionIdParamSchema.parse(req.params);
    const result = await questionRepo.deleteOrDeactivateQuestion(id);

    return res.status(200).json({ deleted: result.deleted });
}
