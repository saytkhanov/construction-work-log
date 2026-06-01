# Журнал работ на строительном объекте

Веб-приложение для ведения журнала выполненных работ на строительном объекте.
Прораб может добавлять, просматривать, фильтровать, сортировать, редактировать и
удалять записи о выполненных работах.

Frontend и backend общаются **только через REST API**, данные хранятся в
**PostgreSQL**. Весь проект поднимается одной командой через `docker compose`.

## Стек и почему он выбран

| Технология              | Зачем                                                          |
| ----------------------- | -------------------------------------------------------------- |
| **React + TypeScript**  | Типобезопасный, компонентный frontend                          |
| **Vite**                | Быстрый dev-сервер и сборка                                    |
| **TanStack Query**      | Удобная работа с server state: кэш, инвалидация, состояния загрузки/ошибок |
| **React Hook Form + Zod** | Производительные формы и декларативная валидация (одна схема — типы + проверки) |
| **Node.js + Express**   | Простой и понятный backend API                                 |
| **Prisma ORM**          | Типобезопасная работа с БД, миграции и seed «из коробки»       |
| **PostgreSQL**          | Надёжная реляционная БД                                        |
| **Docker Compose**      | Запуск всего проекта (БД + backend + frontend) одной командой  |

## Функциональность

- Список записей журнала работ
- Фильтрация по дате (`Дата от` / `Дата до`)
- Сортировка по дате (сначала новые / сначала старые)
- Добавление записи
- Редактирование записи (та же форма в режиме редактирования)
- Удаление записи (с подтверждением)
- Справочник видов работ (заполняется сидами)

## Быстрый старт

Требуется установленный Docker с Docker Compose.

```bash
cp .env.example .env        # при желании поправьте порты/креды
docker compose up --build
```

При старте backend **автоматически** применяет миграции
(`prisma migrate deploy`) и заполняет справочник видов работ (`prisma db seed`) —
отдельных команд для базового сценария не требуется.

Адреса после запуска:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Healthcheck:** http://localhost:3000/health → `{ "status": "ok" }`

Остановить контейнеры (данные БД сохранятся в volume `db-data`):

```bash
docker compose down
```

Остановить и удалить данные БД:

```bash
docker compose down -v
```

## Переменные окружения

Файлы `.env` не коммитятся; в репозитории лежат `.env.example`.

**Корневой `.env`** (используется `docker-compose.yml`):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=construction_log
POSTGRES_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=5173
CORS_ORIGIN=*
```

**Backend** (`apps/backend/.env.example`):

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/construction_log?schema=public
PORT=3000
```

**Frontend** (`apps/frontend/.env.example`):

```env
VITE_API_URL=http://localhost:3000
```

> Если `VITE_API_URL` не задан, frontend ходит по относительному `/api`, который
> в dev проксирует Vite, а в Docker — nginx. Поэтому docker-сборка работает без
> дополнительной настройки.

## Локальная разработка (без Docker)

Нужны Node.js ≥ 20 и доступный PostgreSQL.

```bash
npm install                         # зависимости всех воркспейсов
docker compose up -d db             # поднять только базу (опционально)
cp apps/backend/.env.example apps/backend/.env
npm run prisma:migrate              # применить миграции
npm run prisma:seed                 # заполнить справочник
npm run dev:backend                 # http://localhost:3000
npm run dev:frontend                # http://localhost:5173
```

NPM-скрипты в корне: `dev`, `build`, `lint`, `prisma:migrate`, `prisma:seed`,
`prisma:generate`.

## API

Healthcheck: `GET /health` → `{ "status": "ok" }` (без префикса).

Остальные ресурсы — под префиксом `/api`:

| Метод  | Путь                        | Описание                                  |
| ------ | --------------------------- | ----------------------------------------- |
| GET    | `/api/work-types`           | Справочник видов работ (сортировка по имени) |
| GET    | `/api/work-log-entries`     | Список записей журнала (фильтры в query)   |
| GET    | `/api/work-log-entries/:id` | Запись по id                              |
| POST   | `/api/work-log-entries`     | Создать запись                            |
| PATCH  | `/api/work-log-entries/:id` | Обновить запись                           |
| DELETE | `/api/work-log-entries/:id` | Удалить запись                            |

Query-параметры списка (опциональны): `dateFrom`, `dateTo` (формат `YYYY-MM-DD`),
`sortOrder` (`asc`/`desc`, по умолчанию `desc`), `workTypeId`.

Пример: `GET /api/work-log-entries?dateFrom=2026-05-01&dateTo=2026-05-29&sortOrder=desc`

Тело запроса на создание/редактирование записи:

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

## Структура репозитория

```
construction-work-log/
├── apps/
│   ├── frontend/            # SPA: React + Vite
│   │   └── src/
│   │       ├── api/             # client.ts, workTypes.ts, workLogEntries.ts
│   │       ├── types/           # workLog.ts — типы API-ответов
│   │       ├── hooks/           # TanStack Query хуки
│   │       └── features/workLog # форма (create/edit) и таблица журнала
│   └── backend/            # REST API: Express + Prisma
│       ├── prisma/             # schema.prisma, миграции, seed
│       └── src/
│           ├── config/          # валидация env
│           ├── lib/             # Prisma client, HttpError
│           ├── middleware/      # валидация (Zod), обработка ошибок
│           ├── modules/         # workTypes, workLogs (routes/controller/service/schemas)
│           ├── app.ts           # фабрика Express-приложения
│           └── server.ts        # точка входа
├── docker-compose.yml
├── .env.example
└── README.md
```

## Модель данных

Идентификаторы — строковые `cuid`. Связь: `WorkType` 1 — ∞ `WorkLogEntry`.

- **WorkType** (`work_types`): `id`, `name` (уникально), `createdAt`, `updatedAt`.
- **WorkLogEntry** (`work_log_entries`): `id`, `date`, `workTypeId`, `volume`
  (`Decimal`), `unit` (`м³`, `м²`, `м.п.`, `шт`, `т`, `кг`), `executorName`,
  `comment` (опц.), `createdAt`, `updatedAt`. Удаление вида работ ограничено,
  если на него есть ссылки (`onDelete: Restrict`).
