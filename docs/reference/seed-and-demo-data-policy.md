# Seed And Demo Data Policy

## Purpose

This file defines how local seed data should support development without confusing product rules.

## Current Local Seed Intent

The project uses seed data to make local regression surfaces testable.

Known seeded roles:

- `super_admin`
- `admin`
- `student`

Known benefits of the seed flow:

- local login with each role is immediately available
- notifications can be exercised through seeded/backfilled receipts
- activity-log and notification surfaces can be tested without manual DB patching

## Policy Rules

- Seed data exists for local development only.
- Seed data should reinforce the real domain model, not bypass it.
- Seed scripts may backfill derived operational data when that improves local testability.
- Seed flows should not justify introducing mock data into production feature code.

## Good Seed Use Cases

- bootstrap baseline roles and accounts
- provide a realistic student workflow record
- ensure notification pages are not empty during local development
- ensure timeline pages have useful regression data

## Anti-Patterns

- depending on seed-only shortcuts in production logic
- using fake placeholder structures that do not match the real schema
- letting seed assumptions drift far from the actual business workflow

## Reuse Guidance

Future internal systems should seed:

- at least one account per key role
- enough workflow data to exercise list, detail, notification, and dashboard surfaces
- enough attachments or comments to test reviewer pages