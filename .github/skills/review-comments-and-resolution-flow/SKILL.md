---
name: review-comments-and-resolution-flow
description: 'Implement review comment workflows in internal approval or feedback systems. Use for reviewer comments, requested fixes, student or submitter responses, open versus resolved threads, resolution actions, and review-aware notifications.'
argument-hint: '[review comment or resolution change]'
---

# Review Comments And Resolution Flow

Use this skill for workflows where staff review a submission, leave comments, request fixes, and later resolve those review issues.

## Use When

- Adding reviewer comments to a detail or review page
- Requesting fixes or follow-up on submitted data or documents
- Letting submitters respond or act on comments
- Tracking open vs resolved review issues

## Quick Rules

- Comments are workflow objects, not just display text.
- Resolution state should be explicit and queryable.
- Only allowed roles can create, respond to, or resolve comments.
- Review notifications should be emitted from server-side comment actions.

## Load Next

For the comment model, resolution procedure, and thread-state checklist, load [the playbook](./references/playbook.md).