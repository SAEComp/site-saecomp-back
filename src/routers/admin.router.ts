import { Router } from 'express';
import * as adminAnswerController from '../controllers/adminAnswer.controller';
import * as adminQuestionController from '../controllers/adminQuestions.controller';
import authenticate from '../middlewares/authenticate';

const adminRouter = Router();


adminRouter.get('/questions', authenticate(['evaluation:edit']), adminQuestionController.getAllQuestions);
adminRouter.post('/questions', authenticate(['evaluation:edit']), adminQuestionController.createQuestion);
adminRouter.put('/questions/:id', authenticate(['evaluation:edit']), adminQuestionController.updateQuestion);
adminRouter.delete('/questions/:id', authenticate(['evaluation:edit']), adminQuestionController.deleteQuestion);

adminRouter.get('/answers', authenticate(['evaluation:review']), adminAnswerController.getAdminAnswers);
adminRouter.get('/answers/:id', authenticate(['evaluation:review']), adminAnswerController.getAdminAnswerDetails);
adminRouter.put('/answers/:id', authenticate(['evaluation:review']), adminAnswerController.updateAnswer);


export default adminRouter;