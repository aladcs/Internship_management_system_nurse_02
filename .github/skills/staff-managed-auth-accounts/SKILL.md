---
name: staff-managed-auth-accounts
description: 'Implement or modify staff-managed authentication and account lifecycle rules in an internal app. Use for login-by-existing-email, role-based redirects, operator-created accounts, temporary password generation, and strict password reset RBAC across hierarchical or role-scoped account types.'
argument-hint: '[auth change or account workflow]'
---

# Staff-Managed Auth Accounts

Use this skill for internal systems where users cannot self-register and accounts are provisioned or reset only by privileged staff.

## Use When

- Implementing login-by-existing-email
- Adding operator-created account flows for lower-privilege users
- Changing temporary password generation or password reset behavior
- Enforcing role-based account authority and redirect rules

## Quick Rules

- No public registration.
- Higher-privilege roles manage only the account types allowed by the product.
- Lower-privilege or self-service users do not manage peer or higher-privilege accounts.
- Temporary passwords are generated server-side and shown once in the privileged flow.

## Load Next

For the access matrix, password-handling procedure, and validation checklist, load [the playbook](./references/playbook.md).
