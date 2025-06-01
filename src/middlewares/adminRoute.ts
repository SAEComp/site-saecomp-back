import { Request, Response, NextFunction } from 'express';

function adminRoute(req: Request, res: Response, next: NextFunction): void {
    if (req.userRole !== 'admin') {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    next();
}

export default adminRoute;