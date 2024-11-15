
export interface IBaseQuery {
    lastVisible?: string;
    pageSize: number;
};

export interface IFeedbacksQuery extends IBaseQuery {
    courseName?: string;
    courseId?: string;
    teacherName?: string;
    teacherId?: string;
};

export interface IUserFeedbacksQuery extends IBaseQuery {
    userId?: string;
}

export interface ITeacher {
    teacherId: string;
    teacherName: string;
};

export interface ICourse {
    courseId: string;
    courseName: string;
    courseCode: string;
};

export interface IFeedbacksResponse {
    feedbackId: string;
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
};

export interface IFeedbackCreator {
    userId: string;
    teacherId: string;
    courseId: string;
    rating: number;
    positiveAspects: string;
    negativeAspects: string;
    additionalComments: string;
}

export interface IFeedbackUpdater {
    rating?: number;
    positiveAspects?: string;
    negativeAspects?: string;
    additionalComments?: string;
}
