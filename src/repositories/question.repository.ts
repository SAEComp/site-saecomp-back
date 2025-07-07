import pool from "../database/connection";
import { PoolClient } from "pg";
import { Question } from "../schemas/output/adminQuestions.schema";
import { ApiError } from "../errors/ApiError";

// Para o formulário público
export async function findActiveQuestions(): Promise<Omit<Question[], 'isScore' | 'active'>> {
    const query = `
        SELECT id, type, question, required, question_order as "order" 
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
        SELECT id, type, question, question_order as "order", active, required, is_score as "isScore" 
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

export async function resequenceActiveQuestions(
    client: PoolClient,
    priorityId: number = -1
): Promise<void> {
    await client.query(
        `
      WITH ordered AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            ORDER BY
              question_order,
              -- empurra a priority para cima em casos de empate
              CASE WHEN id = $1 THEN 0 ELSE 1 END,
              id
          ) AS new_order
        FROM questions
        WHERE active = true
      )
      UPDATE questions q
      SET question_order = o.new_order
      FROM ordered o
      WHERE q.id = o.id
        AND q.question_order IS DISTINCT FROM o.new_order;
      `,
        [priorityId]
    );
}

// Lida com a complexidade de reordenar
export async function createQuestion(questionData: Omit<Question, 'id'>): Promise<number> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertQuery = `
            INSERT INTO questions (question, type, active, question_order, is_score, required)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
        `;
        const { rows } = await client.query(insertQuery, [
            questionData.question,
            questionData.type,
            questionData.active,
            questionData.active ? questionData.order : null,
            questionData.isScore,
            questionData.required
        ]);

        await resequenceActiveQuestions(client, rows[0].id);

        await client.query('COMMIT');

        return rows[0].id;

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// Função para deletar ou desativar
export async function deleteOrDeactivateQuestion(id: number): Promise<{ deleted: boolean }> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        // Verifica se existe resposta
        const { rows } = await client.query('SELECT 1 FROM answers WHERE question_id = $1 LIMIT 1', [id]);

        if (rows.length > 0) {
            // Desativa
            const updateResult = await client.query(
                'UPDATE questions SET active = false, question_order = NULL WHERE id = $1',
                [id]
            );
        } else {
            await client.query('DELETE FROM questions WHERE id = $1', [id]);
        }

        await resequenceActiveQuestions(client);
        await client.query('COMMIT');
        return { deleted: rows.length === 0 };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

}

export async function updateQuestion(
    id: number,
    data: Partial<Omit<Question, "id">>
): Promise<Question> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const updateQuery = `
            UPDATE questions
            SET question = COALESCE($1, question),
                type = COALESCE($2, type),
                active = COALESCE($3, active),
                question_order = COALESCE($4, question_order),
                is_score = COALESCE($5, is_score),
                required = COALESCE($6, required)
            WHERE id = $7
            RETURNING id, question, type, active, question_order as "order", is_score as "isScore";
        `;
        const { rows } = await client.query(updateQuery, [
            data.question,
            data.type,
            data.active,
            data.order,
            data.isScore,
            data.required,
            id
        ]);
        if (rows.length === 0) {
            throw new ApiError(404, "Pergunta não encontrada.");
        }
        const updated = rows[0];
        await resequenceActiveQuestions(client, updated.id);

        await client.query("COMMIT");
        return updated;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}
