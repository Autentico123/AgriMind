# AgriMind — Cross-Application Tests

Tests that span more than one application. Per-app tests live with their app:

| Scope | Location |
|---|---|
| Backend unit, contract, golden tests | `backend/tests/` |
| Admin component and page tests | `admin/` |
| Mobile component, hook, and data-access tests | `mobile/` |
| Cross-app and end-to-end flows | **this directory** |

## Planned contents

- `prototype/` — smoke checks against the approved prototype (knowledge-base modal, "Why?" panel)
- `e2e/` — full farmer workflow: register → farm → weather → crop → recommendation → record

## Rules

- Test behavior and domain invariants, not implementation details.
- Never claim a test passed without running it.
- Keep this directory free of application code.
