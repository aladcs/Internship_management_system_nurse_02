---
name: consent-and-policy-acceptance-flow
description: 'Implement consent, policy, or terms-acceptance workflows in internal systems. Use for required acknowledgements before access or submission, acceptance timestamps, versioned policy text, role-specific acceptance requirements, and blocking actions until consent is recorded.'
argument-hint: '[consent or policy acceptance change]'
---

# Consent And Policy Acceptance Flow

Use this skill for flows where users must acknowledge terms, policies, PDPA notices, or program requirements before entering the app or completing protected actions.

## Use When

- Requiring acceptance before first access or before form submission
- Recording policy acknowledgement with timestamp and version
- Blocking protected routes or actions until consent exists
- Showing role-specific policy or consent requirements

## Quick Rules

- Acceptance must be recorded server-side with durable metadata.
- Protected access or submit actions should verify acceptance again on the server.
- Policy text or version should be traceable so acceptance has meaning over time.
- UI gating alone is not sufficient for compliance-sensitive flows.

## Load Next

For the acceptance model, gating procedure, and versioning checklist, load [the playbook](./references/playbook.md).