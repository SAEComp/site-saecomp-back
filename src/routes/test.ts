import {Router, Request, Response} from "express";

const TestRouter = Router();

TestRouter.get(
    "/test",
    (req: Request, res: Response) => {
        res.status(200).send({message: "API Working"});
    });

export default TestRouter;