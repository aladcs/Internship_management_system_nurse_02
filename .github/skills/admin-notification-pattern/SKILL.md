---
name: admin-notification-pattern
description: 'Implement staff, operator, or reviewer notification workflows for internal systems. Use for creating database-backed notification events, optional external delivery, targetPath or entity metadata, mark-as-read behavior, dashboard revalidation, and alerts triggered by submission, review, edit, or status-change workflows.'
argument-hint: '[event or notification flow to add]'
---

# Admin Notification Pattern

Use this skill when privileged-user notifications are triggered by submitter, reviewer, approval, or workflow events.

## Use When

- Creating DB-backed notifications on submit, edit, review, approval, or status change
- Wiring notification metadata for feed rendering and click-through navigation
- Adding optional external delivery such as Telegram, email, or webhook fan-out
- Implementing mark-as-read flows and UI revalidation

## Quick Rules

- Database notifications are the source of truth.
- External delivery must be best-effort and non-blocking.
- Each event should carry enough metadata for stable navigation and filtering.

## Load Next

For the event shape, fan-out procedure, and revalidation checklist, load `./references/playbook.md`.
