# RBAC Matrix

## Roles

- `super_admin`
- `admin`
- `student`

## Role Intent

- `super_admin`: manage admin accounts only
- `admin`: operate the student workflow and student-related review surfaces
- `student`: manage only owned profile, form, and related files within status limits

## Access Matrix

| Action / Resource | super_admin | admin | student |
| --- | --- | --- | --- |
| Login | Yes | Yes | Yes |
| Use email/password if account exists | Yes | Yes | Yes |
| Use OAuth if local account exists | Yes | Yes | Yes |
| Create admin | Yes | No | No |
| Edit admin | Yes | No | No |
| Delete admin | Yes | No | No |
| Reset admin password | Yes | No | No |
| View admin list | Yes | No | No |
| View admin dashboard | No | Yes | No |
| View student list | No | Yes | No |
| View student detail | No | Yes | No |
| Edit student data as staff | No | Yes | No |
| Change student workflow status | No | Yes | No |
| View notifications | No | Yes | No |
| View activity logs | No | Yes | No |
| Create student | No | Yes | No |
| Reset student password | No | Yes | No |
| View own overview | No | No | Yes |
| View own form | No | No | Yes |
| Edit own form | No | No | Yes, status-limited |
| Upload own files | No | No | Yes, status-limited |
| Remove own files | No | No | Yes, status-limited |
| Accept TOS | No | No | Yes |
| View own account password page | No | No | Yes |
| View account name page | Yes | Yes | No |
| View account password page | Yes | Yes | Yes |

## Route Families

### Super Admin

- `/intern/admins`
- `/intern/account/name`
- `/intern/account/password`

### Admin

- `/intern/dashboard`
- `/intern/admin/students`
- `/intern/admin/students/[id]`
- `/intern/admin/students/[id]/edit`
- `/intern/notifications`
- `/intern/activity-logs`
- `/intern/account/name`
- `/intern/account/password`

### Student

- `/intern/tos`
- `/intern/overview`
- `/intern/form`
- `/intern/account/password`

## Enforcement Layers

RBAC must be enforced in multiple layers:

1. Route protection in `src/proxy.ts`
2. Safe redirect rules in auth helpers
3. Server-side query filtering and mutation checks
4. UI visibility only as a final convenience layer

## Reusable Rules For Future Systems

- If a role owns a resource, server actions must verify ownership explicitly.
- If a role manages another role's records, the manager role must still be restricted by domain scope.
- Password reset authority should follow the same hierarchy as account creation authority.
- Dashboard visibility should follow the same scope as list/detail access.