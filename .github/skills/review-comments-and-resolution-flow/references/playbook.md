# Review Comments And Resolution Flow Playbook

## Recommended Model

- Parent entity under review
- Review comment with author, role, body, and timestamp
- Optional thread or reply linkage
- Resolution state such as `open`, `addressed`, `resolved`
- Resolver identity and resolution timestamp when applicable
- Optional category or field/document linkage for targeted feedback

## Procedure

1. Identify the review surface.
   - Form section, entire submission, document, or detail page.
2. Define who can comment.
   - Reviewer only, or reviewer plus submitter replies.
3. Persist comments as DB-backed workflow records.
4. Define thread states.
   - Example: `open`, `needs_submitter_action`, `resolved`.
5. Restrict comment and resolution actions by role.
6. Tie comment actions to workflow side effects.
   - Notifications
   - Status changes
   - Activity logs
7. Decide how resolution works.
   - Manual reviewer resolution
   - Auto-transition after resubmission or reply
8. Validate full flows.
   - Create comment
   - Reply or address
   - Resolve or reopen

## Thread-State Checklist

- Open comments are easy to query and display in admin work queues
- Resolved comments remain visible for history when needed
- Replies preserve author identity and timing
- Comments can point to the relevant field, section, or document when applicable
- Notifications do not fire only from the client

## Failure Modes

- Treating review comments as plain page text with no workflow meaning
- Hiding resolved comments entirely and losing review history
- Allowing any actor to resolve any thread without role checks
- Mixing comment state with global submission status without clear rules