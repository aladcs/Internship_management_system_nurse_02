# Role-Scoped Dashboard Metrics Playbook

## Common Dashboard Slices

- Total entities visible to the current role
- Counts by workflow status
- Items needing action soon or now
- Recent activity rows linked to detail pages
- Notification summaries and unread counts
- Ownership-scoped queues for instructors, coordinators, or admins

## Procedure

1. Identify the role and viewing scope.
   - Global admin, department staff, instructor, or student.
2. Decide which metrics support decisions.
   - Counts should answer what needs review, action, or follow-up.
3. Build server-side queries that enforce role scope.
   - Filter by ownership, assignment, cohort, or managed entity set.
4. Keep the dashboard summary-oriented.
   - Use concise cards and recent-activity panels instead of dense filters.
5. Align secondary panels with the same scope.
   - Notifications and recent activity should not leak data outside the metric scope.
6. Provide explicit empty states.
7. Revalidate or refresh the dashboard after mutations that affect counts.
8. Validate visible and hidden data across roles.

## Query Checklist

- Counts are filtered by role and ownership in server code
- Status buckets match workflow definitions used elsewhere
- Recent activity and notification lists follow the same visibility boundaries
- Card totals can be explained from real business logic
- Dashboard remains lightweight and summary-first

## Failure Modes

- Returning global totals to roles that should see only a subset
- Mixing counts from one scope with recent activity from another
- Showing too many low-value cards and losing operational focus
- Recomputing expensive dashboard queries more broadly than necessary