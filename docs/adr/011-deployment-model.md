# ADR-011: Deployment Model

## Status

Accepted

## Context

Onboordo is an open-source, self-hosted product. The deployment experience directly impacts adoption: if it's hard to deploy, people won't use it. The target audience is development teams who are comfortable with Docker but shouldn't need to spend hours configuring infrastructure.

We considered:

- **docker-compose only** — simplest for users, one command to spin up everything, but less flexible for custom deployments
- **Individual Dockerfiles only** — maximum flexibility but puts the orchestration burden on the user
- **Both** — provide a ready-made docker-compose for the common case and individual Dockerfiles for custom setups

## Decision

Provide **both** a ready-made `docker-compose.yml` and individual Dockerfiles.

- `docker-compose.yml` includes the API, dashboard, and PostgreSQL as a turnkey self-hosted setup
- Individual `Dockerfile.api` and `Dockerfile.dashboard` for users who want to integrate into their own orchestration (Kubernetes, Nomad, custom compose)

## Consequences

- New users can get started with a single `docker compose up` command
- Advanced users can use the individual Dockerfiles in their own infrastructure
- Two deployment artifacts to maintain (docker-compose + individual Dockerfiles), but the Dockerfiles are shared between both approaches
- The docker-compose setup should include sensible defaults (environment variables, volume mounts for PostgreSQL persistence) while being configurable via `.env`
- Kubernetes manifests, Helm charts, and other orchestration tooling are deferred to post-MVP or community contribution
