---
name: federated-auth-account-linking
description: 'Implement account linking for federated login in internal systems. Use for matching OAuth identities to existing accounts, preventing duplicate users, restricting sign-in to pre-provisioned or invited accounts, linking by email or subject identifier, and handling first-login account binding safely.'
argument-hint: '[account linking or pre-provisioned OAuth access change]'
---

# Federated Auth Account Linking

Use this skill when an external identity provider authenticates a user but the app still decides which internal account that identity can use.

## Use When

- Matching Google or other OAuth identities to existing DB accounts
- Preventing duplicate account creation on first federated login
- Restricting sign-in to pre-provisioned or invited users only
- Storing a stable external subject identifier after first login

## Quick Rules

- External login success does not automatically mean app access is allowed.
- Internal account matching rules must be explicit and server-side.
- Duplicate internal users should be prevented by design.
- Prefer stable provider subject identifiers after a trusted initial link.

## Load Next

For the linking model, first-login binding procedure, and duplicate-prevention checklist, load [the playbook](./references/playbook.md).