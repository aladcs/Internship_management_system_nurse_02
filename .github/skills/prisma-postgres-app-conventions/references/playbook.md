# Prisma Postgres App Conventions Playbook

## Procedure

1. Start from the feature requirement.
   - Decide whether the change is schema, query, mutation, or all three.
2. Edit the Prisma schema minimally.
3. Create a descriptive migration name.
4. Regenerate Prisma artifacts.
   - If generated types drift, regenerate before rewriting imports.
5. Update the server-side query or mutation.
   - Keep data selection narrow.
   - Keep authorization checks out of the client.
6. Review UUID and DB-default assumptions.
   - Raw SQL paths may need explicit IDs in local PostgreSQL setups.
7. Validate the DB-backed page or action that depends on the change.

## Environment Notes

- Prisma CLI commonly reads `DATABASE_URL` from `.env`.
- App-only secrets can stay in `.env.local` when runtime and CLI loading rules differ.
- If TypeScript reports missing generated Prisma symbols, run Prisma generation first.

## Query Checklist

- Query only what the page or action needs
- Filter by role and ownership in server code
- Avoid broad relation graphs for simple lists
- Use transactions when multiple writes must stay consistent
- Revalidate pages that depend on changed records

## Failure Modes

- Editing app code to match stale generated types
- Assuming Prisma defaults always exist as DB defaults
- Over-fetching large relation trees
- Bundling unrelated schema cleanup into a feature migration