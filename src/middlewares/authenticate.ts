import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const accessPublicKey = fs.readFileSync(
    path.resolve(__dirname, '../../keys/access_public.pem')
);

interface IAccessTokenPayload {
    sub: string;
    role: 'admin' | 'user';
}

function verifyAccessToken(token: string): IAccessTokenPayload | null {
    try {
        const payload = jwt.verify(token, accessPublicKey, {
            algorithms: ['RS256'],
        }) as jwt.JwtPayload;

        return payload as IAccessTokenPayload;
    } catch (error) {
        console.log('Error verifying access token:', error);
        return null;
    }
}

function authenticate(req: Request, res: Response, next: NextFunction): void {
    req.userId = 1;
    req.userRole = 'admin';
    next();
    return;
    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     res.status(401).json({ error: 'Invalid token' });
    //     return;
    // }

    // const token = authHeader.split(' ')[1];

    // try {
    //     const payload = verifyAccessToken(token);
    //     if (!payload) {
    //         res.status(401).json({ error: 'Invalid or expired token' });
    //         return;
    //     }
    //     req.userId = Number(payload.sub);
    //     req.userRole = payload.role;
    //     next();
    // } catch (err) {
    //     res.status(401).json({ error: 'Invalid or expired token' });
    //     return;
    // }
}

export default authenticate;