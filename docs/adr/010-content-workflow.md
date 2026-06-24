# ADR-010: Content Workflow

## Status

Accepted

## Context

Onboarding flows are customer-facing content — a broken tooltip or a tour pointing to the wrong element can confuse users and damage trust. Changes to live flows should go through a controlled process, and teams should be able to revert to a known-good state if something goes wrong.

We considered three levels of workflow complexity:

- **Simple toggle** (Draft/Published) — minimal overhead but no review process, easy to publish mistakes
- **Draft → Published with version history** — adds rollback capability but no review gate
- **Draft → Review → Published with version history** — full pipeline with a review step before content goes live, plus the ability to roll back to any previous version

## Decision

Implement a **full content workflow: Draft → Review → Published**, with **version history and rollback**.

- Each flow maintains a history of versions
- Editing always creates or modifies a draft version — the published version is never directly edited
- A draft can be submitted for review, then approved (which publishes it) or rejected (with feedback)
- Publishing creates an immutable version snapshot
- Any previously published version can be rolled back to, which creates a new version rather than overwriting history

## Consequences

- Provides a safety net for teams — mistakes can be caught during review and reverted after publishing
- The review step enables RBAC enforcement: Editors can create and submit, but only Admins (or designated reviewers) can approve and publish
- Version history enables auditing: who changed what, when, and why
- Immutable version snapshots mean storage grows over time — each publish stores a full snapshot of the flow state. This is acceptable for the expected data volumes
- The workflow adds complexity to the API (submit, approve, reject, rollback endpoints) and the dashboard UI (status indicators, review queue, version comparison)
- Teams that don't want the review step can effectively skip it if a single admin authors and approves — the workflow doesn't force a separate reviewer
