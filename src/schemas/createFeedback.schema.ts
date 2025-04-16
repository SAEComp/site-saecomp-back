import { z } from 'zod';

export const createFeedbackSchema = z.object({
    userId: z.coerce.string(),
    teacherId: z.coerce.string(),
    courseId: z.coerce.string(),
    rating: z.coerce.number(),
    positiveAspects: z.coerce.number(),
    negativeAspects: z.coerce.number(),
    additionalComments: z.coerce.number()
});

export type ICreateFeedback = z.infer<typeof createFeedbackSchema>;
