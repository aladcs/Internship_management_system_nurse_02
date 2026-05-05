# Security Review Checklist

Date reviewed: 2026-05-05

Reference:
- `docs/security/references/review-checklist.md`

Scope:
- `src/app/**`
- `src/lib/**`
- `src/proxy.ts`
- `prisma/schema.prisma`
- `package.json`
- `package-lock.json`

## Auth and Session

- `pass`: Session cookies are signed and verified in `src/lib/auth/session-token.ts`
- `pass`: Server-side code does not trust client-supplied role, id, or email claims for authorization decisions
- `pass`: Session tokens now carry a version claim and can be invalidated explicitly through `AUTH_SESSION_VERSION`

## Authorization

- `pass`: Privileged handlers verify role on the server in admin and super-admin server actions
- `pass`: The app does not rely only on `proxy.ts`; server actions and route handlers also check session and role
- `pass`: Object-level ownership is enforced for protected student asset reads

## OAuth and Login Flows

- `pass`: Google and CMU OAuth authorize/callback flows validate `state`
- `pass`: Google and CMU OAuth flows now use PKCE with `S256`
- `pass`: Login and callback errors are mapped to controlled codes without exposing raw provider responses

## Uploads and Storage

- `pass`: MIME type, file size, and ownership checks are enforced server-side
- `pass`: Storage path resolution is constrained to allowed `/uploads` and `/storage` prefixes
- `pass`: Delete and replace behavior resolves DB-backed paths through controlled helper logic

## Public and Internal Endpoints

- `pass`: Admin and student routes require the correct authenticated role
- `pass`: Reviewed routes return generic `Not found` responses rather than internal error details
- `pass`: Deployable asset routes were reviewed even where legacy paths existed

## Logging and Secrets

- `pass`: No sensitive token or secret logging was found in the reviewed auth and route code
- `pass`: No obvious production debug logging was found in the reviewed scope
- `pass`: No secret-derived values are intentionally printed in the reviewed scope

## Abuse Controls

- `pass`: Login is now rate-limited in `src/app/login/actions.ts`
- `pass`: Upload and account-creation flows now have in-process throttling
- `partial`: Repeated privileged mutations are not separately throttled

## Injection and Rendering

- `pass`: Reviewed code does not pass untrusted input into raw SQL, shell execution, or dynamic evaluation
- `pass`: No unsafe user-controlled HTML rendering was found in the reviewed security-critical paths
- `pass`: Post-login redirects are constrained through normalization helpers

## Dependency Triage

- `pass`: Each advisory was traced to a real dependency path with `npm ls`
- `partial`: No stable upgrade path is currently available for the flagged Next/PostCSS and Prisma/Hono chains
- `pass`: Remaining dependency items are classified as `waiting-provider` in `security-review.md`

## Coverage Honesty

- `pass`: Application-owned, generated, and vendored files are separated in `security-review.md`
- `pass`: The report states that the scan was inventory-backed and focused on high-risk control points
- `pass`: The report states explicit limitations and avoids claiming exploit validation

## Follow-up

- Consider shared/distributed throttling for login in multi-instance production
- Consider shared/distributed throttling for upload and account-creation paths in multi-instance production
