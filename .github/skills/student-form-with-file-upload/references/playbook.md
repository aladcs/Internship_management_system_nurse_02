# Student Form With File Upload Playbook

## Form Model

- The form is the canonical editable surface for the student's own record.
- It may support both first submit and later edits.
- Editability depends on workflow status.
- Read-only mode should be a separate visual state, not merely disabled inputs.

## Recommended UI Pattern

- Shared authenticated page shell
- Back-to-overview navigation
- Stacked section cards
- Responsive field grid
- Drag-and-drop upload zone with native picker fallback
- Uploaded file list with remove actions
- Sticky bottom action bar
- Dedicated read-only replacement card

## Procedure

1. Confirm students can edit only their own record.
2. Split the form by sections.
   - Personal information
   - Education
   - Internship details
   - File attachments
3. Define draft-save vs final-submit behavior.
4. Centralize editability so rendering and mutations share the same status rule.
5. Implement upload behavior.
   - Support click-to-upload and drag-and-drop.
   - Track uploaded files as first-class records.
   - Block remove actions in read-only states.
6. Trigger notifications or activity logs after meaningful student changes when required.
7. Preserve the long-form UX.
   - Sticky action bar remains visible.
   - Validation is inline.
   - Read-only mode replaces the form with a clear explanation.
8. Validate editable, read-only, upload/remove, and draft/submit states.

## File Handling Checklist

- File ownership maps to the current student record
- Storage path or metadata is deterministic
- File rows show recognizable metadata
- Upload errors are surfaced clearly

## Failure Modes

- Upload or remove actions bypass status lock rules
- Read-only is only cosmetic and does not protect server mutations
- Draft-save and final-submit behavior are ambiguous
- Admin-facing side effects are omitted after student edits