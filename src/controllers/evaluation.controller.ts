import { Request, Response } from "express";

// Serviços
import checkClasses from "../services/checkClasses.service";
import createEvaluationsService from "../services/createEvaluations.service";

// Repositórios
import * as evaluationRepo from '../repositories/evaluation.repository';
import * as questionRepo from '../repositories/question.repository';
import * as userRepo from '../repositories/user.repository';

// Schemas de Validação
import { createEvaluationSchema, getTeachersCoursesSchema } from "../schemas/evaluation.schema";
import { ApiError } from "../errors/ApiError";


// GET /evaluation/classes
export async function getClasses(req: Request, res: Response) {
    const { idealYear } = getTeachersCoursesSchema.parse(req.query);
    const data = await evaluationRepo.findTeachersCourses(idealYear);
    res.json({ results: data });
}

// GET /evaluation/questions
export async function getActiveQuestions(req: Request, res: Response) {
    const questions = await questionRepo.findActiveQuestions();
    res.json({ questions });
}

// POST /evaluation/create
export async function createEvaluation(req: Request, res: Response) {
    const { nusp, evaluations } = createEvaluationSchema.parse(req.body);
    const userId = req.userId;

    if (!userId) throw new ApiError(401, "Usuário não autenticado");

    if (!await checkClasses(evaluations)) throw new ApiError(400, "Algumas avaliações não correspondem às turmas do usuário");

    await userRepo.updateNusp(nusp, userId);

    console.log(';.......')

    await createEvaluationsService(evaluations, userId);

    res.status(201).send();
}
