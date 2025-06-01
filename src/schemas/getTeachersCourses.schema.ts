import { z } from 'zod';

export const getTeachersCoursesSchema = z.object({
    idealYear: z.coerce.number().int().gte(0).optional()
});

export type IGetTeachersCoursesSchema = z.infer<typeof getTeachersCoursesSchema>;
