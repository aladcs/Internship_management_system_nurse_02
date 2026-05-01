---
name: internship-workflow-status-rules
description: 'Implement or modify internship-style status workflows in review systems. Use for pending, in_progress, completed, draft, and needs_fix rules; student editability windows; admin-only status changes; read-only completed state; and status-driven notifications or review actions.'
argument-hint: '[status rule or transition to change]'
---

# Internship Workflow Status Rules

Use this skill for workflow states that control review progress, student editability, and admin-only status changes.

## Use When

- Adding or changing `draft`, `pending`, `needs_fix`, `in_progress`, or `completed`
- Defining when students can still edit or resubmit
- Driving notifications, review actions, or read-only UI from status transitions

## Quick Rules

- Admin changes workflow status.
- Students edit only their own record.
- Editability must come from one shared status rule.
- `completed` stays read-only for the student.

## Load Next

For the state model, transition procedure, and consistency checklist, load [the playbook](./references/playbook.md).