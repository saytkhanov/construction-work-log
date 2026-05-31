import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { HttpError } from '../lib/httpError';

type ValidationTargets = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

/**
 * Универсальный middleware валидации входящих данных через Zod.
 * Провалидированные и приведённые значения кладём обратно в req,
 * чтобы контроллеры работали с типобезопасными данными.
 */
export function validate(schemas: ValidationTargets) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(HttpError.badRequest('Validation error', error.flatten().fieldErrors));
        return;
      }
      next(error);
    }
  };
}
