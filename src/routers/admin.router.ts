import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';

const adminRouter = Router();

// -> QUESTIONS 
adminRouter.get('/questions', adminController.getAllQuestions);
adminRouter.post('/questions', adminController.createQuestion);
adminRouter.put('/questions/:id', adminController.updateQuestion);
adminRouter.delete('/questions/:id', adminController.deleteQuestion);

// -> ANSWERS 
adminRouter.get('/answers', adminController.getAdminAnswers);
adminRouter.get('/answer/:id', adminController.getAdminAnswerDetails);
adminRouter.put('/answer/:id', adminController.updateAnswer);


export default adminRouter;