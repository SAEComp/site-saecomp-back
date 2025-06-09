import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../config/db/firebase_con";

const querySchema = z.object({
  idealYear: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .optional()
});

export const getTeachersCourses = async (req: Request, res: Response) => {
  try {
    const parsed = querySchema.parse(req.query);

    const teacherCoursesSnapshot = await db.collection("teacherCourses").get();

    const teacherCourses = teacherCoursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const results: any[] = [];

    for (const rel of teacherCourses) {
      const courseDoc = await db.collection("courses").doc(rel.courseId.toString()).get();
      const teacherDoc = await db.collection("teachers").doc(rel.teacherId.toString()).get();

      const course = courseDoc.data();
      const teacher = teacherDoc.data();

      if (!course || !teacher) continue;

      if (parsed.idealYear && course.idealYear !== parsed.idealYear) continue;
      if (!parsed.idealYear && course.semester !== "2025-1") continue;

      results.push({
        teacherId: rel.teacherId,
        teacherName: teacher.name,
        courseId: rel.courseId,
        courseName: course.name,
        courseCode: course.code
      });
    }

    return res.status(200).json({ results });
  } catch (err: any) {
    console.error(err);
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "Query inválida" });
    }
    return res.status(500).json({ error: "Erro interno" });
  }
};
