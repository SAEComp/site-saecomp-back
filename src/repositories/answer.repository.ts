import pool from "../database/connection";
import { ApiError } from "../errors/ApiError";
import { AdminEvaluation, AdminAnswerDetails, AdminEvaluationDetails } from "../schemas/teacherEvaluation/output/adminAnswer.schema";
import { PublicAnswer, PublicAnswerDetails, PublicEvaluationDetails } from "../schemas/teacherEvaluation/output/answer.schema";
import { GetAdminAnswersParams, UpdateAnswerPayload } from "../schemas/teacherEvaluation/input/adminAnswer.schema";
import { GetPublicAnswersParams } from "../schemas/teacherEvaluation/input/answer.schema";


export async function findAdminAnswers(params: GetAdminAnswersParams) {
    const { page, pageSize, teacherId, courseId, status, semester } = params;
    const offset = (page - 1) * pageSize;

    const queryParams: any[] = [];
    let whereClauses = "WHERE 1 = 1";

    if (teacherId) {
        whereClauses += ` AND cl.teacher_id = $${queryParams.length + 1}`;
        queryParams.push(teacherId);
    }
    if (courseId) {
        whereClauses += ` AND cl.course_id = $${queryParams.length + 1}`;
        queryParams.push(courseId);
    }
    if (status) {
        whereClauses += ` AND e.status = $${queryParams.length + 1}`;
        queryParams.push(status);
    }
    if (semester) {
        whereClauses += ` AND s.code = $${queryParams.length + 1}`;
        queryParams.push(semester);
    }

    const baseQuery = `
    SELECT
      e.id AS "evaluationId", t.name AS "teacherName", c.name AS "courseName",
      c.code AS "courseCode", e.status,
      s.code AS "semester"
    FROM evaluations e
    JOIN classes cl ON e.class_id = cl.id
    JOIN teachers t ON cl.teacher_id = t.id
    JOIN courses c ON cl.course_id = c.id
    JOIN semesters s ON s.id = cl.semester_id
    ${whereClauses}
    ORDER BY e.created_at DESC
  `;

    const paginatedQuery = `${baseQuery} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const paginatedParams = [...queryParams, pageSize + 1, offset];

    const { rows } = await pool.query<AdminEvaluation>(paginatedQuery, paginatedParams);

    const isLastPage = rows.length <= pageSize;
    const answers = rows.slice(0, pageSize);

    return { isLastPage, answers };
}

export async function findAdminAnswerDetails(evaluationId: number) {
    const evaluationQuery = `
    SELECT
        e.id AS "evaluationId",
        u.name AS "userName",
        u.email AS "userEmail",
        u.nusp AS "userNusp",
        e.status,
        approved_by_user.name AS "approvedBy"
    FROM evaluations e
    LEFT JOIN users u ON e.user_id = u.id
    LEFT JOIN users approved_by_user ON e.approved_by = approved_by_user.id
    WHERE e.id = $1
  `;
    const evaluationResult = await pool.query<AdminEvaluationDetails>(evaluationQuery, [evaluationId]);
    if (evaluationResult.rows.length === 0) throw new ApiError(404, "Avaliação não encontrada");

    const evaluationDetails = evaluationResult.rows[0];

    const answersQuery = `
    SELECT
        q.id AS "questionId",
        q.type AS "questionType",
        q.question,
        a.question_order AS "order",
        a.answer,
        a.edited_answer AS "editedAnswer",
        edited_by_user.name AS "editedBy"
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    LEFT JOIN users edited_by_user ON a.edited_by = edited_by_user.id
    WHERE a.evaluation_id = $1
    ORDER BY a.question_order ASC, q.id ASC
  `;
    const answersResult = await pool.query<AdminAnswerDetails>(answersQuery, [evaluationId]);

    return { ...evaluationDetails, answers: answersResult.rows };
}

export async function updateEvaluationStatusAndAnswers(evaluationId: number, data: UpdateAnswerPayload, adminUserId: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (data.status) {
            const approvedByClause = data.status === 'approved' ? `, approved_by = $2` : '';
            const params: any[] = data.status === 'approved' ? [data.status, adminUserId, evaluationId] : [data.status, evaluationId];
            const updateStatusQuery = `UPDATE evaluations SET status = $1 ${approvedByClause} WHERE id = $${params.length}`;
            const result = await client.query(updateStatusQuery, params);
            if (result.rowCount === 0) throw new ApiError(404, "Avaliação não encontrada");
        }

        if (data.answers && data.answers.length > 0) {
            for (const answer of data.answers) {
                const updateAnswerQuery = `UPDATE answers SET edited_answer = $1, edited_by = $2 WHERE evaluation_id = $3 AND question_id = $4`;
                await client.query(updateAnswerQuery, [answer.editedAnswer, adminUserId, evaluationId, answer.questionId]);
            }
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

export async function findPublicAnswers(params: GetPublicAnswersParams) {
    const { page, pageSize, teacherId, courseId } = params;
    const offset = (page - 1) * pageSize;

    const queryParams: any[] = [];
    let whereClauses = "WHERE e.status = 'approved'";

    if (teacherId) {
        whereClauses += ` AND c.teacher_id = $${queryParams.length + 1}`;
        queryParams.push(teacherId);
    }
    if (courseId) {
        whereClauses += ` AND co.id = $${queryParams.length + 1}`;
        queryParams.push(courseId);
    }


    const listQuery = `
        select
            c.id as "classId",
            c.teacher_id as "teacherId",
            t.name as "teacherName",
            co."name" as "courseName",
            co.code as "courseCode",
            co.id as "courseId",
            i."name" as "instituteName",
            i.code as "instituteCode",
            d."name" as "departmentName",
            d.code as "departmentCode",
            AVG(e.score)::FLOAT as "averageScore",
            s.code as "semesterCode"
        from
            classes c
        join evaluations e on
            e.class_id = c.id
        join teachers t on
            t.id = c.teacher_id
        join courses co on
            co.id = c.course_id
        join departments d on
            d.id  = co.department_id 
        join institutes i on
            i.id = co.institute_id 
        join semesters s on
	        s.id = c.semester_id 
        ${whereClauses}
        group by
            c.id,
            t."name",
            co.id,
            i."name",
            i."code",
            d."name",
            d."code",
            s."code"
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `

    const listParams = [...queryParams, pageSize + 1, offset];
    const { rows: evaluationRows } = await pool.query<PublicAnswer>(listQuery, listParams);

    const isLastPage = evaluationRows.length <= pageSize;
    const teacherGeneralInfo = evaluationRows.slice(0, pageSize);

    return { isLastPage, teacherGeneralInfo };
}

export async function findPublicAnswerDetails(classId: number) {

    const answersQuery =
        `select
	c.id as "classId",
	e.id as "evaluationId",
	q.id as "questionId",
	q."type" as "questionType",
	q.question as "question",
	a.answer as "answerText"
from
	classes c
join evaluations e on
	e.class_id = c.id
join answers a on
a.evaluation_id = e.id
join questions q on
q.id = a.question_id 
where
	c.id = $1 and e.status = 'approved'`

    const { rows: answersResult } = await pool.query<PublicAnswerDetails>(answersQuery, [classId]);

    try {
        return { answers: answersResult };
    } catch (error) {

        console.error("Erro de validação dos dados do banco:", error);
        throw new Error("Os dados recebidos do banco de dados são inválidos.");
    }
}