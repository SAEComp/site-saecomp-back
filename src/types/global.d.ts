import 'express';

declare global {
    namespace Express {
        interface Request {
            userId?: number;
            userRole?: 'admin' | 'user';
        }
    }
}