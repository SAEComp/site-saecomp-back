import { Request, Response } from "express";
import { z } from 'zod';

// Repositórios
import * as evaluationRepo from '../repositories/evaluation.repository';
import * as questionRepo from '../repositories/question.repository';
import * as userRepo from '../repositories/user.repository';
import * as answerRepo from '../repositories/answer.repository';

// Schemas de Validação
import { createEvaluationSchema, evaluationIdParamSchema, getTeachersCoursesSchema } from "../schemas/evaluation.schema";
import { getPublicAnswersSchema } from "../schemas/answer.schema";


// GET /evaluation/teachers-courses
export async function getTeachersCourses(req: Request, res: Response) {
    try {
        const { idealYear } = getTeachersCoursesSchema.parse(req.query);
        const data = await evaluationRepo.findTeachersCourses(idealYear);
        res.json({ results: data });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /evaluation/questions
export async function getActiveQuestions(req: Request, res: Response) {
    try {
        const questions = await questionRepo.findActiveQuestions();
        res.json({ questions });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /evaluation/create
export async function createEvaluation(req: Request, res: Response) {
    try {
        const { nusp, evaluations } = createEvaluationSchema.parse(req.body);
        const userId = req.userId;

        if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
        
        for (const ev of evaluations) {
            const linkExists = await evaluationRepo.checkTeacherCourseLinkExists(ev.teacherId, ev.courseId);
            if (!linkExists) {
                return res.status(404).json({ error: `O professor com ID ${ev.teacherId} não está vinculado à disciplina com ID ${ev.courseId} no semestre atual.` });
            }
        }
        
        await userRepo.findOrCreateUserByNusp(nusp, { id: userId });
        
        const activeQuestions = await questionRepo.findActiveQuestions();

        for (const ev of evaluations) {
            let totalScore = 0;
            let scoreQuestionCount = 0;

            const answersWithOrder = ev.answers.map(ans => {
                const questionDetails = activeQuestions.find(q => q.id === ans.questionId);
                // @ts-ignore
                if (questionDetails?.is_score) {
                    const answerScore = Number(ans.answer);
                    if (!isNaN(answerScore)) {
                        totalScore += answerScore;
                        scoreQuestionCount++;
                    }
                }
                return {
                    ...ans,
                    // @ts-ignore
                    order: questionDetails?.order ?? 0
                }
            });

            const finalScore = scoreQuestionCount > 0 ? totalScore / scoreQuestionCount : null;

            await evaluationRepo.createEvaluationAndAnswers({
                userId: userId,
                teacherId: ev.teacherId,
                courseId: ev.courseId,
                score: finalScore,
                answers: answersWithOrder
            });
        }
        
        res.status(201).send();

    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /answers
export async function getPublicAnswers(req: Request, res: Response) {
    try {
        const queryParams = getPublicAnswersSchema.parse(req.query);
        const result = await answerRepo.findPublicAnswers(queryParams);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// GET /answers/:id
export async function getPublicAnswerDetails(req: Request, res: Response) {
    try {
        const { id } = evaluationIdParamSchema.parse(req.params);
        const result = await answerRepo.findPublicAnswerDetails(id);

        if (!result) {
            return res.status(404).json({ error: "Avaliação não encontrada ou não aprovada." });
        }
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Internal Server Error' });
    }
}