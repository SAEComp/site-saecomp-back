import { Request, Response } from "express";
import { addDoc, collection, query, where, getDocs, getDoc, updateDoc, doc, serverTimestamp, getCountFromServer, collectionGroup, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../config/db/firebase_con";
import { IBaseQuery, ITeacher, ICourse, IFeedbacksQuery, IFeedbacksResponse, IUserFeedbacksQuery, IFeedbackCreator, IFeedbackUpdater } from "../interfaces/Feedback";
import { IFeedbacks, ITeachers, ICourses } from "../interfaces/FeedbackDatabase";


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
export async function getCourses(req: Request, res: Response) {
    try {
        const _query: IBaseQuery = {
            lastVisible: req.query.lastVisible ? String(req.query.lastVisible) : undefined,
            pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10
        };
        const colRef = collectionGroup(db, "courses");
        let q = query(colRef, orderBy('courseName'), limit(_query.pageSize + 1));
        if (_query.pageSize < 0) q = query(colRef, orderBy('courseName'));

        if (_query.lastVisible) {
            const lastDocRef = doc(db, `courses/${_query.lastVisible}`);
            const lastDoc = await getDoc(lastDocRef);
            if (lastDoc.exists()) {
                q = query(colRef, orderBy('courseName'), startAfter(lastDoc), limit(_query.pageSize + 1));
            }
        }
        const _docs = await getDocs(q);
        const courses: ICourse[] = _docs.docs.map(doc => {
            const _data = doc.data() as ICourses;
            return {
                courseId: doc.id,
                courseName: _data.courseName,
                courseCode: _data.courseCode
            };
        });
        return res.status(200).send({
            data: courses,
            lastVisible: _docs.docs.length > 1 ? _docs.docs[_docs.docs.length - 2].id : null,
            hasNext: _docs.docs.length > _query.pageSize,
            pageSize: _query.pageSize
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send();
    }
}