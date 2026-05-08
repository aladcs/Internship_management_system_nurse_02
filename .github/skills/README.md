# Skills Index

This folder contains reusable implementation skills for internal web apps with RBAC, managed accounts, review workflows, dashboards, Prisma-backed data, and federated login. Many examples use academic or internship language, but the patterns are intended to transfer to other role-based projects.

Use this index to pick the right skill before opening a specific `SKILL.md`.

## Core App And RBAC

- `nextjs-prisma-rbac-slice`
  - Use for a single feature slice with route, UI, Prisma, RBAC, and validation.
- `prisma-postgres-app-conventions`
  - Use for schema changes, migrations, generated Prisma issues, and DB-backed query patterns.
- `staff-managed-auth-accounts`
  - Use for pre-provisioned login, admin-created accounts, temporary passwords, and password reset RBAC.

## Workflow And Self-Service Submission

- `internship-workflow-status-rules`
  - Use for submit/review lifecycle states such as `draft`, `pending`, `needs_fix`, `in_progress`, `completed`, editability, and status transitions.
- `student-form-with-file-upload`
  - Use for long self-service forms, draft vs submit, upload/remove flows, and read-only mode.
- `document-submission-and-verification`
  - Use for required document uploads, verification statuses, resubmission, and reviewer actions.
- `consent-and-policy-acceptance-flow`
  - Use for TOS, consent, PDPA acknowledgement, and gating access or submission until acceptance is recorded.

## Review, Notifications, And Audit

- `admin-notification-pattern`
  - Use for DB-backed staff or operator notifications, optional external fan-out, read state, and navigation metadata.
- `review-comments-and-resolution-flow`
  - Use for reviewer comments, requested fixes, replies, open/resolved threads, and review side effects.
- `activity-log-timeline-pattern`
  - Use for recording who changed what and when, and rendering timeline or audit pages.

## Dashboard And Operational Views

- `role-scoped-dashboard-metrics`
  - Use for dashboard cards, counts, recent activity, notifications, and role-filtered summaries.
- `placement-or-rotation-workflow`
  - Use for practicum, clinical placement, ward assignment, preceptor mapping, schedule windows, and placement statuses.

## OAuth And Federated Login

- `google-oauth-web-login`
  - Use for Google authorize redirect, callback, state validation, token exchange, and profile retrieval.
- `session-cookie-auth-pattern`
  - Use for app-managed authenticated sessions, cookie settings, logout, expiry, and protected routes.
- `federated-auth-account-linking`
  - Use for linking OAuth identities to existing accounts, pre-provisioned access, and duplicate prevention.
- `oauth-role-mapping-and-onboarding`
  - Use for mapping roles from the DB after OAuth login, consent/profile gates, and role-based redirects.

## How To Pick Quickly

- Need one new feature page or route: start with `nextjs-prisma-rbac-slice` or `implement-feature`.
- Need DB or schema work: add `prisma-postgres-app-conventions`.
- Need submit/review/editability behavior: check `internship-workflow-status-rules`, `student-form-with-file-upload`, or `document-submission-and-verification`.
- Need comment, notification, or history side effects: check `review-comments-and-resolution-flow`, `admin-notification-pattern`, or `activity-log-timeline-pattern`.
- Need role-aware dashboard or assignment operations: check `role-scoped-dashboard-metrics` or `placement-or-rotation-workflow`.
- Need Google login or app auth: check the OAuth and federated login group.

## Structure

- Each skill has a lightweight `SKILL.md` for discovery.
- Detailed workflow guidance lives in `references/playbook.md` inside each skill folder.
- Adapt role names, route paths, and product terms to the current repository instead of copying example labels literally.
