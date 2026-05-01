# Placement Or Rotation Workflow Playbook

## Recommended Model

- Placement or rotation record
- Student or participant linkage
- Site, ward, unit, or organization linkage
- Supervisor, instructor, or preceptor linkage when applicable
- Start and end dates or schedule window
- Placement status such as `planned`, `assigned`, `confirmed`, `active`, `completed`, `cancelled`
- Optional notes, constraints, or capacity metadata

## Procedure

1. Identify the assignment unit.
   - Per student, cohort, course section, or term.
2. Define who can assign or change placement.
   - Staff, coordinator, admin, or instructor.
3. Persist placement as a dedicated DB-backed record.
4. Define placement statuses and allowed transitions.
5. Build role-specific views.
   - Staff view for assigning, reviewing, and updating
   - Student view for seeing confirmed placement details
6. Handle schedule and overlap constraints.
   - Prevent duplicate or conflicting active placements where business rules require it.
7. Emit side effects when assignment changes matter.
   - Notifications
   - Activity logs
   - Dashboard metrics
8. Validate full flows.
   - Assign
   - Reassign
   - Confirm
   - Complete or cancel

## Status Checklist

- Placement status is explicit and queryable
- Assignment authority is enforced in server-side mutations
- Student view does not expose privileged assignment controls
- Overlap or capacity checks run where required
- Changes can be traced back through notifications or activity logs when needed

## Failure Modes

- Hiding placement inside generic profile fields instead of a dedicated workflow model
- Letting UI-only checks control who can assign or reassign
- Failing to reconcile schedule conflicts or duplicate active placements
- Staff and student pages showing different placement truth due to duplicated data paths