import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError || err.name === 'ZodError' || Array.isArray(err.issues) || Array.isArray(err.errors)) {
    const issues = err.issues || err.errors || [];
    return res.status(400).json({
      error: 'Validation failed',
      details: issues.map((e: any) => ({
        field: e.path ? e.path.join('.') : '',
        message: e.message,
      })),
    });
  }

  console.error('API Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
}
