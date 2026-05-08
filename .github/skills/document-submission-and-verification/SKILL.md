---
name: document-submission-and-verification
description: 'Build or modify document submission and verification workflows in internal systems. Use for self-service or staff uploads, required-document completeness checks, verification status, resubmission rules, reviewer actions, and document-centered operations pages.'
argument-hint: '[document workflow or verification change]'
---

# Document Submission And Verification

Use this skill for internal systems where users submit required documents and reviewers verify completeness, validity, or approval status.

## Use When

- Building upload-and-review flows for required documents
- Adding completeness or verification statuses
- Implementing resubmission after rejection or requested fixes
- Creating operations pages centered on document review and verification

## Quick Rules

- Documents are tracked as first-class records, not only as loose files.
- Verification state must live in server-side data, not only UI state.
- Resubmission rules should be explicit and tied to workflow status.
- Reviewer actions must be role-restricted and auditable.

## Load Next

For the document model, verification procedure, and reviewer checklist, load [the playbook](./references/playbook.md).
