import { IEvaluation } from "../schemas/evaluation.schema";
import * as evaluationRepo from '../repositories/evaluation.repository';
import * as questionRepo from '../repositories/question.repository';

async function createEvaluationsService(evaluations: IEvaluation[], userId: number) {
    const activeQuestions = await questionRepo.findAllQuestions();

    for (const ev of evaluations) {
        let totalScore = 0;
        let scoreQuestionCount = 0;

        const answersWithOrder = ev.answers.map(ans => {
            const questionDetails = activeQuestions.find(q => q.id === ans.questionId);
            if (!questionDetails) throw new Error(`Question with ID ${ans.questionId} not found.`);
            if (!questionDetails.active || !questionDetails.order === null) throw new Error(`Question with ID ${ans.questionId} is not active.`);

            if (questionDetails.isScore) {
                const answerScore = Number(ans.answer);
                if (isNaN(answerScore)) throw new Error(`Invalid score for question ID ${ans.questionId}: ${ans.answer}`);

                totalScore += answerScore;
                scoreQuestionCount++;

            }
            return {
                ...ans,
                order: questionDetails.order!
            }
        });

        const finalScore = scoreQuestionCount > 0 ? totalScore / scoreQuestionCount : null;

        const evaluationId = await evaluationRepo.createEvaluation(
            userId,
            {
                classId: ev.classId,
                score: finalScore
            });
        await evaluationRepo.createAnswers(evaluationId, answersWithOrder);
    }
}

export default createEvaluationsService;