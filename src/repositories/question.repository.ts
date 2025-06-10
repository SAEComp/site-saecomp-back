import pool from "../database/connection";
import { Question } from "../types/entities";

// Para o formulário público
export async function findActiveQuestions(): Promise<Partial<Question>[]> {
    const query = `
        SELECT id as "questionId", type as "questionType", question, question_order as "order" 
        FROM questions 
        WHERE active = true 
        ORDER BY question_order ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
}

// Para a página de admin
export async function findAllQuestions(): Promise<Question[]> {
    const query = `
        SELECT id as "questionId", type as "questionType", question, question_order as "order", active, is_score as "isScore" 
        FROM questions 
        ORDER BY active DESC, question_order ASC
    `;
     const { rows } = await pool.query(query);
    return rows;
}

export async function findQuestionById(id: number): Promise<Question | null> {
    const { rows } = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
    return rows[0] || null;
}

// Lida com a complexidade de reordenar
export async function createQuestionAndUpdateOrder(questionData: Omit<Question, 'id'>): Promise<Question> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (questionData.active && questionData.question_order) {
            // Empurra as outras perguntas para frente para dar espaço para a nova
            await client.query(
                `UPDATE questions SET question_order = question_order + 1 WHERE active = true AND question_order >= $1`,
                [questionData.question_order]
            );
        }

        const insertQuery = `
            INSERT INTO questions (question, type, active, question_order, is_score)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const { rows } = await client.query(insertQuery, [
            questionData.question,
            questionData.type,
            questionData.active,
            questionData.active ? questionData.question_order : null,
            questionData.is_score
        ]);
        
        await client.query('COMMIT');
        return rows[0];

    } catch(e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// Função para deletar ou desativar
export async function deleteOrDeactivateQuestion(id: number): Promise<{ deleted: boolean, question?: Question }> {
    // Verifica se existe resposta
    const { rows } = await pool.query('SELECT 1 FROM answers WHERE question_id = $1 LIMIT 1', [id]);
    
    if (rows.length > 0) {
        // Desativa
        const updateResult = await pool.query(
            'UPDATE questions SET active = false, question_order = NULL WHERE id = $1 RETURNING *',
            [id]
        );
        return { deleted: false, question: updateResult.rows[0] };
    } else {
        // Deleta
        await pool.query('DELETE FROM questions WHERE id = $1', [id]);
        return { deleted: true };
    }
}

export async function updateQuestion(id: number, data: Partial<Omit<Question, 'id'>>) {
  const fields = Object.keys(data);
  // @ts-ignore
  const values = Object.values(data);

  if (fields.length === 0) {
    return findQuestionById(id); // Retorna a questão atual se não houver nada para atualizar
  }

  const setClauses = fields
    .map((field, index) => `"${field}" = $${index + 1}`)
    .join(', ');

  const query = `
    UPDATE questions
    SET ${setClauses}
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [...values, id]);
  return rows[0] || null;
}