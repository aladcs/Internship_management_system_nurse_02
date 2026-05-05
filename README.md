This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Docker Deploy

This repository now includes a production Docker setup for the app and PostgreSQL.

Required files before deploy:

- `.env.production` for app runtime secrets and production `DATABASE_URL`

If you use the bundled Postgres service from `docker-compose.prod.yml`, set `DATABASE_URL` host to `db`.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/internship_management_system"
```

Deploy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The app container automatically runs `prisma migrate deploy` before starting Next.js.

Uploaded files are stored in the named Docker volume mounted at `/app/storage`, so student attachments and profile images survive container restarts.

If you already have an external PostgreSQL server, point `DATABASE_URL` at that server and remove or override the `db` service.

## Local Dev Data

Run `npm run db:seed` to ensure the local demo accounts exist.

The seed script also backfills `AdminNotificationReceipt` rows for all existing admins on existing notifications, so the notifications page can be exercised in local development without manually patching DB data.

Set `SEED_LOGIN_PASSWORD` before seeding. Example:

```bash
SEED_LOGIN_PASSWORD='replace-with-a-strong-local-password' npm run db:seed
```

Local accounts created after seeding:

- `nupong.pr@cmu.ac.th / $SEED_LOGIN_PASSWORD` (`super_admin`)
- `admin.demo@cmu.ac.th / $SEED_LOGIN_PASSWORD` (`admin`)
- `student.demo@cmu.ac.th / $SEED_LOGIN_PASSWORD` (`student`)

Useful local regression surfaces after seeding:

- `/intern/notifications` should be testable with the seeded admin account because existing notifications are backfilled to all admins.
- `/intern/activity-logs` should show paginated admin/student activity suitable for search and filter regression checks.

## Environment Files

This project now separates environment files by responsibility:

- `.env.local` keeps local development values, including `DATABASE_URL`, optional Docker/Postgres defaults, `APP_BASE_URL`, `AUTH_SECRET`, and optional local OAuth credentials.
- `.env.production` is the production scaffold. Fill it only on the deployment target, or map the same keys through your hosting platform's secret manager.
- `.env.example` and `.env.production.example` are safe templates that document the required keys without storing real secrets.

Operationally:

- `next dev` reads `.env.local`.
- `next build` and `next start` read `.env.production`, then `.env.local` if present.
- Prisma config and the seed script now use Next's env loader too, so the same split applies to `prisma generate` and `prisma db seed`.

Recommended local setup:

1. Keep local app and database values in `.env.local`.
2. Put production secrets in your server or platform environment, using `.env.production` only as a key checklist when you self-host.
3. Keep `.env.example` and `.env.production.example` updated whenever you add, remove, or rename environment variables.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000/intern](http://localhost:3000/intern) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
