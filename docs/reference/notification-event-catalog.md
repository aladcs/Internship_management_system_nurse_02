# Notification Event Catalog

## Purpose

Notification events should be explicit, typed, and reusable across dashboard feeds, notifications pages, and optional external delivery channels.

## Current Event Types

- `form_submitted`
- `form_resubmitted`
- `form_updated`
- `form_updated_in_progress`
- `file_changed_in_progress`
- `status_changed`

## Event Shape

Each event should carry:

- `type`
- `title`
- `message`
- `targetPath` when direct navigation is known
- `entityType` and `entityId` for fallback resolution
- creation timestamp

Admin-specific delivery state lives in `AdminNotificationReceipt`.

## Trigger Catalog

### `form_submitted`

- Trigger: first formal student submit
- Audience: admins
- Expected outcome: review queue awareness

### `form_resubmitted`

- Trigger: student resubmits after requested fixes
- Audience: admins
- Expected outcome: reviewer knows the record is ready again

### `form_updated`

- Trigger: significant student form update when the product wants admin awareness
- Audience: admins if business rules say the edit matters operationally

### `form_updated_in_progress`

- Trigger: student edits while the record is already active/in-progress
- Audience: admins
- Expected outcome: admin is alerted without resetting the workflow state automatically

### `file_changed_in_progress`

- Trigger: file add/remove/change while the record is active/in-progress
- Audience: admins
- Expected outcome: reviewer knows supporting documents changed

### `status_changed`

- Trigger: admin changes workflow status
- Audience: currently implementation-dependent; in future systems may include submitter and staff audiences

## Delivery Principles

- Database event is the source of truth.
- External delivery is best-effort.
- Missing external configuration must not block the primary mutation.
- Read/unread is tracked per admin recipient when needed.

## Reuse Guidance

For future systems, every notification type should document:

- trigger event
- audience
- required metadata
- navigation target
- whether external delivery is desired or optional