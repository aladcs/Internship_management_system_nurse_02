---
name: student-form-with-file-upload
description: 'Build or modify a student-facing long form with file upload in a Next.js internal app. Use for multi-section forms, save-draft vs submit behavior, status-based read-only mode, drag-and-drop uploads, file removal, sticky action bars, and admin-facing side effects after student changes.'
argument-hint: '[form change or upload flow]'
---

# Student Form With File Upload

Use this skill for long student forms that support drafts, final submission, file attachments, and status-based read-only behavior.

## Use When

- Building or modifying a multi-section student form in App Router
- Adding save-draft vs final-submit behavior
- Implementing upload, file-list, remove, and read-only states
- Triggering admin-facing side effects after student changes

## Quick Rules

- Students edit only their own record.
- Read-only mode should be a distinct page state, not only disabled fields.
- Upload and remove flows must obey the same status lock rules as form edits.
- Sticky action bars and sectioned layout should be preserved for long forms.

## Load Next

For the section model, upload procedure, and validation checklist, load [the playbook](./references/playbook.md).