# Workflow Status Rules Playbook

## State Model

- `draft`: started but not formally submitted
- `pending`: submitted and awaiting review
- `needs_fix`: reviewer requested revision, submitter may edit and resubmit
- `in_progress`: approved or actively tracked, with submitter edit behavior defined by product rules
- `completed`: locked for the submitter and display-only in self-service surfaces

## Procedure

1. Define allowed transitions.
   - Write down who may move from state A to state B.
2. Find the server-side decision point.
   - Keep transitions in server actions, route handlers, or domain helpers.
3. Enforce actor restrictions.
   - Reviewer-only transitions stay reviewer-only.
   - Self-service users mutate only owned records.
4. Centralize editability from status.
   - Overview, form, and mutations should all share the same rule.
5. Handle submit and resubmit explicitly.
   - `draft` to `pending`
   - `needs_fix` back into review
6. Preserve active-review state intentionally.
   - If edits during `in_progress` should notify reviewers without resetting status, encode that rule directly.
7. Revalidate dependent pages.
8. Validate both editable and read-only states.

## Consistency Checklist

- Status enum or constants are centralized
- Allowed transitions are server-side
- Submitter editability uses a shared rule
- `completed` blocks submitter editing end to end
- Submit/resubmit behavior is explicit
- Notifications and activity logs run from server-side transitions when needed

## Failure Modes

- UI looks editable while the mutation path is locked, or the reverse
- Status resets accidentally on any submitter edit
- Reviewer status changes are allowed before first submit when business rules forbid it
- Workflow rules drift across overview, form, and server actions
