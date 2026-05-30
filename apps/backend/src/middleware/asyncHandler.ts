import type { NextFunction, Request, Response, RequestHandler } from 'express';

/**
 * Обёртка для async-контроллеров: прокидывает отклонённые промисы в next(),
 * чтобы их поймал общий errorHandler (Express 4 сам этого не делает).
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
