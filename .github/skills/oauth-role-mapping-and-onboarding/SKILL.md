---
name: oauth-role-mapping-and-onboarding
description: 'Implement role mapping and post-login onboarding for OAuth-authenticated users in internal systems. Use for mapping roles from the database after federated login, enforcing allowlists or domain rules, gating first access behind consent or profile completion, and redirecting users to role-specific destinations.'
argument-hint: '[OAuth role mapping or onboarding change]'
---

# OAuth Role Mapping And Onboarding

Use this skill when OAuth login succeeds but the app still needs to decide the internal role, onboarding requirements, and post-login destination.

## Use When

- Mapping OAuth-authenticated users to internal roles from the database
- Blocking access when the authenticated user is not pre-authorized
- Requiring consent, policy acceptance, or profile completion after login
- Redirecting users to different destinations by role or onboarding state

## Quick Rules

- Role assignment should come from app data, not only provider profile claims.
- Onboarding gates should be enforced server-side before granting normal app access.
- Redirects should reflect both role and onboarding completeness.
- Domain or email allowlists are not a substitute for internal authorization when the app uses managed roles.

## Load Next

For the role-mapping sequence, onboarding gates, and redirect checklist, load [the playbook](./references/playbook.md).