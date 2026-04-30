---
name: google-oauth-web-login
description: 'Implement Google OAuth login flows for web apps. Use for authorize redirects, callback handlers, state validation, token exchange, Google profile retrieval, secure redirect handling, and handing off authenticated users to app-specific session logic.'
argument-hint: '[Google OAuth login or callback change]'
---

# Google OAuth Web Login

Use this skill for browser-based Google sign-in flows where the app handles the OAuth redirect, callback, and identity handoff.

## Use When

- Building Google login from scratch in a web app
- Adding or modifying authorize or callback routes
- Exchanging auth codes for tokens and reading Google profile claims
- Hardening state validation and redirect behavior

## Quick Rules

- Validate `state` server-side before token exchange.
- Treat Google identity as authentication input, not final authorization.
- Keep redirect targets constrained to trusted app destinations.
- Hand off successful OAuth results to app-owned session or account-linking logic.

## Load Next

For the OAuth flow, callback procedure, and security checklist, load [the playbook](./references/playbook.md).