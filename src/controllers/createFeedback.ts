import { Request, Response } from "express";
import { addDoc, collection, query, where, getDocs, getDoc, updateDoc, doc, serverTimestamp, getCountFromServer } from "firebase/firestore";
import { db } from "../../config/db/firebase_con";
import { createFeedbackSchema } from "../schemas/createFeedback.schema";
import { z } from 'zod';

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
export async function createFeedback(req: Request, res: Response) {
    try {
        const body = createFeedbackSchema.parse(req.body);

        // verficiar se o profesor existe
        const teacherRef = doc(db, `teachers/${body.teacherId}`);
        const teacherDoc = await getDoc(teacherRef);
        if (!teacherDoc.exists()) return res.status(404).send("Teacher not found");
        // verificar se o curso existe
        const courseRef = doc(db, `courses/${body.courseId}`);
        const courseDoc = await getDoc(courseRef);
        if (!courseDoc.exists()) return res.status(404).send("Course not found");

        const colRef = collection(db, "feedbacks");

        // por enquanto o aluno so faz uma avaliacao por disciplina uma unica vez
        // fazer limitacao de uma avaliacao por semestre (periodo de avalicao)
        const q = query(colRef, where("userId", "==", `${body.userId}`), where("deleted", "==", false));
        const querySnapshot = getCountFromServer(q);
        const numberOfFeedbacks = (await querySnapshot).data().count;

        if (numberOfFeedbacks < 1) {
            await addDoc(colRef, {
                user: body.userId,
                teacherId: body.teacherId,
                teacherName: teacherDoc.data().teacherName,
                courseId: body.courseId,
                courseName: courseDoc.data().courseName,
                rating: body.rating,
                positiveAspects: body.positiveAspects,
                negativeAspects: body.negativeAspects,
                additionalComments: body.additionalComments,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deleted: false
            });
            // atualizar rating
            const newRating = (teacherDoc.data().rating * teacherDoc.data().ratingCount + body.rating) / (teacherDoc.data().ratingCount + 1);
            await updateDoc(teacherRef, {
                rating: newRating,
                ratingCount: teacherDoc.data().ratingCount + 1
            });
            return res.status(201).send();
        }
        else {
            return res.status(400).send("You already have a feedback for this course.");
        }

    } catch (error) {
        console.log(error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
            return;
        };
        res.status(500).json({ error: 'Internal server error' });
    };
}
