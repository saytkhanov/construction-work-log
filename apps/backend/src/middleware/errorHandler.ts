import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/httpError';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found' });
}

/**
 * Единый обработчик ошибок. Приводит прикладные, Prisma- и непредвиденные
 * ошибки к единому JSON-формату:
 *   { "message": "...", "errors": { ... } }   // errors — только при наличии деталей
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    const body: { message: string; errors?: unknown } = { message: err.message };
    if (err.details && typeof err.details === 'object') {
      body.errors = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2025 — запись не найдена, P2003 — нарушение внешнего ключа, P2002 — уникальность
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Work log entry not found' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ message: 'Related resource does not exist' });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ message: 'Resource already exists' });
      return;
    }
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
}
