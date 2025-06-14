import pool from "../database/connection";

export async function updateNusp(nusp: string, userId: number): Promise<void> {
    const updateQuery = `
        UPDATE users
        SET nusp = $1
        WHERE id = $2
    `;
    await pool.query(updateQuery, [nusp, userId]);
}