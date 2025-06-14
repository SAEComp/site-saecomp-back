import { Request, Response } from 'express';

import * as questionRepo from '../repositories/question.repository';
import { createQuestionInSchema, questionIdParamInSchema, updateQuestionInSchema } from '../schemas/input/adminQuestions.schema';
import { getAllQuestionsOutSchema, createQuestionOutSchema, deleteQuestionOutSchema } from '../schemas/output/adminQuestions.schema';

// GET /api/admin/questions
export async function getAllQuestions(req: Request, res: Response) {
    const questions = await questionRepo.findAllQuestions();
    res.status(200).json(getAllQuestionsOutSchema.parse({ questions }));
}

// POST /api/admin/questions
export async function createQuestion(req: Request, res: Response) {
    const data = createQuestionInSchema.parse(req.body);

    const newQuestionId = await questionRepo.createQuestion(data);
    res.status(201).json(createQuestionOutSchema.parse({ questionId: newQuestionId }));
}

// PUT /api/admin/questions/:id
export async function updateQuestion(req: Request, res: Response) {
    const { id } = questionIdParamInSchema.parse(req.params);
    const data = updateQuestionInSchema.parse(req.body);

    await questionRepo.updateQuestion(id, data);

    res.status(204).send();
}

// DELETE /api/admin/questions/:id
export async function deleteQuestion(req: Request, res: Response) {
    const { id } = questionIdParamInSchema.parse(req.params);
    const result = await questionRepo.deleteOrDeactivateQuestion(id);

    return res.status(200).json(deleteQuestionOutSchema.parse({ deleted: result.deleted }));
}
