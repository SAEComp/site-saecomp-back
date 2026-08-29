import pool from './src/database/connection';

async function higienizarProfessores() {
    try {
        console.log('Procurando professores com nomes curtos ou inválidos...');
        
        const res = await pool.query(`
            UPDATE teachers 
            SET name = 'A Definir' 
            WHERE length(name) < 3;
        `);
        
        console.log(`Sucesso! ${res.rowCount} professores foram corrigidos no banco.`);
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await pool.end();
    }
}

higienizarProfessores();