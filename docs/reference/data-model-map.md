# Data Model Map

## Core Domain Overview

The current domain centers on a staff-managed user system, a student profile, an internship record, uploaded files, notifications, review comments, and activity logs.

## Main Models

### `User`

Represents the authenticated account.

Important fields:

- `email`
- `passwordHash`
- `role`
- `name`
- `createdById`

Key relationships:

- One optional `Student` profile
- Many created users
- Many admin notification receipts
- Many admin review comments as author
- Many activity logs as actor

### `Student`

Represents the main student-owned business record.

Important fields:

- `internshipStatus`
- `tosAcceptedAt`
- student identity and contact fields
- education fields
- `submittedAt`
- `lastStudentEditAt`

Key relationships:

- One `User`
- One optional `Internship`
- Many `UploadedFile`
- Many `NotificationEvent`
- Many `ReviewComment`
- Many `ActivityLog`

### `Internship`

Represents the internship-specific details linked one-to-one with a student.

Important fields:

- `position`
- `departmentUnit`
- `supervisorName`
- `startDate`
- `endDate`
- `additionalDetails`

### `UploadedFile`

Represents one uploaded file owned by a student.

Important fields:

- `fileName`
- `filePath`
- `mimeType`
- `sizeBytes`

### `NotificationEvent`

Represents one notification event in the system.

Important fields:

- `type`
- `title`
- `message`
- `targetPath`
- `entityId`
- `entityType`

Key relationship:

- Many `AdminNotificationReceipt`

### `AdminNotificationReceipt`

Represents the read state of a notification event for one admin.

Important fields:

- `adminUserId`
- `notificationEventId`
- `isRead`
- `readAt`

### `ReviewComment`

Represents a review note on a student record.

Important fields:

- `studentId`
- `adminId`
- `message`

### `ActivityLog`

Represents an audit-friendly action tied to a student record.

Important fields:

- `actorId`
- `studentId`
- `action`
- `message`
- `metadata`

## Relationship Diagram In Words

- A `User` may own one `Student` profile.
- A `Student` owns one workflow state and one optional `Internship` record.
- A `Student` owns many uploaded files.
- A `Student` also accumulates review comments, activity logs, and notification events.
- A `NotificationEvent` fans out to many `AdminNotificationReceipt` rows, one per admin recipient.
- An admin `User` can author review comments and appear as the actor in activity logs.

## Domain Boundaries

- Authentication identity lives on `User`.
- Student business state lives on `Student`.
- Internship-specific details live on `Internship`.
- File metadata lives on `UploadedFile`.
- Admin alerting lives on `NotificationEvent` plus `AdminNotificationReceipt`.
- Review discussion lives on `ReviewComment`.
- Audit history lives on `ActivityLog`.

## Reuse Guidance

For future academic systems, this model can be generalized as:

- `User` -> account and role
- `Participant` -> primary business record
- `Submission` or `Placement` -> workflow-specific details
- `UploadedDocument` -> owned files
- `NotificationEvent` + `Receipt` -> multi-recipient notification state
- `ReviewComment` -> reviewer feedback
- `ActivityLog` -> history and traceability