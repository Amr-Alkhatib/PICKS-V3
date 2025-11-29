# Deployment (Vercel frontend + Render/Railway backend)

The Laravel backend has been replaced with a Node/Prisma API. It can run as Vercel serverless routes **or** as a long-running Express server (for Render/Railway). The React (Vite) frontend and the API live in one repo; `/api/*` is the API prefix.

## Required environment variables (set in Vercel dashboard)
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=generate-a-long-random-secret
VITE_API_URL=/api
```
- Use Postgres (Neon, Supabase, Railway, etc.). For Neon, append `?sslmode=require` to the connection string.
- The Prisma schema is in `prisma/schema.prisma`.

## Deploy steps
1) Deploy this repo to Vercel.
2) Set env vars above; redeploy.
3) Run migrations against your database:
   ```bash
   npx prisma migrate deploy
   ```
   If you change the schema locally, run `npx prisma migrate dev --name init` then commit the generated `prisma/migrations`.

## Local development
```
npm install
# Set DATABASE_URL to a local or cloud Postgres instance
npx prisma migrate dev --name init
npm run dev
```

## Railway/Render backend (Express)

If you prefer a dedicated backend service, use `server.js` (Express) on Render or Railway.

Env vars (Render/Railway):
- `PORT` (Render injects one; Railway defaults to 3000 or 8080)
- `DATABASE_URL` = Neon connection string (include `?sslmode=require`)
- `JWT_SECRET` = long random string
- `ALLOWED_ORIGINS` = comma-separated list (e.g. `https://your-vercel-site.vercel.app`)
- Optional: `NODE_ENV=production`

Deploy steps:
1) Create a new **Web Service** (Render) or **Service** (Railway) from this repo.
2) Build/install command: `npm install` (ensure dev deps are installed so Prisma CLI is available).
3) Run command: `npm run start:api` (starts Express on `PORT`).
4) After first deploy, run migrations against Neon: `npx prisma migrate deploy` from the Render/Railway shell.
5) In Vercel (frontend), set `VITE_API_URL=https://<your-backend>/api` so the client hits the hosted backend. Leave `VITE_API_WITH_CREDENTIALS` empty (JWT is header-based).

Health check: `GET /health` returns `{ status: "ok" }`.

## API endpoints (Bearer JWT)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout` (stateless)
- `GET /api/auth/me`
- `GET /api/simulations`
- `POST /api/simulations`
- `GET /api/simulations/:id`
- `PUT /api/simulations/:id`
- `DELETE /api/simulations/:id`
- `POST /api/simulations/bulk-delete`

Send `Authorization: Bearer <token>` for protected routes. Tokens are returned from register/login responses.
