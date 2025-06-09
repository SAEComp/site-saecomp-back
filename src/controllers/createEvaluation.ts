import { db } from "../../config/db/firebase_con";
import { Request, Response } from "express";
import { z } from "zod";


const evaluationSchema = z.object({
  nusp: z.number(),
  evaluations: z.array(
    z.object({
      teacherId: z.number(),
      courseId: z.number(),
      answers: z.array(
        z.object({
          questionId: z.number(),
          answer: z.string()
        })
      )
    })
  )
});

export const createEvaluation = async (req: Request, res: Response) => {
  try {
    const parsed = evaluationSchema.parse(req.body);

    const batch = db.batch();

    // Verifica se o usuário existe
    const userRef = db.collection("users").doc(parsed.nusp.toString());
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      batch.set(userRef, { nusp: parsed.nusp });
    }

    // Validação dos teachers e courses antes de qualquer criação
    for (const ev of parsed.evaluations) {
      const teacherSnap = await db.collection("teachers").doc(ev.teacherId.toString()).get();
      const courseSnap = await db.collection("courses").doc(ev.courseId.toString()).get();

      if (!teacherSnap.exists || !courseSnap.exists) {
        return res.status(404).json({
          error: `teacherId (${ev.teacherId}) ou courseId (${ev.courseId}) não encontrado`
        });
      }
    }

    for (const ev of parsed.evaluations) {
      const numericAnswers = ev.answers.map(a => parseFloat(a.answer)).filter(n => !isNaN(n));
      const score = numericAnswers.length > 0
        ? numericAnswers.reduce((acc, val) => acc + val, 0) / numericAnswers.length
        : null;

      const evaluationRef = db.collection("evaluations").doc();
      batch.set(evaluationRef, {
        userNusp: parsed.nusp,
        teacherId: ev.teacherId,
        courseId: ev.courseId,
        score,
        createdAt: new Date()
      });

      for (const answer of ev.answers) {
        const answerRef = db.collection("answers").doc();
        batch.set(answerRef, {
          evaluationId: evaluationRef.id,
          questionId: answer.questionId,
          answer: answer.answer
        });
      }
    }

    await batch.commit();
    return res.status(201).send();

  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
};
