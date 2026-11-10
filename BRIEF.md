# AgriMind Capstone Improvement Brief

## Intent

Help AgriMind become a strong, credible capstone through a working, testable product and a defensible demonstration—not through extra features or claims the implementation cannot support.

## Current state

- Repository contains approved farmer/admin HTML prototype and detailed source-of-truth specs.
- Development roadmap still marks Phase 0 `NOT_STARTED`; implementation is not yet present as a complete product.
- Several important decisions are partially approved or unresolved. See `docs/implementation-roadmap.md` §0.3–§0.4 and `docs/architecture.md` §10.
- `AGENTS.md` and `docs/` are ignored by `.gitignore`; current edits remain local unless owner chooses to track them.

## Goals

1. Build the documented AgriMind workflow as connected vertical slices, starting with Phase 0.
2. Preserve approved architecture, API boundaries, prototype fidelity, and AI boundaries: deterministic rule engine for advice/risk/health/confidence; Random Forest for harvest/yield only.
3. Resolve and record blockers before implementing behavior that depends on them; never invent thresholds, formats, providers, or datasets.
4. Add tests for domain rules, ownership, persistence, offline behavior, and user flows as each slice is built.
5. Make the capstone demonstrable with a repeatable end-to-end workflow, transparent limitations, and evidence from actual tests and running surfaces.

## Non-goals

- Adding runtime LLM/RAG, computer vision, IoT, marketplace, or other out-of-scope features.
- Replacing the approved stack or redesigning the prototype.
- Claiming production readiness, model accuracy, or offline completeness without verification.
- Building every module before a verified core workflow exists.

## Proposed order

1. **Foundation:** establish mobile, admin, backend, database migrations, local development instructions, and CI; make Phase 0 acceptance checks pass.
2. **Core workflow:** implement authentication, farm, crop, weather cache, KB rule engine, and recommendations in dependency order. Unresolved AI decisions gate only the affected behavior; use documented fallback/null behavior where defined.
3. **Reliability:** add records, alerts, localization, and offline sync after their required decisions are complete; verify error and conflict paths.
4. **Admin and delivery:** implement KB administration, user management, announcements, dashboard, and audit; integrate, test, and prepare Docker deployment and demonstration.
5. **Capstone evidence:** maintain a reproducible demo script, test results, architecture/data-flow diagrams aligned with implementation, known-limitations list, and concise defense talking points. Treat derived deliverables as artifacts; source-of-truth docs require approval before edits.

## Decision gates

Before affected implementation, ratify remaining items: risk-score wind/temperature formula; exact localized Weather Risk templates; health-status inputs/thresholds; harvest-model dataset/features/training/evaluation; email provider; API status mapping, pagination envelope, idempotency policy; logging retention; thunderstorm provider-code mapping and alert severity mapping. Approved partial decisions remain recorded in the roadmap and architecture docs.

## Success criteria

- A fresh development setup can start each app and apply migrations using documented steps.
- A farmer can complete a verified core workflow across client, API, and database; user-visible results match the approved prototype and specs.
- Deterministic rules produce repeatable, tested recommendations; model outputs remain separate and honest about unavailable predictions.
- Relevant negative, offline, and failure paths are tested; known gaps are explicit in the demo.
- Capstone claims are traceable to code, automated checks, or a reproducible live demonstration.

## Approval boundary

This brief proposes priorities and acceptance goals only. It does not approve new product scope or amend source-of-truth specifications. Owner approval required before implementation plan or code changes begin.
