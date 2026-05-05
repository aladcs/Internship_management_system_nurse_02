# Security Review Report

Date reviewed: 2026-05-05

Scope reviewed:
- `src/app/**`
- `src/lib/**`
- `src/proxy.ts`
- `prisma/schema.prisma`
- `package.json` and `package-lock.json`
- `npm audit --omit=dev --json`
- `npm ls postcss @hono/node-server @prisma/dev prisma next`
- `npm view next version`
- `npm view prisma version`
- `npm view @hono/node-server version`

Method:
- Manual source inspection of auth, session, proxy, login, upload, and file-serving control points
- Pattern scan of remaining server actions and route handlers for session and role checks
- Dependency audit triage with local dependency-path verification and registry version checks

Coverage summary:
- total files reviewed in scope: 94 application-owned files
- application-owned files: 94
- test files: 0
- generated files: 24
- vendored files: 41528

Coverage notes:
- Manually reviewed: `src/proxy.ts`, `src/lib/auth/*`, `src/app/login/actions.ts`, `src/app/form/actions.ts`, `src/app/api/student-files/[studentId]/[fileName]/route.ts`, `src/app/api/student-profile-images/[studentId]/[fileName]/route.ts`, `src/app/uploads/student-profile-images/[studentId]/[fileName]/route.ts`, and representative privileged server actions under `src/app/admins/**`, `src/app/admin/students/**`, `src/app/dashboard/**`, `src/app/tos/**`, and `src/app/account/**`
- Pattern-scanned only: remaining app-owned files outside auth, mutation, and asset-delivery boundaries
- Vendored files were not manually reviewed

## Executive Summary

The highest-risk source issue was a legacy profile-image route that allowed any authenticated user with a guessed path to read older student images without object-level authorization. The project also lacked brute-force throttling on password login, trusted client-declared MIME types during upload validation, and served authenticated assets with weaker cache and MIME hardening than appropriate for private student data. Those source issues were remediated in this pass.

Dependency audit results still show two moderate advisory chains with no clear local upgrade path today: Next.js `16.2.4` bundles `postcss@8.4.31`, which is below the advisory-fixed `8.5.10`, and the current latest `prisma@7.8.0` still pulls `@prisma/dev@0.24.3` and `@hono/node-server@1.19.11`. Those remain `waiting-provider` pending upstream releases or guidance.

## Findings Table

| # | Category | Finding | Severity | Status | Notes |
|---|---|---|---|---|---|
| 1 | Source code | Legacy profile-image route missed object-level authorization | High | fix-now | Remediated by routing legacy path through the protected API handler |
| 2 | Source code | Password login lacked brute-force throttling | Moderate | fix-now | Remediated with in-process IP and identity rate limiting |
| 3 | Source code | Upload validation trusted client MIME type without file-signature checks | Moderate | fix-now | Remediated with PDF/JPEG/PNG signature verification before persistence |
| 4 | Source code | Authenticated asset responses allowed weaker caching and MIME handling | Moderate | fix-now | Remediated with `private, no-store`, `Vary: Cookie`, and `nosniff` |
| 5 | Dependency | `next@16.2.4` bundles vulnerable `postcss@8.4.31` | Moderate | waiting-provider | Installed Next version is current on npm at review time |
| 6 | Dependency | `prisma@7.8.0` depends on `@prisma/dev -> @hono/node-server@1.19.11` | Moderate | waiting-provider | Installed Prisma version is current on npm at review time |

Status legend:
- `fix-now`: team can remediate or mitigate directly
- `waiting-provider`: stable fix depends on upstream or provider release timing

## Source Findings

### 1. High: Legacy profile-image route missed object-level authorization

Evidence:
- `src/app/uploads/student-profile-images/[studentId]/[fileName]/route.ts` previously served files directly from `public/uploads/...` after only path-segment validation
- The route did not check whether the requester was the owning student or an admin
- `src/proxy.ts` only guaranteed that the caller was authenticated for this path, not that they were authorized for the specific student object

Impact:
- Any logged-in user who knew or guessed a legacy image URL could read another student's older profile image
- This violated the project RBAC rule that students can access only their own data and that super admins must not access student data

