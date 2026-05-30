/**
 * Централизованная и провалидированная конфигурация окружения.
 * Падаем рано и с понятной ошибкой, если переменные не заданы.
 */
import 'dotenv/config'; // подхватываем .env при локальном запуске; в Docker значения приходят из compose
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
