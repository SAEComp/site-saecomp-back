import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import healthRouter from "./routers/healthRouter";
import closedRouter from "./routers/closedRouter";
import corsMiddleware from "./middlewares/cors";
import { swaggerSpec } from "./docs/config";
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import authenticate from './middlewares/authenticate';
import adminRoute from './middlewares/adminRoute';


const app = express();
const port = process.env.PORT ?? 3000;


// ================= middlewares ================= //

app.use(express.json());

app.use(cookieParser());

app.use(corsMiddleware);

// ================= routers ================= //

app.use("/api/eval/health", healthRouter);

app.use('/api/eval/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/eval", authenticate, closedRouter);


app.listen(port, () => {
    console.log(`serving on http://localhost:${port}`);
});
