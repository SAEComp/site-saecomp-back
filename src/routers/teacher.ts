import { Router } from "express";
import { getTeachers } from "../controllers/getTeachers";
import { getCourses } from "../controllers/getCourses";
import { getFeedbacks } from "../controllers/getFeedbacks";
import { getUserFeedbacks } from "../controllers/getUserFeedbacks";
import { createFeedback } from "../controllers/createFeedback";
import { deleteFeedback } from "../controllers/deleteFeedback";
import { updateFeedback } from "../controllers/updateFeedback";
import { createEvaluation } from "../controllers/createEvaluation";
import { getTeachersCourses } from "../controllers/getTeachersCourses";


const TeacherRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: Teacher management
 */

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */

/**
 * @swagger
 * tags:
 *   name: Feedbacks
 *   description: Feedback management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         teacherId:
 *           type: string
 *           description: Teacher's unique identifier
 *         teacherName:
 *           type: string
 *           description: Teacher's name
 *         rating:
 *           type: number
 *           description: Teacher's average rating
 *     Course:
 *       type: object
 *       properties:
 *         courseId:
 *           type: string
 *           description: Course's unique identifier
 *         courseName:
 *           type: string
 *           description: Course name
 *         courseCode:
 *           type: string
 *           description: Course code
 *     FeedbackResponse:
 *       type: object
 *       properties:
 *         feedbackId:
 *           type: string
 *         userId:
 *           type: string
 *         teacherId:
 *           type: string
 *         teacherName:
 *           type: string
 *         courseId:
 *           type: string
 *         courseName:
 *           type: string
 *         rating:
 *           type: number
 *         positiveAspects:
 *           type: string
 *         negativeAspects:
 *           type: string
 *         additionalComments:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     FeedbackCreator:
 *       type: object
 *       required:
 *         - userId
 *         - teacherId
 *         - courseId
 *         - rating
 *         - positiveAspects
 *         - negativeAspects
 *         - additionalComments
 *       properties:
 *         userId:
 *           type: string
 *         teacherId:
 *           type: string
 *         courseId:
 *           type: string
 *         rating:
 *           type: number
 *         positiveAspects:
 *           type: string
 *         negativeAspects:
 *           type: string
 *         additionalComments:
 *           type: string
 *     FeedbackUpdater:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *         positiveAspects:
 *           type: string
 *         negativeAspects:
 *           type: string
 *         additionalComments:
 *           type: string
 */

TeacherRouter.get(
    "/teachers",
    getTeachers
);

TeacherRouter.get(
    "/courses",
    getCourses
);


TeacherRouter.get(
    "/userFeedbacks",
    getUserFeedbacks
);


TeacherRouter.get(
    "/feedbacks",
    getFeedbacks
);


TeacherRouter.post(
    "/feedbacks",
    createFeedback
);


TeacherRouter.put(
    "/feedbacks/:feedbackId",
    updateFeedback
);


TeacherRouter.delete(
    "/feedbacks/:feedbackId",
    deleteFeedback
);

TeacherRouter.post("/evaluation/create", createEvaluation);

TeacherRouter.get("/evaluation/teachers-courses", getTeachersCourses);


export default TeacherRouter;
