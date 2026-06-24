# ADR-003: Authentication & Authorization

## Status

Accepted

## Context

The Onboordo dashboard needs user authentication and role-based access control. The API also serves an embeddable SDK that authenticates via API keys rather than user sessions.

We considered several dimensions:

**Token strategy:**

- Session-based auth with httpOnly cookies — simpler CSRF handling but stateful
- JWT access + refresh tokens — stateless, API-friendly, supports future mobile clients
- Hybrid (JWT access + httpOnly refresh cookie) — best of both but more complex

**Identity providers:**

- Email/password only
- Email/password + OAuth2 (Google, GitHub)
- Magic link (passwordless)

**Password hashing:**

- Bcrypt (battle-tested, widely supported)
- Argon2 (newer, memory-hard, more GPU-resistant)

**Authorization model:**

- Simple admin-only
- RBAC with predefined roles
- Custom permissions system

## Decision

- **JWT access + refresh tokens** for user authentication. Access tokens are short-lived; refresh tokens are long-lived and stored server-side for revocation
- **Email/password** as the only identity provider for MVP. OAuth2 (Google, GitHub) is deferred to post-MVP
- **Bcrypt** for password hashing
- **RBAC with three predefined roles**: Admin (full access), Editor (create/edit flows), Viewer (read-only access + analytics)
- **API keys** (hashed, with a visible prefix for identification) for SDK authentication — separate from user auth

## Consequences

- JWT enables a stateless API layer that scales horizontally without session storage
- Refresh tokens stored in the database allow explicit revocation (logout, security events)
- Deferring OAuth2 reduces MVP scope while email/password covers the primary use case
- RBAC with three roles is simple to implement and reason about, but may need expansion if users request more granular permissions
- API key authentication for the SDK is a separate auth flow from user auth, requiring distinct middleware/guards
