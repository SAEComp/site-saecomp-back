import { Request, Response } from "express";
import { addDoc, collection, query, where, getDocs, getDoc, updateDoc, doc, serverTimestamp, getCountFromServer, collectionGroup, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../config/db/firebase_con";
import { IBaseQuery, ITeacher, ICourse, IFeedbacksQuery, IFeedbacksResponse, IUserFeedbacksQuery, IFeedbackCreator, IFeedbackUpdater } from "../interfaces/Feedback";
import { IFeedbacks, ITeachers, ICourses } from "../interfaces/FeedbackDatabase";

/*
Proposta de organização:

===> firebase <===
-> Collection: feedbacks
{
    userId: string;
    teacherId: string;
    teacherName: string;
    courseId: string;
    courseName: string;
    rating: number;
    positiveAspects: string;
    negativeAspects: string;
    additionalComments: string;
    createdAt: timestamp;
    updatedAt: timestamp;
    deletedAt: timestamp;
    deleted: boolean;
}   

-> Collection: teachers
{
    teacherName: string;
    teacherNickname: string;
    rating: number;
    ratingCount: number;
    courses: [courseId: string];
}

-> Collection: courses
{
    courseName: string;
    courseCode: string;
    teachers: [teacherId: string];
}

===> routes <===

GET /teachers
-> retorna os professores com avaliacoes
query: {
    page: number;
    pageSize: number;
}
returns: 200 OK
[
    {
        teacherId: string;
        teacherName: string;
    }
]

GET /feedbacks
-> retorna todas as avaliações com base na query
query: {
    courseName: string;
    courseId: string;
    teacherName: string;
    teacherId: string;
    page: number;
    pageSize: number;
}
returns: 200 OK
[
    {
        feedbackId: string;
        userId: string;
        teacherId: string;
        teacherName: string;
        courseId: string;
        courseName: string;
        rating: number;
        positiveAspects: string;
        negativeAspects: string;
        additionalComments: string;
        createdAt: timestamp;
        updatedAt: timestamp;
    },
]

GET /feedbacks/:userId
-> retorna todas as avaliações feitas por um usuário
query: {
    page: number;
    pageSize: number;
}
returns: 200 OK
[
    {
        feedbackId: string;
        teacherId: string;
        teacherName: string;
        courseId: string;
        courseName: string;
        rating: number;
        positiveAspects: string;
        negativeAspects: string;
        additionalComments: string;
        createdAt: timestamp;
        updatedAt: timestamp;
    },
]

PUT /feedbacks
-> cria uma nova avaliação
body: {
    userId: string;
    teacherId: string;
    courseId: string;
    rating: number;
    positiveAspects: string;
    negativeAspects: string;
    additionalComments: string;
}
returns: 201 Created
400 Bad Request (com mensagem de erro)

POST /feedbacks/:feedbackId
-> atualiza uma avaliação
body: {
    rating: number;
    positiveAspects: string;
    negativeAspects: string;
    additionalComments: string;
}
returns: 204 No Content
400 Bad Request (com mensagem de erro)
404 Not Found (com mensagem de erro)

DELETE /feedbacks/:feedbackId
-> apaga uma avaliação
returns: 204 No Content
404 Not Found (com mensagem de erro)

*/


export async function getTeachers(req: Request, res: Response) {
    try {
        const _query: IBaseQuery = {
            lastVisible: req.query.lastVisible ? String(req.query.lastVisible) : undefined,
            pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10
        };
        const colRef = collectionGroup(db, "teachers");
        let q = query(colRef, orderBy('teacherName'), limit(_query.pageSize + 1));
        if (_query.pageSize < 0) q = query(colRef, orderBy('teacherName'));

        if (_query.lastVisible) {
            const lastDocRef = doc(db, `teachers/${_query.lastVisible}`);
            const lastDoc = await getDoc(lastDocRef);
            if (lastDoc.exists()) {
                q = query(colRef, orderBy('teacherName'), startAfter(lastDoc), limit(_query.pageSize + 1));
            }
        }
        const _docs = await getDocs(q);
        const teachers: ITeacher[] = _docs.docs.map(doc => {
            const _data = doc.data() as ITeachers;
            return {
                teacherId: doc.id,
                teacherName: _data.teacherName,
                rating: _data.rating
            };
        });
        return res.status(200).send({
            data: teachers,
            lastVisible: _docs.docs.length > 1 ? _docs.docs[_docs.docs.length - 2].id : null,
            hasNext: _docs.docs.length > _query.pageSize,
            pageSize: _query.pageSize
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send();
    }
}

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


export async function createFeedback(req: Request, res: Response) {
    try {
        if (req.body.userId === undefined) return res.status(400).send("Missing userId");
        if (req.body.teacherId === undefined) return res.status(400).send("Missing teacherId");
        if (req.body.courseId === undefined) return res.status(400).send("Missing courseId");
        if (req.body.rating === undefined) return res.status(400).send("Missing rating");
        if (req.body.positiveAspects === undefined) return res.status(400).send("Missing positiveAspects");
        if (req.body.negativeAspects === undefined) return res.status(400).send("Missing negativeAspects");
        if (req.body.additionalComments === undefined) return res.status(400).send("Missing additionalComments");
        const _body: IFeedbackCreator = {
            userId: req.body.userId,
            teacherId: req.body.teacherId,
            courseId: req.body.courseId,
            rating: Number(req.body.rating),
            positiveAspects: req.body.positiveAspects,
            negativeAspects: req.body.negativeAspects,
            additionalComments: req.body.additionalComments
        }
        // verficiar se o profesor existe
        const teacherRef = doc(db, `teachers/${_body.teacherId}`);
        const teacherDoc = await getDoc(teacherRef);
        if (!teacherDoc.exists()) return res.status(404).send("Teacher not found");
        // verificar se o curso existe
        const courseRef = doc(db, `courses/${_body.courseId}`);
        const courseDoc = await getDoc(courseRef);
        if (!courseDoc.exists()) return res.status(404).send("Course not found");

        const colRef = collection(db, "feedbacks");

        // por enquanto o aluno so faz uma avaliacao por disciplina uma unica vez
        // fazer limitacao de uma avaliacao por semestre (periodo de avalicao)
        const q = query(colRef, where("userId", "==", `${_body.userId}`), where("deleted", "==", false));
        const querySnapshot = getCountFromServer(q);
        const numberOfFeedbacks = (await querySnapshot).data().count;

        if (numberOfFeedbacks < 1) {
            await addDoc(colRef, {
                user: _body.userId,
                teacherId: _body.teacherId,
                teacherName: teacherDoc.data().teacherName,
                courseId: _body.courseId,
                courseName: courseDoc.data().courseName,
                rating: _body.rating,
                positiveAspects: _body.positiveAspects,
                negativeAspects: _body.negativeAspects,
                additionalComments: _body.additionalComments,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deleted: false
            });
            // atualizar rating
            const newRating = (teacherDoc.data().rating * teacherDoc.data().ratingCount + _body.rating) / (teacherDoc.data().ratingCount + 1);
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
        return res.status(500).send();
    }
}

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
