# Auth Architecture

## Purpose

This system uses application-managed authentication with two entry paths:

- Email/password login
- Federated login callbacks under `/intern/auth/*`

Authentication is distinct from authorization.

- Authentication proves identity.
- Authorization decides what the identity can access inside the app.

## Core Principles

- No public registration.
- Access is allowed only for accounts that already exist in the database.
- Role comes from the application database, not from external identity claims.
- Sessions are created by the application after successful credential or OAuth-based sign-in.
- Route protection is enforced through `src/proxy.ts`.
- Student access is additionally gated by TOS acceptance.

## Login Paths

### Email/Password

1. User submits email and password at `/login`.
2. Server normalizes email and password.
3. App looks up the user by email.
4. Password hash is verified.
5. Session is created.
6. User is redirected using role-aware safe redirect rules.

### OAuth / Federated Login

1. User authenticates with an external provider.
2. Provider callback returns a trusted email identity.
3. App checks whether the email exists in the local database.
4. If no local account exists, access is denied.
5. Session is created only after local authorization passes.
6. Redirect is resolved through the same safe post-login rules used by password login.

## Session Model

- Session cookie is the primary authentication artifact during requests.
- Session creation happens after successful login or OAuth sign-in.
- `src/proxy.ts` validates the session token on protected `/intern/*` paths.
- Missing or invalid sessions redirect to `/login`.

## Authorization Model

Authorization is role-based.

- `super_admin` manages admin accounts only.
- `admin` manages student workflows and operational pages.
- `student` can access only student-facing routes and owned data.

Role-based home routes:

- `super_admin` -> `/intern/admins`
- `admin` -> `/intern/dashboard`
- `student` -> `/intern/overview`

## Safe Redirect Rules

Post-login redirects are constrained.

- Redirect targets must begin with `/`.
- Redirect targets must not begin with `//`.
- Redirect targets must fall under allowed prefixes for the current role.
- Students who have not accepted TOS are always redirected to `/intern/tos` first.

## Student TOS Gate

Student access has a second gate beyond authentication:

- If the student has not accepted TOS, protected student routes redirect to `/intern/tos`.
- If the student already accepted TOS and tries to visit `/intern/tos`, they are redirected to the student home route.

## Public Intern Paths

Some `/intern/*` routes are intentionally public because they are needed before a session is established.

Examples:

- OAuth entry and callback routes
- File-serving API routes used by the app

These public paths must stay intentionally small and explicit.

## Future Reuse Guidance

Reuse this architecture when a project needs:

- Staff-managed account provisioning
- No self-registration
- Role-based redirect after login
- OAuth that authenticates against an external provider but authorizes against the app database
- Session-cookie authentication with protected internal routes

## Design Rules To Preserve

- Never derive app roles directly from provider profile claims.
- Never create local accounts implicitly on any successful external login unless the product explicitly allows it.
- Never rely on UI-only route gating.
- Keep route protection, action protection, and redirect logic consistent.