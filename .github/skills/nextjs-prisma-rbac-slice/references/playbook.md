# Next.js Prisma RBAC Slice Playbook

## Procedure

1. Identify the feature boundary.
   - Confirm route, actor, expected behavior, and matching product/UI spec.
2. Find the deciding code path.
   - Start from the route, server action, or data loader that directly controls behavior.
3. Map the minimum files required.
   - Route in `src/app/**`
   - UI in `src/components/**`
   - Business logic in `src/lib/**`
   - Route protection in `src/proxy.ts`
4. Implement Prisma-backed data access.
   - Reuse existing query helpers.
   - Keep `select` and `include` payloads narrow.
5. Build the UI surface.
   - Follow the matching UI spec.
   - Reuse existing layout and component patterns.
6. Enforce RBAC end to end.
   - Block route access in `src/proxy.ts`.
   - Re-check role and ownership in server mutations.
7. Validate narrowly.
   - Prefer the smallest relevant route, action, build, or typecheck verification.

## RBAC Checklist

- `super_admin` manages admin accounts only
- `admin` manages student data only
- `student` can access and edit only owned data
- New protected routes are added to `src/proxy.ts`
- Any central role allowlist/helper stays in sync with route changes
- Sensitive mutations verify role again server-side

## Failure Modes

- Adding a page but forgetting `src/proxy.ts`
- Enforcing role only in the UI
- Fetching broad data sets and filtering in the client
- Touching unrelated features in a single slice
- Introducing `middleware.ts` into an App Router app that uses `proxy.ts`