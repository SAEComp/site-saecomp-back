import { Router } from 'express';
import * as evaluationController from '../controllers/evaluation.controller';
import * as answerController from '../controllers/answer.controller';
import authenticate from '../middlewares/authenticate';

const userRouter = Router();

userRouter.get('/classes', authenticate(['evaluation:create', 'evaluation:results', 'evaluation:review']), evaluationController.getClasses);

userRouter.get('/teachers', authenticate(['evaluation:create', 'evaluation:results', 'evaluation:review']), evaluationController.getTeachers);

userRouter.get('/courses', authenticate(['evaluation:create', 'evaluation:results', 'evaluation:review']), evaluationController.getCourses);

userRouter.get('/questions', authenticate(['evaluation:create', 'evaluation:results', 'evaluation:review']), evaluationController.getActiveQuestions);

userRouter.get('/answers', authenticate(['evaluation:results']), answerController.getPublicAnswers);

userRouter.get('/answers/:id', authenticate(['evaluation:results']), answerController.getPublicAnswerDetails);

userRouter.post('/create', authenticate(['evaluation:create']), evaluationController.createEvaluation);

export default userRouter;
