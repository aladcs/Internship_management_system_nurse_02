# Dashboard Metrics Definition

## Purpose

Dashboard metrics should reflect actionable operational state, not generic totals.

## Current Admin Dashboard Intent

The admin dashboard is a summary-first operational page.

Its main jobs are:

- show the size of the student workload
- surface workflow distribution
- highlight recent student activity
- highlight recent notifications requiring attention

## Recommended Core Metrics

### Total Students

- Definition: total number of student records visible to the admin scope
- Use: workload size and system adoption indicator

### Pending

- Definition: count of students whose workflow state is awaiting review
- Use: immediate review queue size

### In Progress

- Definition: count of students in active internship or active processing state
- Use: current operational load

### Completed

- Definition: count of students whose workflow state is fully closed
- Use: throughput and completion visibility

## Supporting Panels

### Recent Students

- Purpose: quick navigation to recent or relevant student records
- Should link directly to detail pages

### Notifications

- Purpose: show recent admin-facing events
- Should align with unread/read state and navigate to the relevant surface

## Rules For Future Dashboards

- Every count must map to a specific queryable business state.
- Counts should use the same definitions as list filters and detail pages.
- Recent activity panels must follow the same role scope as the headline metrics.
- Empty states are valid and should be explicit.

## Reuse Guidance

For future systems, define each dashboard card with:

- metric name
- exact data definition
- who can see it
- why it matters operationally
- what page or action it links toward next