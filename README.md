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
- **Backend API:** http://localhost:4000/api
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
npm run dev:backend     # http://localhost:4000
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

Базовый префикс: `/api`.

| Метод  | Путь               | Описание                                  |
| ------ | ------------------ | ----------------------------------------- |
| GET    | `/health`          | Проверка живости сервиса                  |
| GET    | `/work-types`      | Справочник видов работ                     |
| GET    | `/work-logs`       | Список записей журнала (фильтры в query)   |
| GET    | `/work-logs/:id`   | Запись по id                              |
| POST   | `/work-logs`       | Создать запись                            |
| PATCH  | `/work-logs/:id`   | Обновить запись                           |
| DELETE | `/work-logs/:id`   | Удалить запись                            |

Фильтры списка: `workTypeId`, `dateFrom`, `dateTo` (формат `YYYY-MM-DD`).

Тело запроса на создание записи:

```json
{
  "date": "2026-05-29",
  "workTypeId": 3,
  "volume": 12.5,
  "executor": "Бригада №2",
  "notes": "Кладка наружных стен, оси 1–4"
}
```

Все входные данные валидируются на backend через Zod; ошибки возвращаются в
формате `{ "error": { "message": "...", "details": { ... } } }`.

## Модель данных

- **WorkType** (`work_types`) — справочник: `name` (уникально), `unit`.
- **WorkLog** (`work_logs`) — запись журнала: `date`, `workTypeId`, `volume`
  (`Decimal`), `executor`, `notes`, таймстемпы. Удаление вида работ ограничено,
  если на него есть ссылки (`onDelete: Restrict`).
