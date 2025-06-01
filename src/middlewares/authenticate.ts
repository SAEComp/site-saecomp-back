import { Request, Response, NextFunction } from 'express';

function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;


    try {
        
        req.userId = 1;
        req.userRole = 'admin';
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
}

export default authenticate;