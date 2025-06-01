export interface IGetTeachersCoursesOut {
    results: {
        teacherId: number;
        teacherName: string;
        courseId: number;
        courseName: string;
        courseCode: string;
    }[];
}

export interface IGetTeachersCoursesData {
    teacherId: number;
    teacherName: string;
    courseId: number;
    courseName: string;
    courseCode: string;
}