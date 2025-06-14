import { Router, Request, Response } from "express";
import pool from "../database/connection";

const healthRouter = Router();

healthRouter.get(
    "/",
    async (req: Request, res: Response) => {
        try {
            await pool.query('SELECT 1')
        } catch (err) {
            console.error('Database connection error:', err);
            return res.status(500).send();
        }
        const healthcheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now()
        };
        res.status(200).send(healthcheck);
    });

export default healthRouter;