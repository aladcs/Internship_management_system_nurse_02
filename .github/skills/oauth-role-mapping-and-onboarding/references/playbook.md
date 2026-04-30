# OAuth Role Mapping And Onboarding Playbook

## Procedure

1. Complete external authentication.
2. Resolve the internal account.
   - Use linked provider identity or approved matching rules.
3. Read role and access state from the app database.
4. Check onboarding gates.
   - Consent or policy acceptance
   - Required profile fields
   - Invitation acceptance or activation state
5. Decide the destination.
   - Role-specific home route
   - Onboarding route when gates are incomplete
6. Create or continue the app session.
7. Validate all role and onboarding branches.

## Redirect Checklist

- Authenticated but unauthorized users are rejected cleanly
- Authenticated and authorized users reach the correct role home
- Users missing onboarding requirements are routed to the correct gate page
- Server-rendered pages and actions agree on the effective role
- Redirect logic does not rely only on client-side navigation

## Failure Modes

- Assigning roles from provider profile fields that the app does not control
- Letting OAuth success bypass required internal onboarding
- Redirecting before the role or onboarding state is actually resolved
- Treating email-domain allowlists as the full authorization model in a role-based internal app