import { Router } from 'express';
import * as adminAnswerController from '../controllers/adminAnswer.controller';
import * as adminQuestionController from '../controllers/adminQuestions.controller';

const adminRouter = Router();


adminRouter.get('/questions', adminQuestionController.getAllQuestions);
adminRouter.post('/questions', adminQuestionController.createQuestion);
adminRouter.put('/questions/:id', adminQuestionController.updateQuestion);
adminRouter.delete('/questions/:id', adminQuestionController.deleteQuestion);

adminRouter.get('/answers', adminAnswerController.getAdminAnswers);
adminRouter.get('/answers/:id', adminAnswerController.getAdminAnswerDetails);
adminRouter.put('/answers/:id', adminAnswerController.updateAnswer);


export default adminRouter;