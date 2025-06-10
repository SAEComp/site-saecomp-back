import { Router } from 'express';
import * as evaluationController from '../controllers/evaluation.controller';
import authenticate from '../middlewares/authenticate';

const evaluationRouter = Router();

// ================= ROTAS PÚBLICAS ================= //

// Rota para buscar a relação de professores e cursos
// GET /api/evaluation/teachers-courses
evaluationRouter.get(
  '/teachers-courses',
  evaluationController.getTeachersCourses
);

// Rota para buscar as perguntas ativas do formulário
// GET /api/evaluation/questions
evaluationRouter.get('/questions', evaluationController.getActiveQuestions);

// Rota para a lista pública de respostas aprovadas
// GET /api/evaluation/answers
evaluationRouter.get('/answers', evaluationController.getPublicAnswers);

// Rota para o detalhe de uma resposta pública aprovada
// GET /api/evaluation/answers/:id
evaluationRouter.get('/answers/:id', evaluationController.getPublicAnswerDetails);

// ================= ROTAS PROTEGIDAS ================= //

// Rota para criar uma nova avaliação
// POST /api/evaluation/create
evaluationRouter.post('/create', authenticate, evaluationController.createEvaluation);

export default evaluationRouter;