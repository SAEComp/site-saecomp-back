import pool from "../database/connection";
import { IAnswer, IEvaluation } from "../schemas/teacherEvaluation/input/evaluation.schema";
import { Classes } from "../schemas/teacherEvaluation/output/evaluation.schema";
import { Teacher, Course } from "../schemas/teacherEvaluation/output/evaluation.schema";

export async function findClasses(idealYear?: number): Promise<Classes[]> {
    let query = `
        SELECT 
            cl.id as "classId",
            t.id as "teacherId", 
            t.name as "teacherName", 
            c.id as "courseId", 
            c.name as "courseName", 
            c.code as "courseCode"
        FROM classes cl
        JOIN teachers t ON t.id = cl.teacher_id
        JOIN courses c ON c.id = cl.course_id
        JOIN semesters s ON s.id = cl.semester_id
    `;
    const params: any[] = [];

    if (idealYear) {
        query += " WHERE cl.ideal_year = $1";
        params.push(idealYear);
    } else {
        // Lógica para pegar o semestre atual
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11
        const semester = month < 9 && month > 3 ? 1 : 2; // Semestre 1 (Jan-Jun), Semestre 2 (Jul-Dec)
        query += ` WHERE s.code = $1`;
        params.push(`${year}-${semester}`);
    }

    const { rows } = await pool.query<Classes>(query, params);
    return rows;
}

export async function findTeachers(): Promise<Teacher[]> {
    const query = `
        SELECT id as "teacherId", name as "teacherName"
        FROM teachers
        ORDER BY name ASC
    `;
    const { rows } = await pool.query<Teacher>(query);
    return rows;
}

export async function findCourses(): Promise<Course[]> {
    const query = `
        SELECT id as "courseId", name as "courseName", code as "courseCode"
        FROM courses
        ORDER BY name ASC
    `;
    const { rows } = await pool.query<Course>(query);
    return rows;
}

export async function checkIfClassExists(
    classes: { classId?: number, teacherId?: number, courseId?: number }[]
): Promise<{ classId: number, teacherId?: number, courseId?: number }[] | null> {
    if (classes.length === 0) return [];

    const result: { classId: number, teacherId?: number, courseId?: number }[] = [];

    // Verifica classes já existentes
    const ids = classes.filter(c => c.classId !== undefined).map(({ classId }) => classId);
    if (ids.length > 0) {
        const query = `
            SELECT id FROM classes
            WHERE id = ANY($1::int[])
        `;
        const { rows } = await pool.query<{ id: number }>(query, [ids]);
        if (rows.length !== ids.length) return null;
        // Adiciona ao resultado apenas o classId
        for (const id of ids) {
            result.push({ classId: id! });
        }
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const semester = month < 9 && month > 3 ? 1 : 2;
    const semesterCode = `${year}-${semester}`;

    const semesterRes = await pool.query<{ id: number }>(
        `SELECT id FROM semesters WHERE code = $1`, [semesterCode]
    );
    if (semesterRes.rowCount === 0) return null;
    const semesterId = semesterRes.rows[0].id;

    for (const c of classes) {
        if (!c.classId && c.teacherId && c.courseId) {
            const insertRes = await pool.query<{ id: number }>(
                `INSERT INTO classes (teacher_id, course_id, semester_id) VALUES ($1, $2, $3) RETURNING id`,
                [c.teacherId, c.courseId, semesterId]
            );
            result.push({
                classId: insertRes.rows[0].id,
                teacherId: c.teacherId,
                courseId: c.courseId
            });
        } else if (!c.classId && (!c.teacherId || !c.courseId)) {
            return null;
        }
    }

    return result;
}

export async function createEvaluation(
    userId: number,
    evaluation: Omit<IEvaluation, 'answers'> & { score: number | null }
): Promise<number> {
    const query = `
        INSERT INTO evaluations (user_id, class_id, score)
        VALUES ($1, $2, $3)
        RETURNING id;
    `;
    const params = [userId, evaluation.classId, evaluation.score];

    const { rows } = await pool.query(query, params);
    return rows[0].id;
}

export async function createAnswers(
    evaluationId: number,
    answers: (IAnswer & { order: number })[]
): Promise<void> {
    if (answers.length === 0) return;

    const valuesClause = answers.map((_, i) => {
        const offset = i * 4;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    }).join(', ');

    const query = `
  INSERT INTO answers (evaluation_id, question_id, answer, question_order)
  VALUES ${valuesClause}
`;

    const params = answers.flatMap(ans => [
        evaluationId,
        ans.questionId,
        ans.answer,
        ans.order
    ]);

    await pool.query(query, params);

}