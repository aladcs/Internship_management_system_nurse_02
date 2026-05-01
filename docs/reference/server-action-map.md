# Server Action Map

## Purpose

This file gives a high-level map of server action surfaces so future work can start from the correct slice quickly.

## Auth And Login

- `src/app/login/actions.ts`
  - Responsibility: email/password sign-in
  - Side effects: session creation, safe redirect resolution

## Student Surfaces

- `src/app/intern/overview/actions.ts`
  - Responsibility: student overview-adjacent actions

- `src/app/intern/form/actions.ts`
  - Responsibility: student form save, submit, file-related side effects
  - Known side effects: notification event creation, in-progress update handling, revalidation across admin and student surfaces

- `src/app/intern/tos/actions.ts`
  - Responsibility: student TOS acceptance and gating flow completion

## Account Self-Service

- `src/app/intern/account/name/actions.ts`
  - Responsibility: change display name

- `src/app/intern/account/password/actions.ts`
  - Responsibility: change own password

## Super Admin Surface

- `src/app/intern/admins/actions.ts`
  - Responsibility: create admin, edit admin, delete admin, reset admin password

## Admin Student Management

- `src/app/intern/admin/students/actions.ts`
  - Responsibility: list-adjacent actions, create student, reset student password, other student management actions on the collection surface

- `src/app/intern/admin/students/[id]/actions.ts`
  - Responsibility: record-specific admin actions such as review/status/detail-edit side effects

## Admin Dashboard

- `src/app/intern/dashboard/actions.ts`
  - Responsibility: dashboard-adjacent actions such as read state or summary-triggered mutations

## Route Handlers Related To Auth And Files

- `src/app/intern/auth/cmu/route.ts`
- `src/app/intern/auth/cmu/callback/route.ts`
- `src/app/intern/auth/google/route.ts`
- `src/app/intern/auth/google/callback/route.ts`
- `src/app/intern/api/auth/callback/route.ts`
  - Responsibility: auth provider entry and callback flows

- `src/app/intern/api/student-files/[studentId]/[fileName]/route.ts`
- `src/app/intern/api/student-profile-images/[studentId]/[fileName]/route.ts`
- `src/app/uploads/student-profile-images/[studentId]/[fileName]/route.ts`
  - Responsibility: protected file and image delivery paths

## Reuse Guidance

When starting a change:

- auth bug -> start with login or OAuth actions/routes
- workflow bug -> start with form or student detail actions
- account-management bug -> start with `admins/actions.ts` or student collection/detail actions
- stale UI bug -> check the mutation path first, then the revalidation map