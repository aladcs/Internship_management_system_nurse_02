---
name: nextjs-prisma-rbac-slice
description: 'Implement a vertical slice in a Next.js App Router + Prisma internal app with strict RBAC. Use for adding a new admin, student, or super_admin feature with route, UI, Prisma data access, server actions, proxy.ts protection, and focused validation.'
argument-hint: '[feature or route to implement]'
---

# Next.js Prisma RBAC Slice

Use this skill for one-feature-at-a-time work in a Next.js App Router dashboard backed by Prisma and strict RBAC.

## Use When

- Adding a new route, page, server action, or data-backed feature for `super_admin`, `admin`, or `student`
- Turning a feature spec into route + UI + Prisma + RBAC + validation
- Updating `proxy.ts` route protection for a new feature slice

## Quick Rules

- Keep the change scoped to one feature.
- Use real Prisma-backed data, never mock data.
- Enforce RBAC server-side and in `proxy.ts`.
- Prefer Server Components unless interactivity requires a client component.

## Load Next

For the step-by-step workflow, RBAC checklist, and common failure modes, load [the playbook](./references/playbook.md).