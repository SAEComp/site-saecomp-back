import { checkIfClassExists } from "../repositories/evaluation.repository";
import { IEvaluation } from "../schemas/teacherEvaluation/input/evaluation.schema";


function checkClasses(evaluations: IEvaluation[]) {
    const teacherPairs = evaluations.map(ev => ({
        classId: ev.classId,
        teacherId: ev.teacherId,
        courseId: ev.courseId
    }));

    return checkIfClassExists(teacherPairs);
}

export default checkClasses;