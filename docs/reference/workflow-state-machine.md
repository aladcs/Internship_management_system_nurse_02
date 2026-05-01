# Workflow State Machine

## Primary Entity

The student workflow is driven by `Student.internshipStatus`.

Current states:

- `draft`
- `pending`
- `needs_fix`
- `in_progress`
- `completed`

## State Intent

### `draft`

- Student has started but not formally submitted.
- Student can edit.
- Admin should not treat the record as ready for review.

### `pending`

- Student has submitted and the record is awaiting admin review.
- Student may still be allowed to edit depending on product rules, but the record is in the review queue.

### `needs_fix`

- Admin requested revision.
- Student can edit and resubmit.

### `in_progress`

- Internship or review process is actively ongoing.
- Student edits are allowed by current business rules.
- Student edits during this state should notify admin and preserve the active state unless a future PRD changes that rule.

### `completed`

- Final locked state for the student.
- Student-facing form is read-only.
- Admin can still inspect the record.

## Actor Rules

- Admin changes workflow state.
- Student does not directly set arbitrary states.
- Student can trigger transitions indirectly through submit/resubmit actions.

## Canonical Transition Patterns

### Student-driven

- `draft` -> `pending` on first submit
- `needs_fix` -> review state on resubmit
- `in_progress` -> `in_progress` on allowed edit, with admin notification side effect

### Admin-driven

- `pending` -> `needs_fix`
- `pending` -> `in_progress`
- `in_progress` -> `completed`

## Editability Rules

Student-facing editability should be derived from a shared rule.

Currently editable for student:

- `draft`
- `pending`
- `needs_fix`
- `in_progress`

Currently read-only for student:

- `completed`

## Side Effects By Transition

Examples of side effects the system already uses or implies:

- Submit/resubmit -> notification event for admins
- Student edit during `in_progress` -> notification event for admins
- Status change -> admin-facing state updates and possible activity logs

## UI Implications

- Overview page shows workflow state prominently.
- Form page uses a separate read-only mode when editing is blocked.
- Admin detail page exposes status controls and a visible current state.
- Dashboard and student list counts should map back to these states directly.

## Reuse Guidance

This state-machine document is reusable for:

- internship workflows
- document submission and review
- practicum or placement progress tracking
- approval flows where submitter editability changes over time

When reusing, preserve these concepts even if the names change:

- started but unsubmitted
- submitted and awaiting review
- revision requested
- active/in-flight
- final locked state