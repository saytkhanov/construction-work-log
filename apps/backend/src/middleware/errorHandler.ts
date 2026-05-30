import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/httpError';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: 'Route not found' } });
}

/**
 * Единый обработчик ошибок. Приводит прикладные, Prisma- и непредвиденные
 * ошибки к единому JSON-формату { error: { message, details? } }.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2025 — запись не найдена, P2003 — нарушение внешнего ключа, P2002 — уникальность
    if (err.code === 'P2025') {
      res.status(404).json({ error: { message: 'Resource not found' } });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ error: { message: 'Related resource does not exist' } });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: { message: 'Resource already exists' } });
      return;
    }
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
