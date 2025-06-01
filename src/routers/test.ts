import { Router, Request, Response } from "express";

const TestRouter = Router();

TestRouter.get(
    "/health",
    (req: Request, res: Response) => {
        const healthcheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now()
        };
        res.status(200).send(healthcheck);
    });

export default TestRouter;