import { checkIfClassExists } from "../repositories/evaluation.repository";
import { IEvaluation } from "../schemas/evaluation.schema";


function checkClasses(evaluations: IEvaluation[]) {
    const teacherPairs = evaluations.map(ev => ({
        classId: ev.classId,
    }));

    return checkIfClassExists(teacherPairs);
}

export default checkClasses;