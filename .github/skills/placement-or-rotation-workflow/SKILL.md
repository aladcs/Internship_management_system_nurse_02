---
name: placement-or-rotation-workflow
description: 'Implement placement, rotation, or assignment workflows in operational systems. Use for practicum, ward, shift, site, cohort, mentor, or assignment mapping; schedule windows; placement statuses; and participant-facing versus staff-facing assignment views.'
argument-hint: '[placement or rotation workflow change]'
---

# Placement Or Rotation Workflow

Use this skill for systems that assign people to sites, units, cohorts, rotations, mentors, or schedule-bound placements.

## Use When

- Building practicum, clinical placement, or rotation assignment flows
- Assigning people to wards, sites, cohorts, mentors, or supervisors
- Adding placement statuses, windows, or schedule-driven constraints
- Creating staff review pages and participant placement summary pages

## Quick Rules

- Placement records should be first-class domain objects, not implicit fields scattered across profiles.
- Assignment authority must be role-restricted server-side.
- Student-facing and staff-facing views should read from the same placement source of truth.
- Placement changes should emit traceable side effects when they affect downstream workflows.

## Load Next

For the data model, assignment procedure, and status checklist, load [the playbook](./references/playbook.md).
