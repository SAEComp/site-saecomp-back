
export interface IFeedbacks {
    userId: string;
    teacherId: string;
    teacherName: string;
    courseId: string;
    courseName: string;
    rating: number;
    positiveAspects: string;
    negativeAspects: string;
    additionalComments: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    deleted: boolean;
};

export interface ITeachers {
    teacherName: string;
    rating: number;
    ratingCount: number;
    courses: string[];
};

export interface ICourses {
    courseName: string;
    courseCode: string;
    teachers: string[];
};
