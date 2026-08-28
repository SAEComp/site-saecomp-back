import * as fs from 'fs';
import * as path from 'path';
// Importa a sua conexão com o banco exatamente como está no seu repositório
import pool from '../src/database/connection';

async function seedUspData() {
    console.log('🚀 Iniciando a importação de dados da USP...');

    // 1. Ler o arquivo db.json (que o script python gerou)
    // Supondo que ele esteja na pasta raiz, dentro de uma pasta 'dados'
    const filePath = path.join(__dirname, '../dados/db.json');
    if (!fs.existsSync(filePath)) {
        console.error('❌ Erro: Arquivo db.json não encontrado no caminho:', filePath);
        process.exit(1);
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const disciplinasUsp = JSON.parse(rawData);

    // 2. Definir o Semestre Atual (Dinamicamente, sem hardcode)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const semester = month < 9 && month > 3 ? 1 : 2; 
    const currentSemesterCode = `${year}-${semester}`;
    console.log(`📌 Semestre alvo para inserção: ${currentSemesterCode}`);

    try {
        // 3. Garantir que o semestre existe na tabela semesters
        let semesterRes = await pool.query(`SELECT id FROM semesters WHERE code = $1`, [currentSemesterCode]);
        let semesterId: number;
        
        if (semesterRes.rowCount === 0) {
            console.log(`⚠️ Semestre ${currentSemesterCode} não existe. Criando agora...`);
            const newSem = await pool.query(
                `INSERT INTO semesters (code, year, semester) VALUES ($1, $2, $3) RETURNING id`, 
                [currentSemesterCode, year, semester]
            );
            semesterId = newSem.rows[0].id;
        } else {
            semesterId = semesterRes.rows[0].id;
        }

        // 4. Iniciar a Injeção dos Dados
        for (const disciplina of disciplinasUsp) {
            if (!disciplina.codigo || !disciplina.nome) continue;

            console.log(`Processando disciplina: ${disciplina.codigo} - ${disciplina.nome}`);

            // ==========================================
            // ETAPA ZERO: VERIFICAR/INSERIR DEPARTAMENTO
            // ==========================================
            let instituteId = null;
            if (disciplina.unidade) {
                // Tenta encontrar o instituto pelo nome
                const instRes = await pool.query(`SELECT id FROM institutes WHERE name = $1`, [disciplina.unidade]);
                
                if (instRes.rows.length > 0) {
                    instituteId = instRes.rows[0].id;
                } else {
                    // Se não existir, cria o instituto
                    const newInst = await pool.query(
                        `INSERT INTO institutes (name) VALUES ($1) RETURNING id`,
                        [disciplina.unidade]
                    );
                    instituteId = newInst.rows[0].id;
                }
            }

            let departmentId = null;
            if (disciplina.departamento) {
                // Tenta encontrar o departamento pelo nome
                const deptRes = await pool.query(`SELECT id FROM departments WHERE name = $1`, [disciplina.departamento]);
                
                if (deptRes.rows.length > 0) {
                    departmentId = deptRes.rows[0].id;
                } else {
                    // Se não existir, cria o departamento já passando o ID do Instituto!
                    const newDept = await pool.query(
                        `INSERT INTO departments (name, institute_id) VALUES ($1, $2) RETURNING id`,
                        [disciplina.departamento, instituteId]
                    );
                    departmentId = newDept.rows[0].id;
                }
            }

            // ==========================================
            // ETAPA A: VERIFICAR/INSERIR COURSES
            // ==========================================
            let courseId;
            const courseRes = await pool.query(`SELECT id FROM courses WHERE code = $1`, [disciplina.codigo]);
            
            if (courseRes.rows.length > 0) {
                courseId = courseRes.rows[0].id; // Já existe, só pega o ID
            } else {
                // Não existe, então insere passando também o department_id E institute_id
                const newCourse = await pool.query(
                    `INSERT INTO courses (code, name, department_id, institute_id) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [disciplina.codigo, disciplina.nome, departmentId, instituteId]
                );
                courseId = newCourse.rows[0].id;
            }

            if (!disciplina.turmas) continue;

            for (const turma of disciplina.turmas) {
                if (!turma.horario) continue;

                for (const aula of turma.horario) {
                    if (!aula.professores || aula.professores.length === 0) continue;

                    for (const nomeProfessor of aula.professores) {
                        
                        // ==========================================
                        // ETAPA B: VERIFICAR/INSERIR TEACHERS
                        // ==========================================
                        let teacherId;
                        const teacherRes = await pool.query(`SELECT id FROM teachers WHERE name = $1`, [nomeProfessor]);
                        
                        if (teacherRes.rows.length > 0) {
                            teacherId = teacherRes.rows[0].id;
                        } else {
                            const newTeacher = await pool.query(
                                `INSERT INTO teachers (name) VALUES ($1) RETURNING id`,
                                [nomeProfessor]
                            );
                            teacherId = newTeacher.rows[0].id;
                        }

                        // ==========================================
                        // ETAPA C: VERIFICAR/INSERIR CLASSES (A Ligação)
                        // ==========================================
                        const classRes = await pool.query(
                            `SELECT id FROM classes WHERE course_id = $1 AND teacher_id = $2 AND semester_id = $3`,
                            [courseId, teacherId, semesterId]
                        );
                        
                        if (classRes.rows.length === 0) {
                            await pool.query(
                                `INSERT INTO classes (course_id, teacher_id, semester_id) VALUES ($1, $2, $3)`,
                                [courseId, teacherId, semesterId]
                            );
                            console.log(`  -> Vinculado: Prof. ${nomeProfessor}`);
                        }
                    }
                }
            }
        }
        console.log('✅ Importação concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante a injeção no banco:', error);
    } finally {
        // Encerra o pool para o script não ficar travado no terminal
        await pool.end();
    }
}

seedUspData();
