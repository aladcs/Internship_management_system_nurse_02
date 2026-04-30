# Env And Secrets Matrix

## Purpose

This file records the meaning and expected handling of environment values so future projects can separate application secrets, provider credentials, and optional integrations cleanly.

## Current Known Categories

### Database

- `DATABASE_URL`
  - Purpose: Prisma and app database connectivity
  - Scope: required for app and Prisma CLI
  - Recommended location: `.env`

### Notification Integrations

- `TELEGRAM_BOT_TOKEN`
  - Purpose: optional Telegram notification delivery
  - Scope: optional integration secret

- `TELEGRAM_CHAT_ID`
  - Purpose: target chat for optional Telegram delivery
  - Scope: optional integration configuration

### OAuth / Provider Credentials

Projects with Google or CMU Entra login will typically need provider-specific values such as:

- client id
- client secret
- callback or redirect base URL

These should be treated as high-sensitivity values.

## Placement Rules

- Put values required by Prisma CLI in `.env`.
- Put app-only secrets in `.env.local` when that split is operationally helpful.
- Treat optional integration secrets as truly optional in the app logic.
- Missing optional integration config should degrade gracefully.

## Reuse Guidance

For every env var in future systems, document:

- name
- purpose
- required vs optional
- local vs production expectations
- which subsystem depends on it