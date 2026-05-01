# Document Submission And Verification Playbook

## Recommended Model

- Submission owner record
- Document record per uploaded item or requirement slot
- Verification status per document or grouped submission
- Reviewer identity and timestamp for decisions
- Optional rejection or fix-request reason
- Storage metadata sufficient for download, replacement, and audit

## Procedure

1. Identify the submission unit.
   - Per student, per request, per practicum, or per academic term.
2. Define document requirements.
   - Required vs optional
   - Allowed file types and count
   - Replacement/resubmission policy
3. Persist documents as DB-backed records.
   - Keep metadata separate from file bytes or storage path.
4. Define verification statuses.
   - Example: `missing`, `submitted`, `verified`, `rejected`, `needs_resubmission`.
5. Restrict reviewer actions.
   - Verification, rejection, or fix-request must be role-gated server-side.
6. Handle resubmission explicitly.
   - Decide whether replacement archives prior versions or overwrites active references.
7. Revalidate affected surfaces.
   - Submitter overview
   - Detail/review page
   - Dashboard counts or pending queues
8. Validate end to end.
   - Upload
   - Replace or resubmit
   - Verify or reject
   - Read-only or locked states when applicable

## Reviewer Checklist

- Document can be downloaded reliably
- Verification state is visible in list and detail views
- Reason for rejection or fix request is stored when required
- Reviewer identity and action time are captured when business rules need auditability
- Completeness logic does not rely on client-only checks

## Failure Modes

- Treating uploaded files as unstructured blobs with no verification model
- Mixing submission status with per-document verification without clear ownership
- Allowing resubmission when the workflow is locked
- Replacing files without preserving enough metadata for traceability