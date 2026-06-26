# ADR-013: Contract-First API Design

## Status

Accepted

## Context

Onboordo has multiple consumers of the same API: the Angular dashboard, the embeddable SDK, the Chrome Extension, and potentially third-party integrations. Keeping these consumers in sync with the API is a coordination challenge that grows with the number of consumers and contributors.

There are two common approaches:

- **Code-first** — write the NestJS controllers and decorators, then generate an OpenAPI spec from the code. Fast to start, but the spec is a byproduct of implementation and divergence between intent and reality is common
- **Contract-first (spec-first)** — write the OpenAPI spec as the source of truth, then generate both server stubs and client libraries from it. Slower to start, but the spec becomes a shared agreement between all consumers

The project already has an `openapi.yaml` with the initial system setup endpoints, and `generate-api` Nx targets that produce a `typescript-angular` client for the dashboard and `typescript-nestjs` stubs for the API.

## Decision

Use a **contract-first (OpenAPI-first)** API design approach. The OpenAPI 3.1 specification is the source of truth for the API surface. Server stubs and client libraries are generated from this spec using the OpenAPI Generator tooling already configured in the project.

The extension communicates with the API via the same REST endpoints — it is another API consumer, not a special channel.

## Consequences

- API changes start as spec changes, forcing upfront design thinking before implementation
- Generated clients stay in sync with the API automatically — no manual client maintenance
- Breaking changes are visible in spec diffs during code review, making them harder to introduce accidentally
- The spec doubles as living documentation (served via Swagger UI at `/docs`)
- Developers must learn the OpenAPI spec format and the code generation workflow
- Generated code (server stubs and clients) should not be hand-edited — customizations go in the implementation layer that wraps the generated stubs
- The generator output style (naming conventions, module structure) is controlled by the generator, not the team — accepting this tradeoff is part of the approach
