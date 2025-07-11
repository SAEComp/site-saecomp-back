import { Request, Response } from "express";

// Serviços
import checkClasses from "../services/checkClasses.service";
import createEvaluationsService from "../services/createEvaluations.service";

// Repositórios
import * as evaluationRepo from '../repositories/evaluation.repository';
import * as questionRepo from '../repositories/question.repository';
import * as userRepo from '../repositories/user.repository';

// Schemas de Validação
import { createEvaluationInSchema, getClassesInSchema } from "../schemas/teacherEvaluation/input/evaluation.schema";
import { ApiError } from "../errors/ApiError";
import { getClassesOutSchema, getActiveQuestionsOutSchema } from "../schemas/teacherEvaluation/output/evaluation.schema";

// GET /api/evaluation/classes
export async function getClasses(req: Request, res: Response) {
    const { idealYear } = getClassesInSchema.parse(req.query);
    const data = await evaluationRepo.findClasses(idealYear);
    res.json(getClassesOutSchema.parse({ results: data }));
}


// GET /api/evaluation/questions
export async function getActiveQuestions(req: Request, res: Response) {
    const questions = await questionRepo.findActiveQuestions();
    res.json(getActiveQuestionsOutSchema.parse({ questions }));
}

// POST /api/evaluation/create
export async function createEvaluation(req: Request, res: Response) {
    const { evaluations } = createEvaluationInSchema.parse(req.body);
    const userId = req.userId;

    if (!userId) throw new ApiError(401, "Usuário não autenticado");

    if (!await checkClasses(evaluations)) throw new ApiError(400, "Algumas avaliações não correspondem às turmas do usuário");

    await createEvaluationsService(evaluations, userId);

    res.status(201).send();
}
