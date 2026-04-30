# Document Lifecycle

## Purpose

This project already contains the basic ingredients of a document workflow through uploaded files, student submission, admin review, notifications, and activity logs.

The document lifecycle below is the reusable pattern to preserve for future systems.

## Core Stages

### 1. Draft / Not Yet Submitted

- Files may exist before formal submission.
- Student can still add or remove files.
- Staff should not interpret files as finalized.

### 2. Submitted

- Student formally submits the record for review.
- File set becomes part of the review package.
- Admin receives notification.

### 3. Under Review

- Staff inspects uploaded files and related form data.
- Review comments or requested fixes may be created.

### 4. Needs Revision

- Staff requests corrections.
- Student can replace files, adjust metadata, and resubmit.

### 5. Active / In Progress

- Submission is accepted into the active workflow.
- Student edits may still be allowed under business rules.
- Changes should notify staff and be traceable.

### 6. Completed / Locked

- Student-facing editing is blocked.
- Files remain viewable but should not be casually mutated.

## Data Requirements Per File

Each file record should retain:

- owner record id
- original display name
- storage path
- mime type
- size
- creation timestamp

Useful future additions for stricter document systems:

- document category
- document version number
- reviewer decision
- rejection reason
- replaced-by link

## Reviewer Expectations

- Files can be downloaded reliably.
- Reviewers can understand what the file is without opening storage internals.
- Document-related actions can trigger comments, notifications, and activity logs.

## Reuse Guidance

This lifecycle is reusable for:

- practicum documents
- onboarding paperwork
- compliance files
- request attachments
- verification packets