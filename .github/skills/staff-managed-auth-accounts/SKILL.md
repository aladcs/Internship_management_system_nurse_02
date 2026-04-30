---
name: staff-managed-auth-accounts
description: 'Implement or modify staff-managed authentication and account lifecycle rules in an internal app. Use for login-by-existing-email, role-based redirects, admin-created accounts, temporary password generation, and strict password reset RBAC for super_admin, admin, and student roles.'
argument-hint: '[auth change or account workflow]'
---

# Staff-Managed Auth Accounts

Use this skill for internal systems where users cannot self-register and accounts are provisioned or reset only by privileged staff.

## Use When

- Implementing login-by-existing-email
- Adding admin-created or super-admin-created account flows
- Changing temporary password generation or password reset behavior
- Enforcing role-based account authority and redirect rules

## Quick Rules

- No public registration.
- `super_admin` manages `admin` accounts only.
- `admin` manages `student` accounts only.
- Temporary passwords are generated server-side and shown once in the privileged flow.

## Load Next

For the access matrix, password-handling procedure, and validation checklist, load [the playbook](./references/playbook.md).