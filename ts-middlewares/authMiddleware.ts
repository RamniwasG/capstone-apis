import { NextFunction, Response } from 'express';
import dotenv from 'dotenv';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthenticatedRequest, JwtUserPayload } from '../ts-types';

dotenv.config({
    quiet: true,
    path: ['.env', '.env.local']
});

const {
    JWT_SECRET,
    JWT_EXPIRES_IN = '1h'
} = process.env;

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({ error: 'JWT secret is not configured' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = user as JwtUserPayload;
        next();
    });
};

const authorizeRole = (...allowedRoles: JwtUserPayload['role'][]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
        if (!req?.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!allowedRoles.includes(req?.user?.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

const generateToken = (user: { id: string; email: string; role: JwtUserPayload['role'] }): string => {
    if (!JWT_SECRET) {
        throw new Error('JWT secret is not configured');
    }

    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] }
    );
};

export {
    isAuthenticated,
    authorizeRole,
    generateToken
};
