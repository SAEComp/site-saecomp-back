import { Request, Response } from "express";
import { addDoc, collection, query, where, getDocs, getDoc, updateDoc, doc, serverTimestamp, getCountFromServer, collectionGroup, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../config/db/firebase_con";
import { IBaseQuery, ITeacher, ICourse, IFeedbacksQuery, IFeedbacksResponse, IUserFeedbacksQuery, IFeedbackCreator, IFeedbackUpdater } from "../interfaces/Feedback";
import { IFeedbacks, ITeachers, ICourses } from "../interfaces/FeedbackDatabase";



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
export async function getFeedbacks(req: Request, res: Response) {
    try {
        const _query: IFeedbacksQuery = {
            lastVisible: req.query.lastVisible ? String(req.query.lastVisible) : undefined,
            pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
            courseName: req.query.courseName ? String(req.query.courseName) : undefined,
            courseId: req.query.courseId ? String(req.query.courseId) : undefined,
            teacherName: req.query.teacherName ? String(req.query.teacherName) : undefined,
            teacherId: req.query.teacherId ? String(req.query.teacherId) : undefined,
        }
        const colRef = collectionGroup(db, "feedbacks");

        let queryArgs = [];

        if (_query.courseId) queryArgs.push(where('courseId', '==', _query.courseId));
        else if (_query.courseName) queryArgs.push(where('courseName', '==', _query.courseName));


        if (_query.teacherId) queryArgs.push(where('teacherId', '==', _query.teacherId));
        else if (_query.teacherName) queryArgs.push(where('teacherName', '==', _query.teacherName));


        let q = query(colRef, ...queryArgs, orderBy('createdAt', 'desc'), limit(_query.pageSize + 1));

        if (_query.lastVisible) {
            const lastDocRef = doc(db, `feedbacks/${_query.lastVisible}`);
            const lastDoc = await getDoc(lastDocRef);
            if (lastDoc.exists()) {
                q = query(colRef, ...queryArgs, orderBy('createdAt'), startAfter(lastDoc), limit(_query.pageSize + 1));
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

    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
}