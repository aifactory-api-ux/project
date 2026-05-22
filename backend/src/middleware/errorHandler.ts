import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  const logEntry = {
    level: statusCode >= 500 ? 'error' : 'warn',
    message: err.message || 'Internal server error',
    statusCode,
    isOperational,
    stack: statusCode >= 500 ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(logEntry));

  if (isOperational && statusCode < 500) {
    res.status(statusCode).json({
      error: err.message,
      statusCode,
    });
    return;
  }

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : err.message,
    statusCode,
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  const logEntry = {
    level: 'warn',
    message: 'Route not found',
    path: _req.path,
    method: _req.method,
    timestamp: new Date().toISOString(),
  };

  console.warn(JSON.stringify(logEntry));

  res.status(404).json({
    error: 'Not found',
    statusCode: 404,
  });
}

export function createError(message: string, statusCode: number): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}