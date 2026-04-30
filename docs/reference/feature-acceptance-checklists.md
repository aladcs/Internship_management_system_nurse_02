# Feature Acceptance Checklists

## Purpose

Use these checklists before considering a feature slice complete.

## General Feature Slice Checklist

- Feature matches an item in `docs/_features.md` or approved scope
- Matching UI spec was consulted if a page is involved
- Change stays within one coherent feature slice
- Real Prisma-backed data is used
- RBAC is enforced server-side
- Route protection is updated if needed
- Revalidation or refresh behavior was considered for affected pages
- A narrow validation step was run

## New Route / Page Checklist

- Route exists in the correct App Router location
- Access role is documented
- `src/proxy.ts` was checked for protection changes
- Empty state is handled if applicable
- Navigation path into the page is consistent with user role

## New Mutation Checklist

- Input is validated
- Actor authority is verified server-side
- Owned-resource access is verified when relevant
- Side effects are intentional
- Notifications, activity logs, and revalidation were considered

## File Upload Feature Checklist

- Upload path or metadata is deterministic
- File ownership is clear
- Remove/replace behavior is defined
- Read-only states block upload mutations where required
- UI and server rules agree on lock behavior

## Workflow Status Change Checklist

- Allowed actor is explicit
- Transition is valid from the current state
- Read-only vs editable surfaces stay consistent after transition
- Dashboard/list/detail definitions still align
- Notifications or logs fire when required

## Auth Feature Checklist

- Authentication and authorization are not conflated
- Redirect behavior is safe
- Protected routes and protected actions both enforce access
- Student TOS or onboarding gates still behave correctly if impacted

## OAuth Feature Checklist

- External identity is matched against the local account model
- Access denial path is explicit for unknown users
- Safe redirect rules are preserved
- Session is created only after local authorization passes

## Dashboard Feature Checklist

- Each metric has an exact business definition
- Metric scope matches the viewer's role
- Recent lists and notification panels share the same visibility rules
- Empty states are acceptable and readable