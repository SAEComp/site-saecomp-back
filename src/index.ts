import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import healthRouter from './routers/health.router';
import corsMiddleware from "./middlewares/cors";
import { errorHandler } from './middlewares/errorHandler';
import { openApiDoc } from './docs/config';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import userRouter from './routers/user.router';
import adminRouter from './routers/admin.router';

const app = express();
const port = process.env.PORT ?? 3000;

// ================= middlewares ================= //

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);

// ================= routers ================= //

app.use("/api/evaluation/health", healthRouter);

app.use("/api/evaluation/docs/openapi.json", (req, res) => (res.json(openApiDoc)));

app.use('/api/evaluation/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

app.use("/api/evaluation", userRouter);

app.use("/api/evaluation/admin", adminRouter);


// ================= error handler ================= //

app.use(errorHandler);


app.listen(port, () => {
    console.log(`serving on http://localhost:${port}`);
});