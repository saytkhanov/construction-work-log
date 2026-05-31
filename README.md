# Журнал работ на строительном объекте

Небольшое full-stack приложение для учёта выполненных работ на строительном
объекте: дата, вид работ (из справочника), объём, исполнитель и примечание.

Frontend и backend общаются **только через REST API**, данные хранятся в
**PostgreSQL**. Весь проект поднимается одной командой через `docker-compose`.

## Стек

| Слой       | Технологии                                                            |
| ---------- | --------------------------------------------------------------------- |
| Frontend   | React, TypeScript, Vite, TanStack Query, React Hook Form, Zod, CSS Modules |
| Backend    | Node.js, TypeScript, Express, Prisma ORM, Zod                         |
| База данных| PostgreSQL 16, Prisma migrations + seed                               |
| Инфра      | Docker, docker-compose, nginx (раздача фронта и прокси `/api`)         |

## Структура репозитория

```
construction-work-log/
├── apps/
│   ├── frontend/        # SPA на React + Vite
│   │   └── src/
│   │       ├── api/         # API-клиент (fetch-обёртка, модули ресурсов)
│   │       ├── hooks/       # TanStack Query хуки
│   │       └── features/    # UI журнала (форма, таблица, валидация)
│   └── backend/         # REST API на Express + Prisma
│       ├── prisma/         # schema.prisma, миграции, seed
│       └── src/
│           ├── config/      # валидация env
│           ├── lib/         # Prisma client, HttpError
│           ├── middleware/  # валидация (Zod), обработка ошибок
│           ├── modules/     # workTypes, workLogs (routes/controller/service/schemas)
│           ├── app.ts       # фабрика Express-приложения
│           └── server.ts    # точка входа
├── docker-compose.yml
├── .env.example
└── README.md
```

Разделение ответственности:
- **UI** (`features/`, компоненты) ничего не знает о транспорте — только хуки;
- **API-клиент** (`api/`) инкапсулирует `fetch`, базовый путь и обработку ошибок;
- **backend routes → controller → service** — маршрутизация, HTTP-слой и работа
  с БД разнесены; валидация входа вынесена в Zod-схемы и middleware.

## Быстрый старт через Docker

Требуется установленный Docker с Docker Compose.

```bash
cp .env.example .env        # при желании поправьте порты/креды
docker compose up --build
```

При старте backend автоматически применяет миграции (`prisma migrate deploy`)
и заполняет справочник видов работ (`prisma db seed`).

После сборки:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api (healthcheck: http://localhost:3000/health)
- **PostgreSQL:** localhost:5432

Остановить и удалить контейнеры (с данными БД):

```bash
docker compose down -v
```

## Локальная разработка (без Docker)

Нужны Node.js ≥ 20 и доступный PostgreSQL.

```bash
# 1. Установить зависимости всех воркспейсов
npm install

# 2. Поднять только базу через Docker (опционально)
docker compose up -d db

# 3. Настроить переменные окружения backend
cp apps/backend/.env.example apps/backend/.env

# 4. Применить миграции и сиды
npm run prisma:migrate
npm run prisma:seed

# 5. Запустить backend и frontend (в разных терминалах)
npm run dev:backend     # http://localhost:3000
npm run dev:frontend    # http://localhost:5173 (проксирует /api на backend)
```

## NPM-скрипты (корень)

| Скрипт                   | Действие                                              |
| ------------------------ | ----------------------------------------------------- |
| `npm run dev`            | Запустить dev-режим всех воркспейсов                   |
| `npm run dev:backend`    | Только backend (tsx watch)                            |
| `npm run dev:frontend`   | Только frontend (Vite)                                |
| `npm run build`          | Сборка backend (tsc) и frontend (vite build)          |
| `npm run lint`           | ESLint по всем воркспейсам                             |
| `npm run prisma:migrate` | `prisma migrate dev` для backend                      |
| `npm run prisma:seed`    | Заполнить справочник видов работ                       |
| `npm run prisma:generate`| Сгенерировать Prisma Client                           |

## API

Healthcheck: `GET /health` → `{ "status": "ok" }` (без префикса).

Остальные ресурсы — под префиксом `/api`:

| Метод  | Путь                       | Описание                                  |
| ------ | -------------------------- | ----------------------------------------- |
| GET    | `/api/work-types`          | Справочник видов работ (сортировка по имени) |
| GET    | `/api/work-log-entries`    | Список записей журнала (фильтры в query)   |
| GET    | `/api/work-log-entries/:id`| Запись по id                              |
| POST   | `/api/work-log-entries`    | Создать запись                            |
| PATCH  | `/api/work-log-entries/:id`| Обновить запись                           |
| DELETE | `/api/work-log-entries/:id`| Удалить запись                            |

Query-параметры списка (все опциональны):
- `dateFrom`, `dateTo` — границы по дате (формат `YYYY-MM-DD`);
- `sortOrder` — `asc` или `desc` (по умолчанию `desc`), сортировка по дате;
- `workTypeId` — фильтр по виду работ.

Пример: `GET /api/work-log-entries?dateFrom=2026-05-01&dateTo=2026-05-29&sortOrder=desc`

Тело запроса на создание записи:

```json
{
  "date": "2026-05-29",
  "workTypeId": "cmps9ltv40006i52gt32rcqjq",
  "volume": 24,
  "unit": "м³",
  "executorName": "Иванов Иван",
  "comment": "optional"
}
```

Валидация (backend, Zod): `date`, `workTypeId`, `unit` обязательны; `volume` —
число больше 0; `executorName` — минимум 2 символа; `comment` опционален.

Ошибки возвращаются в едином формате:

```json
{ "message": "Validation error", "errors": { "volume": ["Volume must be greater than 0"] } }
```

```json
{ "message": "Work log entry not found" }
```

## Модель данных

Идентификаторы — строковые `cuid`. Связь: `WorkType` 1 — ∞ `WorkLogEntry`.

- **WorkType** (`work_types`) — справочник: `id`, `name` (уникально),
  `createdAt`, `updatedAt`.
- **WorkLogEntry** (`work_log_entries`) — запись журнала: `id`, `date`,
  `workTypeId`, `volume` (`Decimal`), `unit` (`м³`, `м²`, `шт`, `п.м.` …),
  `executorName`, `comment` (опц.), `createdAt`, `updatedAt`. Удаление вида
  работ ограничено, если на него есть ссылки (`onDelete: Restrict`).
