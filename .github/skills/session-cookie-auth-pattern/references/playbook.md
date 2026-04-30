# Session Cookie Auth Pattern Playbook

## Recommended Model

- Session record or signed session payload
- User id
- Creation and expiry timestamps
- Optional rotation metadata
- Optional device or context metadata if needed by product requirements

## Procedure

1. Create the session after successful authentication.
2. Persist or sign the session server-side.
3. Set the session cookie with appropriate flags.
   - `HttpOnly`
   - `Secure` in production
   - `SameSite` according to app needs
4. Resolve current user from the session in server code.
5. Protect routes and mutations using the same validation logic.
6. Support logout by invalidating the session and clearing the cookie.
7. Handle expiry and optional rotation.
8. Validate authenticated and unauthenticated paths.

## Route Protection Checklist

- Session lookup is centralized
- Protected routes fail safely when session is missing or invalid
- Server actions re-check session instead of trusting client state
- Logout removes effective access immediately
- Expired sessions do not appear authenticated in server-rendered pages

## Failure Modes

- Using cookies without a server-side validation source of truth
- Clearing only the cookie but leaving reusable server-side sessions active
- Protecting page UI but not server actions
- Inconsistent session lookup across routes and actions