---
name: activity-log-timeline-pattern
description: 'Build activity log and timeline views for internal systems. Use for recording who changed what and when, rendering audit-friendly timeline pages, linking events back to affected entities, filtering by event type or actor, and keeping logs aligned with workflow actions.'
argument-hint: '[activity log or timeline feature]'
---

# Activity Log Timeline Pattern

Use this skill for internal systems that need a readable history of important actions across records, reviews, approvals, or documents.

## Use When

- Recording audit-friendly activity after important mutations
- Building timeline pages or recent-activity dashboards
- Linking events back to affected entities or detail pages
- Filtering history by event type, actor, or date

## Quick Rules

- Activity logs should be written from server-side actions close to the mutation.
- Each event needs actor, action, timestamp, and target context.
- Timeline pages should favor readable summaries but retain enough raw metadata for filtering.
- Logs support traceability; do not silently drop important workflow actions.

## Load Next

For the event schema, write-path procedure, and timeline checklist, load [the playbook](./references/playbook.md).