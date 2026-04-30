# Route Map

## Public Entry Points

- `/login`
  - Purpose: credential-based login page
  - Access: public

- `/intern/auth/cmu`
- `/intern/auth/cmu/callback`
- `/intern/auth/google`
- `/intern/auth/google/callback`
- `/intern/api/auth/callback`
  - Purpose: OAuth/federated auth entry and callback paths
  - Access: public within `/intern/*`

## Shared Authenticated Utilities

- `/intern/account/name`
  - Purpose: update display name
  - Access: `super_admin`, `admin`

- `/intern/account/password`
  - Purpose: update own password
  - Access: all authenticated roles that the route helper allows

## Super Admin Routes

- `/intern/admins`
  - Purpose: manage admin accounts
  - Access: `super_admin`
  - Main responsibilities: list admins, create admin, edit/delete admin, reset admin password

## Admin Routes

- `/intern/dashboard`
  - Purpose: operational summary dashboard
  - Access: `admin`

- `/intern/admin/students`
  - Purpose: student list and entry point to student management
  - Access: `admin`

- `/intern/admin/students/[id]`
  - Purpose: student detail and review surface
  - Access: `admin`

- `/intern/admin/students/[id]/edit`
  - Purpose: staff edit surface for a specific student
  - Access: `admin`

- `/intern/notifications`
  - Purpose: full admin notifications page
  - Access: `admin`

- `/intern/activity-logs`
  - Purpose: admin activity log timeline
  - Access: `admin`

## Student Routes

- `/intern/tos`
  - Purpose: TOS acceptance gate
  - Access: `student`
  - Special rule: student without accepted TOS is redirected here before other student surfaces

- `/intern/overview`
  - Purpose: student summary home page
  - Access: `student`

- `/intern/form`
  - Purpose: student editable form and upload surface
  - Access: `student`
  - Special rule: editability depends on workflow state

## Redirect Rules

Default authenticated landing pages:

- `super_admin` -> `/intern/admins`
- `admin` -> `/intern/dashboard`
- `student` -> `/intern/overview`

Special redirect behavior:

- invalid or missing session on `/intern/*` -> `/login`
- authenticated user on unauthorized role-protected route -> redirected to role home
- student without TOS acceptance -> `/intern/tos`

## Reuse Guidance

For future projects, preserve these route families:

- public login/auth routes
- role-scoped operational surfaces
- account self-service routes
- special onboarding or policy gate route