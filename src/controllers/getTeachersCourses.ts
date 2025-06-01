import { Request, Response } from "express";
import { z } from 'zod';
import { getTeachersCoursesSchema } from "../schemas/getTeachersCourses.schema";
import { IGetTeachersCoursesOut } from "../interfaces/getTeachersCourses.interface";
import getTeachersCoursesData from "../repositories/getTeachersCoursesData";

/**
 * @swagger
 * /evaluation/teachers-courses:
 *   get:
 *     summary: Retorna a relação curso-professor
 *     tags: [Evaluation]
 *     parameters:
 *       - in: query
 *         name: idealYear
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Ano do período ideal (ex 23, 25)
 *     responses:
 *       200:
 *         description: Lista de relações curso-professor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       teacherId:
 *                         type: integer
 *                       teacherName:
 *                         type: string
 *                       courseId:
 *                         type: integer
 *                       courseName:
 *                         type: string
 *                       courseCode:
 *                         type: string
 *       400:
 *         description: Erro de validação nos parâmetros da query
 *       500:
 *         description: Erro interno do servidor
 */
async function getTeachersCourses(req: Request, res: Response) {
    try {
        const { idealYear } = getTeachersCoursesSchema.parse(req.query);

        const teachersCoursesData = await getTeachersCoursesData(idealYear);

        const response: IGetTeachersCoursesOut = {
            results: teachersCoursesData
        };
        res.json(response);
    } catch (error) {
        console.log(error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
            return;
        };
        res.status(500).json({ error: 'Internal server error' });
    }
}

export default getTeachersCourses;