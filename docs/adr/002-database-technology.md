# ADR-002: Database Technology

## Status

Accepted

## Context

Onboordo needs a relational database for structured data (workspaces, users, flows, steps, versioned content, analytics events). The data model involves complex relations, transactional integrity (e.g., publishing a flow version atomically), and append-only event tables for analytics.

As a self-hosted product, the database choice should be widely supported, easy to operate, and well-understood by the target audience (development teams).

We considered PostgreSQL, MySQL, SQLite, and MongoDB.

## Decision

Use **PostgreSQL** as the primary database, accessed via **Prisma ORM**.

- PostgreSQL is the most capable open-source relational database, with strong JSON support (useful for flexible config storage), excellent indexing, and broad hosting availability
- Prisma provides type-safe database access, declarative schema management, and migration tooling that integrates well with the NestJS backend and the Nx monorepo

## Consequences

- Self-hosters need to provision a PostgreSQL instance (trivial with Docker)
- Prisma generates a type-safe client, reducing runtime errors and improving DX
- Schema changes are managed via Prisma migrations, giving version-controlled database evolution
- PostgreSQL's JSON/JSONB support allows flexible storage for configuration data (targeting rules, element selectors, step config) without needing a separate document store
