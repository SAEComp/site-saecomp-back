import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { ApiError } from '../errors/ApiError';

const accessPublicKey = fs.readFileSync(
    path.resolve(__dirname, '../../keys/access_public.pem')
);

interface IAccessTokenPayload {
    sub: string;
    role: string;
    permissions: string[];
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

function authenticate(requiredPermissions?: string[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) throw new ApiError(401, 'Token de autenticação não fornecido ou inválido');

        const token = authHeader.split(' ')[1];

        try {
            const payload = verifyAccessToken(token);
            if (!payload) throw new ApiError(401, 'Token inválido ou expirado');
            req.userId = Number(payload.sub);
            req.userRole = payload.role;
            req.userPermissions = payload.permissions || [];
            if (requiredPermissions) {
                const hasPermission = requiredPermissions.some(permission =>
                    req.userPermissions?.includes(permission)
                );
            if (!hasPermission) throw new ApiError(403, 'Acesso negado: Permissões insuficientes');
            }
            next();
        } catch (err) {
            throw new ApiError(401, 'Token inválido ou expirado');
        }
    }
}

export default authenticate;