Remediation:
1. Route the legacy endpoint through `src/app/api/student-profile-images/[studentId]/[fileName]/route.ts`
2. Reuse the existing student/admin ownership checks for both current and legacy profile-image paths

### 2. Moderate: Password login lacked brute-force throttling

Evidence:
- `src/app/login/actions.ts` previously performed unlimited credential checks per requester
- No IP-based or identity-based login throttling existed in `src/proxy.ts` or the login server action

Impact:
- Repeated password guessing against pre-created accounts was unconstrained
- The application could also be used for low-cost credential-stuffing attempts

Remediation:
1. Add a small in-process rate limiter in `src/lib/security/rate-limit.ts`
2. Enforce both per-IP and per-identity windows in `src/app/login/actions.ts`
3. Reset the counters on successful authentication

### 3. Moderate: Upload validation trusted client MIME type without file-signature checks

Evidence:
- `src/app/form/actions.ts` previously accepted files based on `File.type` and size limits only
- Stored content could therefore be non-PDF or non-image data with spoofed client metadata

Impact:
- Attackers could persist unexpected content types in private storage
- Later consumers of those files would have to rely entirely on path extension or client metadata

Remediation:
1. Inspect the first bytes of uploaded files before writing to disk
2. Accept only files whose signatures match the allowed PDF, JPEG, or PNG types

### 4. Moderate: Authenticated asset responses allowed weaker caching and MIME handling

Evidence:
- `src/app/api/student-profile-images/[studentId]/[fileName]/route.ts` previously returned `Cache-Control: public, max-age=0, must-revalidate`
- The authenticated asset routes did not set `Vary: Cookie` or `X-Content-Type-Options: nosniff`

Impact:
- Shared caches should not treat protected student assets as public
- Missing `nosniff` weakens the browser-side boundary when content metadata is inconsistent

Remediation:
1. Return `Cache-Control: private, no-store` for protected asset routes
2. Add `Vary: Cookie` and `X-Content-Type-Options: nosniff`
3. Add baseline response security headers in `src/proxy.ts`

## Dependency Findings

### 1. Moderate: `next@16.2.4 -> postcss@8.4.31`

Dependency path:
- `next@16.2.4 -> postcss@8.4.31`

Details:
- Advisory: `GHSA-qx2v-qp2m-jg93`
- `npm audit --omit=dev --json` flags `postcss <8.5.10`
- Local verification shows Next currently bundles `postcss@8.4.31`
- `npm view next version` returned `16.2.4` at review time, so there is no newer stable Next release to consume immediately from this environment

Recommended action:
1. Track the Next.js release that upgrades bundled PostCSS beyond `8.5.10`
2. Re-run `npm audit --omit=dev --json` after the next Next.js update

### 2. Moderate: `prisma@7.8.0 -> @prisma/dev@0.24.3 -> @hono/node-server@1.19.11`

Dependency path:
- `prisma@7.8.0 -> @prisma/dev@0.24.3 -> @hono/node-server@1.19.11`

Details:
- Advisory: `GHSA-92pp-h63x-v22m`
- `npm audit --omit=dev --json` flags `@hono/node-server <1.19.13`
- Local verification shows the installed latest Prisma line still resolves to the vulnerable transitive version
- `npm view @hono/node-server version` returned `2.0.1`, but that version is not reachable through the current latest Prisma package in this repository

Recommended action:
1. Track Prisma releases for an updated `@prisma/dev` transitive dependency
2. Treat this primarily as a tooling/dev-path issue until Prisma ships a fixed chain, then re-run the audit

## Prioritized Fix Order

1. Keep the legacy profile-image route protected through the API ownership checks
2. Keep login, upload, and account-creation throttling in place and monitor whether a distributed store is needed for multi-instance deployments
3. Keep session-version invalidation and PKCE enabled across auth flows
4. Keep file-signature validation for all student uploads
5. Upgrade Next.js once a stable release bundles fixed PostCSS
6. Upgrade Prisma once its dependency chain no longer pulls the vulnerable `@hono/node-server`

## Notes and Limits

- This review covered source inspection and dependency triage only
- No penetration testing, exploit development, or browser automation fuzzing was performed
- The current login, upload, and account-creation rate limiters are process-local; they materially improve protection now but are not a substitute for a shared limiter in horizontally scaled production deployments
