import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Фабрика Express-приложения. Вынесена отдельно от запуска сервера,
 * чтобы приложение можно было импортировать в тестах без прослушивания порта.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  // Healthcheck: верхнеуровневый, простой и стабильный контракт.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
