# Admin Notification Pattern Playbook

## Source-of-Truth Rules

- Database notifications are the source of truth.
- External delivery is best-effort and must never block the primary mutation.
- Notification payloads must include enough metadata for stable rendering and navigation.

## Recommended Event Shape

- Event type or category
- Human-readable title or message
- `targetPath` for direct navigation when possible
- `entityType` and `entityId` for fallback resolution
- Timestamp suitable for sorting and client filtering
- Per-recipient receipt/read state when multiple staff users consume the same event

## Procedure

1. Start from the business event.
2. Create the DB notification inside the server-side mutation.
3. Store routing metadata.
   - Prefer `targetPath`.
   - Add `entityType` and `entityId` when needed.
4. Fan out to recipients.
   - Create receipt/read rows if the system tracks per-recipient state.
5. Trigger optional external delivery behind env/config checks.
6. Revalidate affected UI surfaces.
   - Dashboard widgets
   - Notification feed/page
   - Related list/detail pages
7. Validate end to end.
   - Event row exists
   - Feed renders correctly
   - Click-through resolves correctly
   - Mark-as-read updates state and stale pages are refreshed

## Failure Modes

- Notification exists but cannot navigate usefully
- External provider errors break the original action
- Read state updates without revalidating dependent pages
- Metadata shape differs across event types and makes the UI brittle
