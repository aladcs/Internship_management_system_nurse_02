# Reference Knowledge Pack

This folder stores durable project knowledge that is useful across future internal academic systems, especially systems with staff-managed access, role-based workflows, form submission, document review, and dashboard operations.

Use these files as the long-lived reference layer:

- `auth-architecture.md`
- `rbac-matrix.md`
- `workflow-state-machine.md`
- `data-model-map.md`
- `route-map.md`
- `document-lifecycle.md`
- `dashboard-metrics-definition.md`
- `notification-event-catalog.md`
- `feature-acceptance-checklists.md`
- `implementation-anti-patterns.md`
- `domain-glossary.md`
- `server-action-map.md`
- `revalidation-map.md`
- `file-storage-contract.md`
- `env-secrets-matrix.md`
- `seed-and-demo-data-policy.md`
- `prompt-recipes.md`
- `ui-pattern-catalog.md`
- `copy-and-message-catalog.md`
- `bug-postmortem-patterns.md`

Recommended reading order for a new project or new contributor:

1. `rbac-matrix.md`
2. `auth-architecture.md`
3. `workflow-state-machine.md`
4. `data-model-map.md`
5. `route-map.md`

Recommended reading order before implementing a feature:

1. `feature-acceptance-checklists.md`
2. `implementation-anti-patterns.md`
3. The domain-specific reference for the feature area

Recommended reading order before debugging or extending an existing feature:

1. `server-action-map.md`
2. `revalidation-map.md`
3. `bug-postmortem-patterns.md`
4. `domain-glossary.md`

These references complement, but do not replace:

- `docs/PRD.md` for business rules
- `docs/_features.md` for delivery scope
- `docs/ui/*.md` for page-level UI behavior
- `.github/skills/*` for reusable implementation workflows