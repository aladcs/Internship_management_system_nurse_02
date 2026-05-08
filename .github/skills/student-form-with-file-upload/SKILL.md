---
name: student-form-with-file-upload
description: 'Build or modify a self-service long form with file upload in a Next.js internal app. Use for multi-section forms, save-draft versus submit behavior, status-based read-only mode, drag-and-drop uploads, file removal, sticky action bars, and staff-facing side effects after submitter changes.'
argument-hint: '[form change or upload flow]'
---

# Student Form With File Upload

Use this skill for long self-service forms that support drafts, final submission, file attachments, and status-based read-only behavior.

## Use When

- Building or modifying a multi-section self-service form in App Router
- Adding save-draft vs final-submit behavior
- Implementing upload, file-list, remove, and read-only states
- Triggering staff-facing side effects after submitter changes

## Quick Rules

- Submitters edit only their own record.
- Read-only mode should be a distinct page state, not only disabled fields.
- Upload and remove flows must obey the same status lock rules as form edits.
- Sticky action bars and sectioned layout should be preserved for long forms.

## Load Next

For the section model, upload procedure, and validation checklist, load [the playbook](./references/playbook.md).
