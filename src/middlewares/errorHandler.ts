import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import { ZodError } from "zod";

interface Issue {
    path?: string;
    message: string;
}

interface ErrorBody {
    code: string;
    message: string;
    issues?: Issue[];
}

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    let status = 500;
    let code = "INTERNAL_ERROR";
    let message: string = "Internal Server Error";
    let issues: Issue[] | undefined;

    if (err instanceof ApiError) {
        status = err.statusCode;
        code = "API_ERROR";
        message = err.message;
        if ((err as any).issues) issues = (err as any).issues as Issue[];
    }
    else if (err instanceof ZodError) {
        status = 422;
        code = "VALIDATION_ERROR";
        message = "Erro de validação";
        issues = err.errors.map(e => ({
            path: e.path.join("."),
            message: e.message
        }));
    }

    if (status >= 500) {
        console.error(`[${req.method}] ${req.originalUrl}`);
        console.error(err);
    }

    const body: ErrorBody = { code, message };
    if (issues?.length) body.issues = issues;

    res.status(status).json(body);
}
