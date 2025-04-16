import { Request, Response } from "express";
import { addDoc, collection, query, where, getDocs, getDoc, updateDoc, doc, serverTimestamp, getCountFromServer, collectionGroup, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../config/db/firebase_con";
import { IBaseQuery, ITeacher, ICourse, IFeedbacksQuery, IFeedbacksResponse, IUserFeedbacksQuery, IFeedbackCreator, IFeedbackUpdater } from "../interfaces/Feedback";
import { IFeedbacks, ITeachers, ICourses } from "../interfaces/FeedbackDatabase";


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
export async function deleteFeedback(req: Request, res: Response) {
    try {
        const feedbackId = req.params.feedbackId;
        const feedbackRef = doc(db, `feedback/${feedbackId}`);
        const feedbackDoc = await getDoc(feedbackRef);
        if (!feedbackDoc.exists()) return res.status(404).send("Feedback not found");

        await updateDoc(feedbackRef, {
            deleted: true,
            deletedAt: serverTimestamp()
        });
        // atualizar rating
        const teacherRef = doc(db, `teachers/${feedbackDoc.data().teacherId}`);
        const teacherDoc = await getDoc(teacherRef);
        if (!teacherDoc.exists()) return res.status(404).send("Teacher not found");
        const newRating = (teacherDoc.data().rating * teacherDoc.data().ratingCount - feedbackDoc.data().rating) / teacherDoc.data().ratingCount;
        await updateDoc(teacherRef, {
            rating: newRating,
            ratingCount: teacherDoc.data().ratingCount - 1
        });

        return res.status(204).send()
    } catch (error) {
        console.log(error);
        return res.status(500).send();
    }
}
