import { Router } from "express";
import getTeachersCourses from "../controllers/getTeachersCourses";

const closedRouter = Router();

closedRouter.get("/teachers-courses", getTeachersCourses);

export default closedRouter;
