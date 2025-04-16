import { Request, Response } from "express";
import { addDoc, collection, query, where, getDocs, getDoc, updateDoc, doc, serverTimestamp, getCountFromServer, collectionGroup, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../config/db/firebase_con";
import { IBaseQuery, ITeacher, ICourse, IFeedbacksQuery, IFeedbacksResponse, IUserFeedbacksQuery, IFeedbackCreator, IFeedbackUpdater } from "../interfaces/Feedback";
import { IFeedbacks, ITeachers, ICourses } from "../interfaces/FeedbackDatabase";


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
export async function updateFeedback(req: Request, res: Response) {
    try {
        const _body: IFeedbackUpdater = {
            rating: req.body.rating ? Number(req.body.rating) : undefined,
            positiveAspects: req.body.positiveAspects ? String(req.body.positiveAspects) : undefined,
            negativeAspects: req.body.negativeAspects ? String(req.body.negativeAspects) : undefined,
            additionalComments: req.body.additionalComments ? String(req.body.additionalComments) : undefined
        }
        const feedbackId = req.params.feedbackId;
        const feedbackRef = doc(db, `feedback/${feedbackId}`);
        const feedbackDoc = await getDoc(feedbackRef);
        if (!feedbackDoc.exists()) return res.status(404).send("Feedback not found");
        await updateDoc(feedbackRef, {
            ..._body,
            updatedAt: serverTimestamp()
        });
        
        // atualizar rating 
        if (_body.rating !== undefined) {
            const teacherRef = doc(db, `teachers/${feedbackDoc.data().teacherId}`);
            const teacherDoc = await getDoc(teacherRef);
            if (!teacherDoc.exists()) return res.status(404).send("Teacher not found");
            
            const newRating = (teacherDoc.data().rating * teacherDoc.data().ratingCount - feedbackDoc.data().rating + _body.rating) / teacherDoc.data().ratingCount;
            await updateDoc(teacherRef, {
                rating: newRating
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.log(error)
        return res.status(500).send();
    }
}
