import pool from "../database/connection";
import { IGetTeachersCoursesData } from "../interfaces/getTeachersCourses.interface";


const dbQuery = `
select t.id, t.name, c.id, c.name, c.code from teachers_courses tc
join teachers t on t.id = tc.teacher_id
join courses c on c.id = tc.course_id

`;

async function getTeachersCoursesData(idealYear?: number): Promise<IGetTeachersCoursesData[]> {

    let query = dbQuery;
    const params: any[] = [];

    if (idealYear !== undefined) {
        query += " where tc.ideal_year = $1";
        params.push(idealYear);
    }

    try {
        const { rows } = await pool.query(query, params);
        return rows;
    } catch (error) {
        console.error("Error fetching teachers courses data:", error);
        throw error;
    }
}

export default getTeachersCoursesData;