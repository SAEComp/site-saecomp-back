import { Request, Response } from "express";
import { addDoc, collection, query, where, getDocs, getDoc, updateDoc, doc, serverTimestamp, getCountFromServer, collectionGroup, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../config/db/firebase_con";
import { IBaseQuery, ITeacher, ICourse, IFeedbacksQuery, IFeedbacksResponse, IUserFeedbacksQuery, IFeedbackCreator, IFeedbackUpdater } from "../interfaces/Feedback";
import { IFeedbacks, ITeachers, ICourses } from "../interfaces/FeedbackDatabase";



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
export async function getUserFeedbacks(req: Request, res: Response) {
    try {
        const _query: IUserFeedbacksQuery = {
            lastVisible: req.query.lastVisible ? String(req.query.lastVisible) : undefined,
            pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
            userId: req.query.userId ? String(req.query.userId) : undefined
        };
        if (!_query.userId) res.status(400).send("User not found");

        const colRef = collectionGroup(db, "feedbacks");



        let q = query(colRef, where('userId', '==', _query.userId), orderBy('createdAt'), limit(_query.pageSize + 1));

        if (_query.lastVisible) {
            const lastDocRef = doc(db, `feedbacks/${_query.lastVisible}`);
            const lastDoc = await getDoc(lastDocRef);
            if (lastDoc.exists()) {
                q = query(colRef, where('userId', '==', _query.userId), orderBy('createdAt'), startAfter(lastDoc), limit(_query.pageSize + 1));
            }
        }
        const _docs = await getDocs(q);

        const _feedbacks: IFeedbacksResponse[] = _docs.docs.map(doc => {
            const _data = doc.data() as IFeedbacks;
            return {
                feedbackId: doc.id,
                userId: String(_data.userId),
                teacherId: String(_data.teacherId),
                teacherName: String(_data.teacherName),
                courseId: String(_data.courseId),
                courseName: String(_data.courseName),
                rating: Number(_data.rating),
                positiveAspects: String(_data.positiveAspects),
                negativeAspects: String(_data.negativeAspects),
                additionalComments: String(_data.additionalComments),
                createdAt: String(_data.createdAt),
                updatedAt: String(_data.updatedAt)
            }
        });
        return res.status(200).send({
            data: _feedbacks,
            lastVisible: _docs.docs.length > 1 ? _docs.docs[_docs.docs.length - 2].id : null,
            hasNext: _docs.docs.length > _query.pageSize,
            pageSize: _query.pageSize
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send();
    }
}