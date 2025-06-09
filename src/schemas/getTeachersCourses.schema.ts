import { z } from 'zod';

export const getTeachersCoursesSchema = z.object({
<<<<<<< Updated upstream
    idealYear: z.coerce.number().int().gte(0).optional()
});

export type IGetTeachersCoursesSchema = z.infer<typeof getTeachersCoursesSchema>;
=======
  idealYear: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .optional()
});

export type GetTeachersCoursesQuery = z.infer<typeof getTeachersCoursesSchema>;
>>>>>>> Stashed changes
