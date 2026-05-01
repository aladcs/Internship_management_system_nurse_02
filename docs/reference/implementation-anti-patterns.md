# Implementation Anti-Patterns

## Purpose

This file captures mistakes that are easy to repeat across internal academic systems and that tend to waste debugging time.

## Auth And RBAC Anti-Patterns

- Relying on UI-only role checks
- Creating app access automatically on any successful OAuth login
- Deriving internal role solely from provider claims
- Allowing unrestricted `next` redirect targets after login
- Protecting pages but not protecting server actions

## Workflow Anti-Patterns

- Encoding state rules separately in multiple components without a shared source of truth
- Resetting workflow state on any user edit without deliberate product intent
- Treating read-only as a disabled UI style instead of enforcing it server-side

## Data And Prisma Anti-Patterns

- Editing application code to match stale generated Prisma types instead of regenerating
- Bundling unrelated schema cleanup into a feature migration
- Over-fetching relation graphs for simple pages
- Assuming Prisma-level defaults always exist as DB-side defaults in local Postgres

## Notification Anti-Patterns

- Creating notifications only in the client
- Making external delivery mandatory for core mutations to succeed
- Storing too little metadata to navigate from a notification to the relevant record
- Updating read state without revalidating dependent pages

## File And Document Anti-Patterns

- Treating uploaded files as anonymous blobs with no domain metadata
- Letting upload/remove actions bypass workflow lock rules
- Replacing files without enough traceability for review-heavy systems

## Dashboard Anti-Patterns

- Showing global totals to a role that should see only a subset
- Mixing counts from one scope with recent activity from another
- Adding too many low-signal cards that do not drive action

## Process Anti-Patterns

- Implementing multiple features in one slice when the product workflow expects incremental delivery
- Rewriting large areas of the app when the requested change is local
- Adding new dependencies when existing app patterns already cover the problem

## Future Reuse Guidance

Review this file before starting a feature that touches:

- auth
- RBAC
- workflow status
- uploads
- dashboard metrics
- notifications
- Prisma schema or migrations