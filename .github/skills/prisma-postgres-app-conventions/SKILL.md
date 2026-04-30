---
name: prisma-postgres-app-conventions
description: 'Apply Prisma and PostgreSQL implementation conventions for a production internal app. Use for schema changes, migrations, Prisma client generation, UUID/default pitfalls, environment setup, focused queries, and validating App Router features backed by Prisma.'
argument-hint: '[schema or Prisma task]'
---

# Prisma Postgres App Conventions

Use this skill when a task touches Prisma schema, migrations, generated client issues, or PostgreSQL-backed app logic.

## Use When

- Adding or updating Prisma models and relations
- Creating migrations for a feature slice
- Debugging Prisma client generation or DB-default assumptions
- Writing focused server queries or mutations for App Router features

## Quick Rules

- Keep schema changes minimal and feature-scoped.
- Regenerate Prisma artifacts after schema changes.
- Prefer narrow queries and server-side authorization.
- Validate against the real DB-backed path, not assumptions.

## Load Next

For the migration procedure, environment notes, and query checklist, load [the playbook](./references/playbook.md).