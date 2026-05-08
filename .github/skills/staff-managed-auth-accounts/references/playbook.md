# Staff-Managed Auth Accounts Playbook

## Access Model

- Users log in only if their email already exists in the database.
- There is no public registration flow.
- Higher-privilege roles create, edit, delete, and reset only the account types allowed by the product.
- Self-service roles cannot create accounts and cannot manage other users.

## Password Handling

- Generate a temporary password on account creation or reset.
- Hash and persist it server-side.
- Reveal the plain temporary password exactly once in the privileged management flow.
- Do not introduce a public forgot-password flow unless product requirements say so.

## Procedure

1. Identify the actor and target account type.
2. Confirm the allowed operation.
   - Create, update, delete, reset password, or login.
3. Enforce authority in server code.
   - Reject mismatched actor/target combinations.
4. Apply DB-backed login checks.
   - Validate email exists.
   - Validate password against stored credentials.
5. Apply role-based redirects after successful login.
6. For account create/reset, return the temporary password only to the authorized initiating flow.
7. Validate both allowed and denied actor/target pairs.

## Failure Modes

- Reset password without verifying target role
- Exposing temporary passwords outside the privileged flow
- Allowing account creation from a public page
- Changing login UI without preserving DB existence checks
