import pool from "../database/connection";
import { IAnswer, IEvaluation } from "../schemas/input/evaluation.schema";
import { Classes } from "../schemas/output/evaluation.schema";

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
        const semester = month < 6 ? 1 : 2; // Semestre 1 (Jan-Jun), Semestre 2 (Jul-Dec)
        query += ` WHERE s.code = $1`;
        // params.push(`${year}-${semester}`);
        params.push(`2024-2`);
    }

    const { rows } = await pool.query<Classes>(query, params);
    return rows;
}


export async function checkIfClassExists(classes: { classId: number }[]): Promise<boolean> {
    if (classes.length === 0) return true;

    const ids = [...new Set(classes.map(({ classId }) => classId))];

    const query = `
    SELECT COUNT(*)::int AS found
    FROM classes
    WHERE id = ANY($1::int[])
  `;
    const { rows } = await pool.query(query, [ids]);

    return rows[0].found === ids.length;
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

    const query = `
        INSERT INTO answers (evaluation_id, question_id, answer, question_order)
        VALUES ${answers.map((_, i) => `($1, $${2 * i + 2}, $${2 * i + 3}, $${2 * i + 4})`).join(', ')}
    `;
    const params = [evaluationId, ...answers.flatMap(ans => [ans.questionId, ans.answer, ans.order])];

    await pool.query(query, params);
}