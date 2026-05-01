---
name: placement-or-rotation-workflow
description: 'Implement placement, rotation, or assignment workflows in academic systems. Use for practicum or ward assignments, site allocation, supervisor or preceptor mapping, schedule windows, placement statuses, and student-facing versus staff-facing placement views.'
argument-hint: '[placement or rotation workflow change]'
---

# Placement Or Rotation Workflow

Use this skill for systems that assign students to clinical sites, wards, units, rotations, supervisors, or practicum schedules.

## Use When

- Building practicum, clinical placement, or rotation assignment flows
- Assigning students to wards, sites, cohorts, or preceptors
- Adding placement statuses, windows, or schedule-driven constraints
- Creating staff review pages and student placement summary pages

## Quick Rules

- Placement records should be first-class domain objects, not implicit fields scattered across profiles.
- Assignment authority must be role-restricted server-side.
- Student-facing and staff-facing views should read from the same placement source of truth.
- Placement changes should emit traceable side effects when they affect downstream workflows.

## Load Next

For the data model, assignment procedure, and status checklist, load [the playbook](./references/playbook.md).