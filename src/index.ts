import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import healthRouter from './routers/health.router';
import corsMiddleware from "./middlewares/cors";
import { errorHandler } from './middlewares/errorHandler';
import { swaggerSpec } from "./docs/config";
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import authenticate from './middlewares/authenticate';
import adminRoute from './middlewares/adminRoute';
import userRouter from './routers/user.router';
import adminRouter from './routers/admin.router';

const app = express();
const port = process.env.PORT ?? 3000;

// ================= middlewares ================= //

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);

// ================= routers ================= //

app.use("/api/eval/health", healthRouter);

app.use('/api/eval/docs', authenticate, adminRoute, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/eval", authenticate, userRouter);

app.use("/api/eval/admin", authenticate, adminRouter);


// ================= error handler ================= //

app.use(errorHandler);


app.listen(port, () => {
  console.log(`serving on http://localhost:${port}`);
});