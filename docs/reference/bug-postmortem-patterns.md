# Bug Postmortem Patterns

## Purpose

This file records recurring bug shapes that are likely to reappear in internal academic systems.

## Pattern 1: RBAC Checked Only In UI

Symptoms:

- buttons hide correctly but direct mutation calls still succeed

Root cause:

- server-side authority checks were missing or incomplete

Prevention:

- always validate role and ownership in the mutation path

## Pattern 2: Protected Route Missing From `proxy.ts`

Symptoms:

- page exists and works, but unauthorized users can still reach it directly

Root cause:

- route protection list was not updated when the page was added

Prevention:

- treat route registration and route protection as one checklist item

## Pattern 3: Stale UI After Successful Mutation

Symptoms:

- data changed in DB but dashboard, notifications, or detail page still show old values

Root cause:

- required revalidation or refresh surfaces were missed

Prevention:

- map direct page, count page, and recent-activity page after each mutation

## Pattern 4: Workflow Rules Drift Across Pages

Symptoms:

- overview says editable, form says locked, or server action rejects while UI looks allowed

Root cause:

- workflow editability logic was duplicated in too many places

Prevention:

- centralize state-derived editability and role rules

## Pattern 5: Prisma Client Drift

Symptoms:

- TypeScript shows missing Prisma symbols or wrong generated types after schema edits

Root cause:

- generated client was stale

Prevention:

- regenerate Prisma artifacts before changing imports or broader code

## Pattern 6: Notification Exists But Cannot Navigate

Symptoms:

- notification appears in UI but clicking it leads nowhere useful

Root cause:

- event metadata such as `targetPath`, `entityType`, or `entityId` was incomplete

Prevention:

- define navigation metadata as part of the event contract, not as an afterthought

## Pattern 7: OAuth Login Grants Too Much

Symptoms:

- any provider-authenticated user can enter a restricted app

Root cause:

- external authentication was mistaken for internal authorization

Prevention:

- require local account existence and role resolution before session creation