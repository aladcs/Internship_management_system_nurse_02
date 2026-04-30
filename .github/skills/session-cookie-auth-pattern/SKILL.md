---
name: session-cookie-auth-pattern
description: 'Implement app-managed session cookie authentication for web apps. Use for creating authenticated sessions after login, secure cookie settings, current-user lookup, logout, expiration, protected routes, and server-side session validation for OAuth or password-based login.'
argument-hint: '[session cookie auth change]'
---

# Session Cookie Auth Pattern

Use this skill for apps that create and validate their own authenticated session cookies after a successful login event.

## Use When

- Creating sessions after OAuth or password login
- Building logout, current-user lookup, or session expiry behavior
- Protecting routes or server actions with app-owned session validation
- Hardening cookie flags and session rotation behavior

## Quick Rules

- Session validation must happen server-side.
- Cookie settings should reflect security needs such as `HttpOnly`, `Secure`, and `SameSite`.
- Logout must invalidate server-side session state, not only clear client UI.
- Route protection and mutation protection should both rely on the same session source of truth.

## Load Next

For the session model, cookie settings, and route-protection checklist, load [the playbook](./references/playbook.md).