import { Router, Request, Response } from "express";

const healthRouter = Router();

healthRouter.get(
    "/",
    (req: Request, res: Response) => {
        const healthcheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now()
        };
        res.status(200).send(healthcheck);
    });

export default healthRouter;