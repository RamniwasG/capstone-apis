import { NextFunction, Request, Response } from 'express';

interface ErrorWithStatusCode extends Error {
    statusCode?: number;
}

const globalErrorHandler = (
    err: ErrorWithStatusCode,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Global Error Handler:', err);
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};

export default globalErrorHandler;
