# Revalidation Map

## Purpose

This file captures which surfaces commonly need refresh or revalidation after important mutations.

## Core Principle

If a mutation changes shared operational state, every page that summarizes or directly renders that state should be refreshed intentionally.

## Known High-Value Revalidation Relationships

### Notification Creation Or Read-State Changes

Mutations in notification flows should consider revalidating:

- admin dashboard
- student list
- student detail
- notifications page

Reason:

- unread counts change
- recent notification panels change
- detail pages may show recent or related activity

### Student Form Save / Submit / Resubmit

Mutations in student form flows should consider revalidating:

- student overview
- student form
- admin dashboard
- student list
- student detail
- notifications page when a notification is created

Reason:

- summary information changes
- workflow status may change
- recent activity and alert panels may change

### Student TOS Acceptance

Mutations in TOS acceptance should consider revalidating:

- student overview
- any TOS-gated student route or layout state if cached

Reason:

- route gating and first-access behavior change immediately

### Admin Status Change

Mutations in admin review/status actions should consider revalidating:

- student detail
- student list
- admin dashboard
- student overview
- student form when lock behavior changes

Reason:

- status badges, counts, and editability can all change at once

## Reuse Guidance

For future systems, every mutation should answer:

- Which page shows the edited record directly?
- Which page shows counts derived from that record?
- Which page shows recent activity or notifications derived from that record?
- Which page's permissions or editability changed because of the mutation?