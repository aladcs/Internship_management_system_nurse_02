# Activity Log Timeline Pattern Playbook

## Recommended Event Schema

- Actor id and actor role or display label
- Action type or verb
- Target entity type and target entity id
- Human-readable summary for timeline rendering
- Timestamp for ordering and filtering
- Optional metadata for navigation or change details

## Procedure

1. Identify which mutations deserve logging.
   - Status changes
   - Review actions
   - File uploads or replacements
   - Account or profile updates
2. Write the activity event close to the successful server-side mutation.
3. Store enough target metadata for navigation.
   - `entityType`, `entityId`, or a direct target path
4. Normalize action naming.
   - Similar actions should use consistent event types for filtering.
5. Build timeline queries for the intended surface.
   - Global admin timeline
   - Per-record history
   - Recent-activity card
6. Revalidate pages that show recent activity.
7. Validate traceability.
   - Actor shown correctly
   - Ordering is correct
   - Links navigate to the right record

## Timeline Checklist

- Important workflow actions are logged once and only once
- Timeline rows are readable without opening raw JSON metadata
- Filters can distinguish action categories or actors when needed
- Entity links resolve reliably from stored metadata
- History remains useful even after the primary record evolves

## Failure Modes

- Logging only in the client and missing server-initiated changes
- Inconsistent action labels that break filtering or analytics
- Events without enough target metadata to navigate back to the affected record
- Logging too little to be useful or too much low-signal noise to review efficiently