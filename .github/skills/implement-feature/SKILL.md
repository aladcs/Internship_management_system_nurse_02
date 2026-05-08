---
name: implement-feature
description: Implement one feature end-to-end in this Internship Management System. Use when asked to add or update a single vertical slice such as Student List, Student Detail, Student Form, Admin List, Dashboard, or Notifications, and the work must follow the project PRD, feature roadmap, UI specs, Copilot instructions, relevant local skills, Prisma data access, strict RBAC, Next.js 16 App Router, and proxy.ts route protection.
---

# Implement Feature

Implement one vertical feature end-to-end for this project. Keep the change minimal, production-ready, and limited to the requested slice.

## Always Follow

- `docs/PRD.md`
- `docs/_features.md`
- The matching file in `docs/ui/*.md`
- `.github/copilot-instructions.md`
- Relevant `.github/skills/*/SKILL.md` files for the requested feature
- Relevant Next.js 16 guides in `node_modules/next/dist/docs/` before writing version-sensitive Next.js code

## Non-Negotiable Rules

- Implement one feature at a time.
- Do not rewrite the whole project.
- Do not modify unrelated files.
- Do not invent features outside `docs/_features.md`.
- Do not use mock data.
- Use Prisma for real database access.
- Enforce RBAC server-side.
- Prefer Server Components when possible.
- Use Client Components only when interactivity is required.
- Use Next.js 16 App Router only.
- Use `proxy.ts` for route protection.
- Do not create or use `middleware.ts`.
- Do not add dependencies unless necessary.

## RBAC Rules

- `super_admin` manages admin accounts only.
- `super_admin` must not access student data.
- `admin` manages student data only.
- `admin` must not manage admin accounts.
- `student` can view and edit only their own data.
- `student` can edit only when status is `pending` or `in_progress`.
- `completed` status is read-only for `student`.

## Workflow

1. Identify the requested feature in `docs/_features.md`.
2. Identify the matching route.
3. Identify the matching UI spec in `docs/ui/*.md`.
4. Inspect existing files before editing.
5. Reuse existing project patterns.
6. Implement the smallest complete vertical slice:
   - route
   - UI
   - Prisma data fetching or mutation
   - validation
   - RBAC
   - loading, error, and empty states if relevant
7. Keep code focused.
8. Check TypeScript issues.
9. Run or suggest `npm run lint` and `npm run build`.
10. Summarize changed files and how to test.

## Implementation Notes

- Start from the existing route map, RBAC helpers, Prisma access patterns, and UI conventions already present in the repo.
- Update `proxy.ts` when the feature adds or changes protected routes.
- Use server actions, route handlers, or server-side helpers only where they fit the existing project pattern.
- Keep validation and authorization close to the server-side mutation path.
- If a relevant local skill exists under `.github/skills/`, load and follow it instead of inventing a new pattern.

## Prompt Templates

- Implement Student List: `Use .github/skills/implement-feature/SKILL.md and implement the Student List feature at /intern/admin/students following docs/_features.md, docs/ui/student-list.md, docs/PRD.md, .github/copilot-instructions.md, and any relevant .github/skills/*.`
- Implement Student Detail: `Use .github/skills/implement-feature/SKILL.md and implement the Student Detail feature at /intern/admin/students/[id] following docs/_features.md, docs/ui/student-detail.md, docs/PRD.md, .github/copilot-instructions.md, and any relevant .github/skills/*.`
- Implement Student Form: `Use .github/skills/implement-feature/SKILL.md and implement the Student Form feature at /intern/form following docs/_features.md, docs/ui/form.md, docs/PRD.md, .github/copilot-instructions.md, and any relevant .github/skills/*.`
- Implement Admin List: `Use .github/skills/implement-feature/SKILL.md and implement the Admin List feature at /intern/admins following docs/_features.md, docs/ui/admin-list.md, docs/PRD.md, .github/copilot-instructions.md, and any relevant .github/skills/*.`
- Implement Dashboard: `Use .github/skills/implement-feature/SKILL.md and implement the Dashboard feature at /intern/dashboard following docs/_features.md, docs/ui/dashboard.md, docs/PRD.md, .github/copilot-instructions.md, and any relevant .github/skills/*.`
- Implement Notification feature: `Use .github/skills/implement-feature/SKILL.md and implement the Notification feature at /intern/notifications following docs/_features.md, the closest matching docs/ui/*.md and docs/PRD.md, .github/copilot-instructions.md, and any relevant .github/skills/*.`
