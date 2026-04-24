import { Request } from 'express';

export type UserRole = 'admin' | 'member';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface JwtUserPayload {
    id: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtUserPayload;
}

export interface SignupInput {
    username: string;
    password: string;
    email: string;
    phone: string;
    role?: UserRole;
}

export interface SigninInput {
    username: string;
    password: string;
}
