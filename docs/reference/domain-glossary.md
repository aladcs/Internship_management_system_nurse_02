# Domain Glossary

## Roles

### Super Admin

Top-level operator who manages admin accounts only.

### Admin

Operational reviewer and manager for student workflows.

### Student

Primary submitter who views and edits only owned records.

## Core Records

### User

Authentication account with role and login identity.

### Student Profile

Primary business record for the student in the system.

### Internship Record

Internship-specific details linked to a student profile.

### Uploaded File

One owned file attached to a student workflow.

## Workflow Terms

### Draft

Started but not yet formally submitted.

### Pending

Submitted and waiting for staff review.

### Needs Fix

Reviewer requested corrections before the workflow can continue.

### In Progress

Actively ongoing state where the record remains operationally relevant.

### Completed

Final locked state for the student-facing workflow.

## Review Terms

### Review Comment

Reviewer-authored feedback attached to a student record.

### Notification Event

Canonical event record used to alert admins and drive notification UI.

### Notification Receipt

Per-admin read state for one notification event.

### Activity Log

Audit-friendly event showing who changed what and when.

## Auth Terms

### Pre-Provisioned Account

Account created in the application database before the user signs in.

### Federated Login

Authentication handled by an external identity provider such as Google or CMU Entra.

### Safe Post-Login Redirect

Server-side redirect that permits only trusted internal destinations allowed for the authenticated role.

### TOS Gate

Student-only acceptance checkpoint required before regular student routes become accessible.

## Future Reuse Terms For Nursing Systems

### Practicum

Structured placement or supervised practical learning period.

### Rotation

Scheduled movement through different sites, wards, or learning units.

### Placement

Assignment of a student to a site, ward, preceptor, or program location.

### Verification

Reviewer confirmation that a submitted document or record meets requirements.

### Resubmission

New submitter action after a reviewer has requested fixes or replacement materials.