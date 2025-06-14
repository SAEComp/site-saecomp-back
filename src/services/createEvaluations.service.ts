import { IEvaluation } from "../schemas/input/evaluation.schema";
import * as evaluationRepo from '../repositories/evaluation.repository';
import * as questionRepo from '../repositories/question.repository';
import { ApiError } from "../errors/ApiError";

async function createEvaluationsService(evaluations: IEvaluation[], userId: number) {
    const activeQuestions = await questionRepo.findAllQuestions();

    for (const ev of evaluations) {
        let totalScore = 0;
        let scoreQuestionCount = 0;

        const answersWithOrder = ev.answers.map(ans => {
            const questionDetails = activeQuestions.find(q => q.id === ans.questionId);
            if (!questionDetails) throw new ApiError(404, `Pergunta com ID ${ans.questionId} não encontrada.`);
            if (!questionDetails.active || !questionDetails.order === null) throw new ApiError(400, `Pergunta com ID ${ans.questionId} não está ativa ou não possui ordem definida.`);

            if (questionDetails.isScore) {
                const answerScore = Number(ans.answer);
                if (isNaN(answerScore)) throw new ApiError(400, `Resposta para a pergunta com ID ${ans.questionId} não é um número válido.`);

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