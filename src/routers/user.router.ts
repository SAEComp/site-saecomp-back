import { Router } from 'express';
import * as evaluationController from '../controllers/evaluation.controller';
import * as answerController from '../controllers/answer.controller';
import authenticate from '../middlewares/authenticate';

const userRouter = Router();

userRouter.get('/classes',evaluationController.getClasses);

userRouter.get('/questions', evaluationController.getActiveQuestions);

userRouter.get('/answers', answerController.getPublicAnswers);

userRouter.get('/answers/:id', answerController.getPublicAnswerDetails);

userRouter.post('/create', evaluationController.createEvaluation);

export default userRouter;