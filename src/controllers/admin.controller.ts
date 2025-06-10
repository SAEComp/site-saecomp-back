// src/controllers/admin.controller.ts

import { Request, Response } from 'express';
import { z } from 'zod';

import * as questionRepo from '../repositories/question.repository';
import * as answerRepo from '../repositories/answer.repository';
import { createQuestionSchema, updateQuestionSchema, questionIdParamSchema } from '../schemas/question.schema';
import { getAdminAnswersSchema, updateAnswerSchema } from '../schemas/answer.schema';
import { evaluationIdParamSchema } from '../schemas/evaluation.schema';

// ================== CONTROLLERS DE PERGUNTAS (QUESTIONS) ==================

export async function getAllQuestions(req: Request, res: Response) {
  try {
    const questions = await questionRepo.findAllQuestions();
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    const data = createQuestionSchema.parse(req.body);

    // Mapeamento dos nomes do request para os nomes do banco
    const questionData = {
      question: data.question,
      type: data.questionType,
      active: data.active,
      question_order: data.order ?? null,
      is_score: data.isScore,
    };

    const newQuestion = await questionRepo.createQuestionAndUpdateOrder(questionData);
    res.status(201).json({ questionId: newQuestion.id });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  try {
    const { id } = questionIdParamSchema.parse(req.params);
    const data = updateQuestionSchema.parse(req.body);

    // Mapeamento dos nomes (trata campos que podem não vir no update)
    const questionDataToUpdate = {
      ...(data.question && { question: data.question }),
      ...(data.questionType && { type: data.questionType }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.order !== undefined && { question_order: data.order }),
      ...(data.isScore !== undefined && { is_score: data.isScore }),
    };

    const updatedQuestion = await questionRepo.updateQuestion(id, questionDataToUpdate); 

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Pergunta não encontrada." });
    }
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    const { id } = questionIdParamSchema.parse(req.params);
    const result = await questionRepo.deleteOrDeactivateQuestion(id);

    if (result.deleted) {
      return res.status(204).send();
    }
    return res.status(200).json(result.question);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


// ================== CONTROLLERS DE RESPOSTAS (ANSWERS) ==================

export async function getAdminAnswers(req: Request, res: Response) {
  try {
    const queryParams = getAdminAnswersSchema.parse(req.query);
    const result = await answerRepo.findAdminAnswers(queryParams);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getAdminAnswerDetails(req: Request, res: Response) {
  try {
    const { id } = evaluationIdParamSchema.parse(req.params);
    const details = await answerRepo.findAdminAnswerDetails(id);
    if (!details) {
      return res.status(404).json({ error: "Avaliação não encontrada." });
    }
    res.status(200).json(details);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateAnswer(req: Request, res: Response) {
    try {
        const { id } = evaluationIdParamSchema.parse(req.params);
        const data = updateAnswerSchema.parse(req.body);
        const adminUserId = req.userId;

        if (!adminUserId) return res.status(401).json({ error: 'Admin não autenticado.' });
        const success = await answerRepo.updateEvaluationStatusAndAnswers(id, data, adminUserId);

        if (!success) {
            return res.status(404).json({ error: 'Avaliação não encontrada.' });
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Internal Server Error' });
    }
}