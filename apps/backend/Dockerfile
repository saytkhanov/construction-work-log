# --- Build stage: компиляция TypeScript в dist ---
# node:22-slim (Debian) — у Prisma на нём корректно определяется OpenSSL,
# в отличие от alpine/musl, где schema engine может не запуститься.
FROM node:22-slim AS build
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Production stage ---
FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Ставим полный набор зависимостей: prisma CLI и tsx нужны для
# применения миграций и запуска сидов при старте контейнера.
# --include=dev обязателен, т.к. при NODE_ENV=production npm иначе пропускает devDependencies.
COPY package*.json ./
RUN npm install --include=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
