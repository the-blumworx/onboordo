# ADR-001: Multi-Tenancy Strategy

## Status

Accepted

## Context

Onboordo supports multiple workspaces (organizations/teams) within a single deployment.

The key architectural question is whether to design the data model with workspace isolation from the start or keep it flat and retrofit later. Retrofitting multi-tenancy (adding a `workspaceId` foreign key to every tenant-scoped table, updating every query, guard, and API response) is widely regarded as one of the most painful refactors in SaaS development.

We considered:

- **Flat schema now, add multi-tenancy later** — simpler to start but creates a large, risky refactor down the line
- **Workspace-scoped schema from day one** — marginally more effort per table but avoids future refactoring

Self-hosters also benefit from workspace scoping: a company running multiple products can manage separate onboarding flows per product without deploying multiple instances (similar to how GitLab has groups, Plausible has sites, and Umami has websites).

## Decision

Design the database schema with workspace scoping from day one. All tenant-scoped entities reference a workspace.

## Consequences

- Every tenant-scoped data access must be filtered by workspace
- Self-hosters with multiple products can use workspace separation without multiple deployments
- Slightly more complexity in the data layer from the start, but this is a one-time cost versus an expensive future refactor
