import { Router } from "express";
import { getTeachers, getCourses, getFeedbacks, getUserFeedbacks, createFeedback, deleteFeedback, updateFeedback } from "../controllers/FeedbackController";

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

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Returns a list of teachers with feedbacks
 *     tags: [Teachers]
 *     parameters:
 *       - in: query
 *         name: lastVisible
 *         schema:
 *           type: string
 *         description: The last document ID from previous page for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Teacher'
 *                 lastVisible:
 *                   type: string
 *                   nullable: true
 *                   description: The last document ID for pagination
 *                 hasNext:
 *                   type: boolean
 *                   description: Indicates if there is a next page
 *                 pageSize:
 *                   type: integer
 *                   description: Number of items per page
 *       500:
 *         description: Internal server error
 */
TeacherRouter.get(
    "/teachers",
    getTeachers
);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Returns a list of courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: lastVisible
 *         schema:
 *           type: string
 *         description: The last document ID from previous page for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 lastVisible:
 *                   type: string
 *                   nullable: true
 *                   description: The last document ID for pagination
 *                 hasNext:
 *                   type: boolean
 *                   description: Indicates if there is a next page
 *                 pageSize:
 *                   type: integer
 *                   description: Number of items per page
 *       500:
 *         description: Internal server error
 */
TeacherRouter.get(
    "/courses",
    getCourses
);

/**
 * @swagger
 * /userFeedbacks:
 *   get:
 *     summary: Returns all feedbacks made by a user
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User's unique identifier
 *       - in: query
 *         name: lastVisible
 *         schema:
 *           type: string
 *         description: The last document ID from previous page for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of feedbacks by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeedbackResponse'
 *                 lastVisible:
 *                   type: string
 *                   nullable: true
 *                   description: The last document ID for pagination
 *                 hasNext:
 *                   type: boolean
 *                   description: Indicates if there is a next page
 *                 pageSize:
 *                   type: integer
 *                   description: Number of items per page
 *       400:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
TeacherRouter.get(
    "/userFeedbacks",
    getUserFeedbacks
);

/**
 * @swagger
 * /feedbacks:
 *   get:
 *     summary: Returns all feedbacks based on query
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: query
 *         name: courseName
 *         schema:
 *           type: string
 *         description: Filter feedbacks by course name
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter feedbacks by course ID
 *       - in: query
 *         name: teacherName
 *         schema:
 *           type: string
 *         description: Filter feedbacks by teacher name
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *         description: Filter feedbacks by teacher ID
 *       - in: query
 *         name: lastVisible
 *         schema:
 *           type: string
 *         description: The last document ID from previous page for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeedbackResponse'
 *                 lastVisible:
 *                   type: string
 *                   nullable: true
 *                   description: The last document ID for pagination
 *                 hasNext:
 *                   type: boolean
 *                   description: Indicates if there is a next page
 *                 pageSize:
 *                   type: integer
 *                   description: Number of items per page
 *       500:
 *         description: Internal server error
 */
TeacherRouter.get(
    "/feedbacks",
    getFeedbacks
);

/**
 * @swagger
 * /feedbacks:
 *   post:
 *     summary: Creates a new feedback
 *     tags: [Feedbacks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackCreator'
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       400:
 *         description: Bad request (missing or invalid parameters)
 *       500:
 *         description: Internal server error
 */
TeacherRouter.post(
    "/feedbacks",
    createFeedback
);

/**
 * @swagger
 * /feedbacks/{feedbackId}:
 *   put:
 *     summary: Updates a feedback
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the feedback to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackUpdater'
 *     responses:
 *       204:
 *         description: Feedback updated successfully
 *       400:
 *         description: Bad request (missing or invalid parameters)
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
TeacherRouter.put(
    "/feedbacks/:feedbackId",
    updateFeedback
);

/**
 * @swagger
 * /feedbacks/{feedbackId}:
 *   delete:
 *     summary: Deletes a feedback
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the feedback to delete
 *     responses:
 *       204:
 *         description: Feedback deleted successfully
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
TeacherRouter.delete(
    "/feedbacks/:feedbackId",
    deleteFeedback
);

export default TeacherRouter;
