# Federated Auth Account Linking Playbook

## Recommended Model

- Internal user account
- Provider name
- Provider subject identifier
- Provider email or profile metadata used during linking
- Link timestamp and optional last-login timestamp

## Procedure

1. Authenticate with the provider.
2. Decide account matching rules.
   - Exact email match
   - Pre-provisioned invite
   - Existing linked provider subject
3. Reject unauthorized first logins.
   - If product rules require pre-provisioned access, do not create a new internal user implicitly.
4. On trusted first link, persist provider identity on the internal account.
5. On later logins, prefer the stored provider subject over mutable fields like email.
6. Create the app session only after linking rules pass.
7. Validate duplicate-prevention behavior.

## Duplicate-Prevention Checklist

- One external identity maps to one internal user
- Email matching rules are explicit and role-safe
- Unlinked but pre-existing users are handled intentionally
- First-login linking does not create shadow duplicate accounts
- Provider subject becomes the stable key after linking when available

## Failure Modes

- Auto-creating internal accounts on any successful OAuth login in a restricted system
- Using email as the only long-term key when the provider subject is available
- Allowing multiple internal users to link to the same external identity
- Creating sessions before the account-linking decision is finalized