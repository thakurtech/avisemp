# Deployment Walkthrough

## Overview
We have successfully migrated the AVIS application backend from Express.js to Next.js API Routes. The entire application is now contained within the Next.js framework, ready for a seamless deployment on Vercel.

## Changes Made
- **Backend Migration**: All API routes (`/api/auth`, `/api/users`, `/api/tasks`, `/api/attendance`, `/api/leaves`) have been reimplemented using Next.js Route Handlers.
- **Database**: Updated `prisma/schema.prisma` to use PostgreSQL.
- **Frontend**: Updated `src/lib/api.ts` to communicate with the internal Next.js API.

## Deployment Steps (Vercel)

### 1. Prerequisites
- Create a **PostgreSQL Database** (e.g., Vercel Postgres, Neon, or Supabase).
- Copy the **External Connection String** (DATABASE_URL).
  - *Note for Render users:* Ensure you use the "External Database URL" (usually ending in `.render.com`), not the Internal URL.

### 2. Connect to Vercel
1. Push your code to a GitHub repository.
2. Log in to Vercel and "Add New > Project".
3. Import your repository.

### 3. Environment Variables
In the Vercel Project Settings, add the following Environment Variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL Connection String | `postgres://user:pass@host/db` |
| `JWT_SECRET` | Secret key for authentication | `super_secure_random_string` |
| `NEXT_PUBLIC_API_URL` | Base API URL (optional, defaults to relative) | `/api` |

### 4. Deploy
- Click **Deploy**.
- Vercel will automatically build your Next.js application, run migrations (if configured in build command), and launch the site.

**Note:** You may need to run `prisma db push` or `prisma migrate deploy` manually or as part of the build command to set up the database schema on the production database.
To do this on Vercel, override the **Build Command** to:
`npx prisma db push && next build`

## Validation
- Once deployed, visit the URL provided by Vercel.
- Try logging in with the owner account.
- Verify basic features like Dashboard, User Management, and applying for leaves.
