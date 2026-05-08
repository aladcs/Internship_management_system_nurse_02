---
name: internship-workflow-status-rules
description: 'Implement or modify submission or review status workflows in internal systems. Use for pending, in_progress, completed, draft, needs_fix, or equivalent states; submitter editability windows; reviewer-only status changes; read-only terminal states; and status-driven notifications or review actions.'
argument-hint: '[status rule or transition to change]'
---

# Internship Workflow Status Rules

Use this skill for workflow states that control review progress, submitter editability, and reviewer-only status changes.

## Use When

- Adding or changing `draft`, `pending`, `needs_fix`, `in_progress`, or `completed`
- Defining when submitters can still edit or resubmit
- Driving notifications, review actions, or read-only UI from status transitions

## Quick Rules

- Privileged reviewers change workflow status.
- Self-service users edit only their own record.
- Editability must come from one shared status rule.
- Terminal completed states stay read-only for the submitter.

## Load Next

For the state model, transition procedure, and consistency checklist, load [the playbook](./references/playbook.md).
