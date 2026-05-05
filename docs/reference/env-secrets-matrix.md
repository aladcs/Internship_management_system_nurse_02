# Env And Secrets Matrix

## Purpose

This file records the meaning and expected handling of environment values so future projects can separate application secrets, provider credentials, and optional integrations cleanly.

## Current Known Categories

### Database

- `DATABASE_URL`
  - Purpose: Prisma and app database connectivity
  - Scope: required for app and Prisma CLI
  - Recommended location: `.env.local` locally, `.env.production` or deployment secrets for production

### Notification Integrations

- `TELEGRAM_BOT_TOKEN`
  - Purpose: optional Telegram notification delivery
  - Scope: optional integration secret
  - Recommended location: `.env.local` for local testing, production secret store for deployment

- `TELEGRAM_CHAT_ID`
  - Purpose: target chat for optional Telegram delivery
  - Scope: optional integration configuration
  - Recommended location: `.env.local` for local testing, production secret store for deployment

### OAuth / Provider Credentials

Projects with Google or CMU Entra login will typically need provider-specific values such as:

- client id
- client secret
- callback or redirect base URL

These should be treated as high-sensitivity values.

Recommended location:

- `.env.local` for local-only provider testing
- `.env.production` or deployment secret manager for production credentials

### App Runtime Secrets

- `APP_BASE_URL`
  - Purpose: absolute URL generation for OAuth callbacks and admin notification links
  - Scope: required whenever OAuth or absolute links are used
  - Recommended location: `.env.local` locally, `.env.production` or deployment secrets in production

- `AUTH_SECRET`
  - Purpose: signs the application-managed session cookie
  - Scope: required in production, recommended in local development
  - Recommended location: `.env.local` locally, `.env.production` or deployment secrets in production

- `SEED_LOGIN_PASSWORD`
  - Purpose: overrides the default seed password for local bootstrap accounts
  - Scope: optional, local/development-oriented
  - Recommended location: `.env.local`

## Placement Rules

- Put local app and database values in `.env.local`.
- Put deployment-specific values in `.env.production` or your hosting platform's secret manager.
- Prisma config and seed should load env with Next's loader so `.env.local` and `.env.production` remain effective outside the Next runtime.
- Treat optional integration secrets as truly optional in the app logic.
- Missing optional integration config should degrade gracefully.

## Reuse Guidance

For every env var in future systems, document:

- name
- purpose
- required vs optional
- local vs production expectations
- which subsystem depends on it
