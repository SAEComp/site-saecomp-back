import pool from "../database/connection";
import { ApiError } from "../errors/ApiError";
import { AdminEvaluation, AdminAnswerDetails, AdminEvaluationDetails } from "../schemas/output/adminAnswer.schema";
import { PublicAnswer, PublicAnswerDetails, PublicEvaluationDetails } from "../schemas/output/answer.schema";
import { GetAdminAnswersParams, UpdateAnswerPayload } from "../schemas/input/adminAnswer.schema";
import { GetPublicAnswersParams } from "../schemas/input/answer.schema";


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
        whereClauses += ` AND cl.teacher_id = $${queryParams.length + 1}`;
        queryParams.push(teacherId);
    }
    if (courseId) {
        whereClauses += ` AND cl.course_id = $${queryParams.length + 1}`;
        queryParams.push(courseId);
    }

    const listQuery = `
    SELECT
      e.id AS "evaluationId", t.name AS "teacherName", t.id AS "teacherId",
      c.name AS "courseName", c.code AS "courseCode", e.score::FLOAT AS "score"
    FROM evaluations e
    JOIN classes cl ON cl.id = e.class_id
    JOIN teachers t ON cl.teacher_id = t.id
    JOIN courses c ON cl.course_id = c.id
    ${whereClauses}
    ORDER BY e.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;
    const listParams = [...queryParams, pageSize + 1, offset];
    const { rows: evaluationRows } = await pool.query<PublicAnswer>(listQuery, listParams);

    const scoreQuery = `
    SELECT AVG(e.score)::FLOAT AS "overallScore"
    FROM evaluations e
    JOIN classes cl ON cl.id = e.class_id
    ${whereClauses};
    `;

    const scoreResult = await pool.query(scoreQuery, queryParams);

    const score = scoreResult.rows[0]?.overallScore ? parseFloat(scoreResult.rows[0].overallScore) : null;

    const isLastPage = evaluationRows.length <= pageSize;
    const evaluations = evaluationRows.slice(0, pageSize);

    return { isLastPage, score, evaluations };
}

export async function findPublicAnswerDetails(evaluationId: number) {
    const evaluationQuery = `
    SELECT
        e.id AS "evaluationId",
        t.name AS "teacherName",
        t.id AS "teacherId",
        c.name AS "courseName",
        c.code AS "courseCode",
        c.id AS "courseId",
        i.name AS "instituteName",
        i.code AS "instituteCode",
        d.name AS "departmentName",
        d.code AS "departmentCode"
    FROM evaluations e
    JOIN classes cl ON cl.id = e.class_id
    JOIN teachers t ON cl.teacher_id = t.id
    JOIN courses c ON cl.course_id = c.id
    JOIN institutes i ON c.institute_id = i.id
    JOIN departments d ON c.department_id = d.id
    WHERE e.id = $1 AND e.status = 'approved'
  `;
    const evaluationResult = await pool.query<PublicEvaluationDetails>(evaluationQuery, [evaluationId]);

    if (evaluationResult.rows.length === 0) throw new ApiError(404, "Avaliação não encontrada ou não aprovada.");

    const evaluationDetails = evaluationResult.rows[0];

    const answersQuery = `
    SELECT
        q.id AS "questionId",
        q.type AS "questionType",
        q.question,
        COALESCE(a.edited_answer, a.answer) AS "answer"
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE a.evaluation_id = $1
    ORDER BY a.question_order ASC, q.id ASC
  `;
    const answersResult = await pool.query<PublicAnswerDetails>(answersQuery, [evaluationId]);

    return { ...evaluationDetails, answers: answersResult.rows };
}