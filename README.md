# Toko Kita monorepo

TypeScript monorepo with a Vite + React + Tailwind client, Express API server, Drizzle ORM, and shared schema/types.

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Configure `DATABASE_URL` and JWT secrets in `.env`.

4. Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

5. (Optional) Seed users:

```bash
pnpm seed
```

6. Run dev servers (client + server):

```bash
pnpm dev
```

Client: `http://localhost:5173`
Server: `http://localhost:3000`

## Auth modes

Default mode uses httpOnly cookies for access/refresh tokens. The API also returns an `accessToken` in the response body so clients can optionally use the fallback header mode.

- Cookie mode (default): browser automatically sends cookies; `fetch` uses `credentials: "include"`.
- Bearer mode (fallback): set `Authorization: Bearer <accessToken>` on requests. You can store the `accessToken` from login/refresh responses.

Refresh tokens rotate on every `/api/auth/refresh` call and are persisted in the database.

## Scripts

- `pnpm dev` - run client and server together
- `pnpm dev:client` - run Vite dev server
- `pnpm dev:server` - run Express server (tsx watch)
- `pnpm build` - build client and server
- `pnpm start` - start production server (serves client/dist)
- `pnpm db:generate` - generate Drizzle migrations
- `pnpm db:migrate` - apply migrations
- `pnpm db:studio` - open Drizzle Studio
- `pnpm seed` - seed demo and admin users

## Production

1. Build the client and server:

```bash
pnpm build
```

2. Start the server:

```bash
pnpm start
```

In production, Express serves `client/dist` and falls back to `index.html` for SPA routes.
