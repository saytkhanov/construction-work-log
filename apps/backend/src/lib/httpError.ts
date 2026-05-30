/**
 * Прикладная HTTP-ошибка с явным статус-кодом.
 * Бросается из сервисов/контроллеров и обрабатывается единым errorHandler.
 */
export class HttpError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, message, details);
  }

  static notFound(message = 'Resource not found') {
    return new HttpError(404, message);
  }

  static conflict(message: string, details?: unknown) {
    return new HttpError(409, message, details);
  }
}
