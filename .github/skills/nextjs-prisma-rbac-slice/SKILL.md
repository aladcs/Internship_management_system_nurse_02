---
name: nextjs-prisma-rbac-slice
description: 'Implement a vertical slice in a Next.js App Router plus Prisma app with strict RBAC. Use for adding a new role-scoped route, page, server action, or data-backed feature with UI, Prisma data access, server actions, route protection, and focused validation.'
argument-hint: '[feature or route to implement]'
---

# Next.js Prisma RBAC Slice

Use this skill for one-feature-at-a-time work in a Next.js App Router application backed by Prisma and strict RBAC.

## Use When

- Adding a new route, page, server action, or data-backed feature for one or more project roles
- Turning a feature spec into route + UI + Prisma + RBAC + validation
- Updating `proxy.ts` or the project's route guard for a new feature slice

## Quick Rules

- Keep the change scoped to one feature.
- Use real Prisma-backed data, never mock data.
- Enforce RBAC server-side and in the route-protection layer.
- Prefer Server Components unless interactivity requires a client component.

## Load Next

For the step-by-step workflow, RBAC checklist, and common failure modes, load [the playbook](./references/playbook.md).
