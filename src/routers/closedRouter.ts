import { Router } from "express";
import getTeachersCourses from "../controllers/getTeachersCourses";

const closedRouter = Router();

closedRouter.get("/evaluation/teachers-courses", getTeachersCourses);

export default closedRouter;
