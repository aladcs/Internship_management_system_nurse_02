---
name: role-scoped-dashboard-metrics
description: 'Build dashboard metrics and summary cards that change by role in internal systems. Use for role-scoped counts, recent activity panels, summary cards, unread notification counts, ownership-filtered queries, and dashboard pages for admin, staff, instructor, or student users.'
argument-hint: '[dashboard metric or role-scoped summary change]'
---

# Role-Scoped Dashboard Metrics

Use this skill for dashboard pages where summary counts, recent activity, and visible cards depend on the current user's role or ownership scope.

## Use When

- Building dashboard summary cards for different roles
- Showing counts filtered by ownership, cohort, site, or assignment scope
- Combining metrics with recent activity or notification panels
- Adding unread badges or queue counts that must match role permissions

## Quick Rules

- Metrics must be filtered server-side by the viewer's role and scope.
- Dashboard cards should show operationally meaningful counts, not raw totals with no decision value.
- Recent activity and notification panels should align with the same role scope as the metrics.
- Empty states should remain explicit when a role has no visible data.

## Load Next

For the metric design procedure, query checklist, and common dashboard slices, load [the playbook](./references/playbook.md).