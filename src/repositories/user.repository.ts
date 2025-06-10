import pool from "../database/connection";
import { User } from "../types/entities";

export async function findOrCreateUserByNusp(nusp: string, userData: Partial<User> = {}): Promise<User> {
    const findQuery = `SELECT * FROM users WHERE nusp = $1`;
    let { rows } = await pool.query(findQuery, [nusp]);

    if (rows.length > 0) {
        return rows[0];
    }

    // google_sub e email são NOT NULL, então precisam ser fornecidos.
    const createQuery = `
        INSERT INTO users (nusp, google_sub, email, name)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const newUserData = {
        google_sub: `sub_for_${nusp}`, // Placeholder
        email: userData.email || `${nusp}@usp.br`, // Placeholder
        name: userData.name || null,
        ...userData
    };
    
    const { rows: newRows } = await pool.query(createQuery, [nusp, newUserData.google_sub, newUserData.email, newUserData.name]);
    return newRows[0];
}