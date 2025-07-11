import 'express';

declare global {
    namespace Express {
        interface Request {
            userId?: number;
            userRole?: string;
            userPermissions?: string[];
        }
    }
}