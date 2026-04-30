# Consent And Policy Acceptance Flow Playbook

## Recommended Model

- Policy or consent artifact identifier
- Optional policy version or revision marker
- User acceptance record
- Acceptance timestamp
- Optional actor role or context when requirements differ by role
- Optional source context such as route or action that required acceptance

## Procedure

1. Identify the gating point.
   - First login, protected route, form submission, or privileged action.
2. Define what counts as acceptance.
   - Checkbox plus submit, explicit accept action, or versioned acknowledgement.
3. Persist acceptance server-side.
   - Store user, timestamp, and policy version where applicable.
4. Enforce gating in the right place.
   - Route protection, server action, or both depending on risk.
5. Handle updates to policy text or version.
   - Decide whether prior acceptances remain valid.
6. Build the acceptance UI.
   - Clear copy
   - Explicit action
   - No ambiguous passive acceptance when explicit acknowledgement is required
7. Revalidate affected routes after acceptance.
8. Validate both blocked and unblocked paths.

## Versioning Checklist

- Acceptance record includes enough metadata to know what was accepted
- Protected actions fail safely when acceptance is missing
- Route gating and mutation gating stay consistent
- Role-specific requirements are encoded where needed
- Re-acceptance behavior is clear when policy text changes materially

## Failure Modes

- Recording acceptance only in client state
- Checking acceptance in UI but not in protected server mutations
- Losing meaning by storing only a boolean with no timestamp or version context
- Letting stale acceptance records bypass new policy requirements unintentionally