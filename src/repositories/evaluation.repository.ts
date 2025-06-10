import pool from "../database/connection";
import { Evaluation } from "../types/entities";

export async function findTeachersCourses(idealYear?: number): Promise<any[]> {
    let query = `
        SELECT 
            t.id as "teacherId", 
            t.name as "teacherName", 
            c.id as "courseId", 
            c.name as "courseName", 
            c.code as "courseCode"
        FROM teachers_courses tc
        JOIN teachers t ON t.id = tc.teacher_id
        JOIN courses c ON c.id = tc.course_id
    `;
    const params: any[] = [];
    
    if (idealYear) {
        query += " WHERE tc.ideal_year = $1";
        params.push(idealYear);
    } else {
        // Lógica para pegar o semestre atual
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11
        const semester = month < 6 ? 1 : 2; // Semestre 1 (Jan-Jun), Semestre 2 (Jul-Dec)
        query += ` WHERE tc.semester = $1`;
        params.push(`${year}-${semester}`);
    }

    const { rows } = await pool.query(query, params);
    return rows;
}


export async function checkTeacherCourseLinkExists(teacherId: number, courseId: number): Promise<boolean> {
    const query = 'SELECT 1 FROM teachers_courses WHERE teacher_id = $1 AND course_id = $2 LIMIT 1';
    const { rows } = await pool.query(query, [teacherId, courseId]);
    return rows.length > 0;
}

export async function createEvaluationAndAnswers(data: {
    userId: number;
    teacherId: number;
    courseId: number;
    score: number | null;
    answers: { questionId: number; answer: string; order: number; }[];
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      const evalQuery = `
        INSERT INTO evaluations (user_id, teacher_id, course_id, score)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;
      const evalResult = await client.query(evalQuery, [data.userId, data.teacherId, data.courseId, data.score]);
      const evaluationId = evalResult.rows[0].id;
  
      const answerQuery = `
        INSERT INTO answers (evaluation_id, question_id, answer, question_order)
        VALUES ($1, $2, $3, $4);
      `;
      for (const ans of data.answers) {
        await client.query(answerQuery, [evaluationId, ans.questionId, ans.answer, ans.order]);
      }
  
      await client.query('COMMIT');
      return { evaluationId };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
}
