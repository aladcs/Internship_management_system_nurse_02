---
name: admin-notification-pattern
description: 'Implement admin notification workflows for internal review systems. Use for creating database-backed notification events, optional external delivery, targetPath/entity metadata, mark-as-read behavior, dashboard revalidation, and student submit or edit alerts.'
argument-hint: '[event or notification flow to add]'
---

# Admin Notification Pattern

Use this skill when admin-facing notifications are triggered by student or review workflow events.

## Use When

- Creating DB-backed notifications on submit, edit, review, or status change
- Wiring notification metadata for feed rendering and click-through navigation
- Adding optional external delivery such as Telegram, email, or webhook fan-out
- Implementing mark-as-read flows and UI revalidation

## Quick Rules

- Database notifications are the source of truth.
- External delivery must be best-effort and non-blocking.
- Each event should carry enough metadata for stable navigation and filtering.

## Load Next

For the event shape, fan-out procedure, and revalidation checklist, load `./references/playbook.md`.