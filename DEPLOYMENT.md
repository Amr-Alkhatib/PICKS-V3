# Vercel-first deployment (React + serverless API)

The Laravel backend has been replaced with Vercel-compatible serverless API routes (Node) and Prisma. The React (Vite) frontend and the API now live in one project; `/api/*` is handled by serverless functions.

## Required environment variables (set in Vercel dashboard)
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=generate-a-long-random-secret
VITE_API_URL=/api
```
- Use Postgres (Neon, Supabase, Railway, etc.).
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
