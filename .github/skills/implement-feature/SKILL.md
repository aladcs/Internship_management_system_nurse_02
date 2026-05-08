---
name: implement-feature
description: Implement one feature end-to-end in a structured product codebase. Use when asked to add or update a single vertical slice such as a list, detail page, form, dashboard, workflow page, or notifications surface, and the work must follow the current project's PRD, feature roadmap, UI specs, local agent instructions, relevant local skills, real data access patterns, RBAC rules, and route-protection conventions.
---

# Implement Feature

Implement one vertical feature end-to-end. Keep the change minimal, production-ready, and limited to the requested slice.

## Always Follow The Current Project Sources Of Truth

- Product requirements or PRD
- Feature roadmap or backlog
- Matching UI spec or design reference
- Local agent or Copilot instructions
- Relevant local skill files for the requested feature
- Framework-version docs when the current project uses a version with breaking changes

In this repository, that usually means:

- `docs/PRD.md`
- `docs/_features.md`
- the matching file in `docs/ui/*.md`
- `.github/copilot-instructions.md`
- relevant `.github/skills/*/SKILL.md`
- relevant Next.js 16 guides in `node_modules/next/dist/docs/`

## Non-Negotiable Rules

- Implement one feature at a time.
- Do not rewrite the whole project.
- Do not modify unrelated files.
- Do not invent features outside the project roadmap or approved requirements.
- Do not use mock data.
- Use the project's real data layer for production paths.
- Enforce RBAC server-side.
- Prefer Server Components when possible.
- Use Client Components only when interactivity is required.
- Follow the project's routing model and route-protection convention.
- Do not add dependencies unless necessary.

## RBAC Rules

- Map the current project's roles to clear actor and target types before editing.
- Keep authority boundaries explicit and server-enforced.
- Restrict self-service users to their own records unless product rules say otherwise.
- Respect workflow locks, read-only states, and ownership boundaries.

If the repository already defines a role matrix, treat it as the source of truth. In this repo, that includes:

- `super_admin` manages admin accounts only
- `super_admin` must not access student data
- `admin` manages student data only
- `admin` must not manage admin accounts
- `student` can view and edit only own data
- `student` can edit only when status is `pending` or `in_progress`
- `completed` is read-only for `student`

## Workflow

1. Identify the requested feature in the roadmap or requirements.
2. Identify the matching route.
3. Identify the matching UI spec.
4. Inspect existing files before editing.
5. Reuse existing project patterns.
6. Implement the smallest complete vertical slice:
   - route
   - UI
   - real data fetching or mutation
   - validation
   - RBAC
   - loading, error, and empty states if relevant
7. Keep code focused.
8. Check TypeScript issues.
9. Run or suggest `npm run lint` and `npm run build`.
10. Summarize changed files and how to test.

## Implementation Notes

- Start from the existing route map, auth helpers, data access patterns, and UI conventions already present in the repo.
- Update the current route-protection layer when the feature adds or changes protected routes.
- Use server actions, route handlers, or server-side helpers only where they fit the project pattern.
- Keep validation and authorization close to the server-side mutation path.
- If a relevant local skill exists under `.github/skills/`, load and follow it instead of inventing a new pattern.

## Prompt Templates

- Implement List Page: `Use .github/skills/implement-feature/SKILL.md and implement the list feature for [entity] at [route] by following the current project's roadmap, UI spec, PRD, local instructions, and any relevant .github/skills/*.`
- Implement Detail Page: `Use .github/skills/implement-feature/SKILL.md and implement the detail feature for [entity] at [route] by following the current project's roadmap, UI spec, PRD, local instructions, and any relevant .github/skills/*.`
- Implement Form: `Use .github/skills/implement-feature/SKILL.md and implement the form feature for [entity or workflow] at [route] by following the current project's roadmap, UI spec, PRD, local instructions, and any relevant .github/skills/*.`
- Implement Admin Or Staff List: `Use .github/skills/implement-feature/SKILL.md and implement the privileged list or management page for [entity] at [route] by following the current project's roadmap, UI spec, PRD, local instructions, and any relevant .github/skills/*.`
- Implement Dashboard: `Use .github/skills/implement-feature/SKILL.md and implement the dashboard feature at [route] by following the current project's roadmap, UI spec, PRD, local instructions, and any relevant .github/skills/*.`
- Implement Notification Feature: `Use .github/skills/implement-feature/SKILL.md and implement the notification feature at [route] by following the current project's roadmap, the closest matching UI spec, PRD, local instructions, and any relevant .github/skills/*.`
