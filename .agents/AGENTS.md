# Onboordo — Agent Rules

## Architecture Decisions

Before writing any code, read the Architecture Decision Records in `docs/adr/`. These capture every major design decision for the project. The `docs/adr/README.md` has a full index.

Key decisions that affect daily coding:

- **Multi-tenancy (ADR-001):** All tenant-scoped data must be filtered by workspace. Even though OSS is single-tenant, the schema is workspace-scoped.
- **Auth (ADR-003):** JWT access + refresh tokens. Email/password with bcrypt. RBAC with Admin, Editor, Viewer roles. API keys (hashed) for SDK auth.
- **API design (ADR-013):** Contract-first. The OpenAPI spec (`apps/api/openapi.yaml`) is the source of truth. Change the spec first, then generate code. Never hand-edit generated client/server code.
- **Real-time (ADR-004):** SSE for server→client push. REST for client→server. No WebSocket.
- **State management (ADR-008):** NgRx SignalStore in the dashboard. No plain services for shared state, no full NgRx Redux.
- **i18n (ADR-009):** @jsverse/transloco for dashboard UI. Built-in translation layer for flow content.
- **SDK (ADR-007):** Vanilla JS, zero dependencies, Shadow DOM. Target < 20KB gzipped.
- **Content workflow (ADR-010):** Draft → Review → Published. Never mutate a published version.

## Project Structure

This is an Nx 23 monorepo:

- `apps/api` — NestJS 11 backend (SWC compiler, Webpack build)
- `apps/dashboard` — Angular 21 frontend (Material 3, Tailwind v4)
- `apps/extension` — Chrome Extension (element picker)
- `libs/sdk` — Embeddable vanilla JS SDK
- `prisma/` — Database schema and migrations
- `docs/adr/` — Architecture Decision Records

## Code Style & Conventions

### General

- Formatting is enforced by Prettier (see `.prettierrc`). Do not override Prettier decisions.
- Linting is enforced by ESLint (see `eslint.config.mjs`). Fix lint errors, don't suppress them.
- 2 spaces, no tabs. Single quotes. Semicolons. Trailing commas (ES5). Max line width 100.
- Always add a final newline.

### TypeScript

- Strict mode. No `any` unless absolutely unavoidable and justified with a comment.
- Prefer `readonly` for properties that shouldn't change.
- Use `enum` only for values shared with the database. Prefer union types (`type Status = 'draft' | 'published'`) for internal code.
- Prefer named exports over default exports.

### Angular (Dashboard)

- Standalone components only. No NgModules for new code.
- Use Angular signals and the new control flow syntax (`@if`, `@for`, `@switch`).
- Components use the shorthand file naming: `app.ts`, `app.html`, `app.css` (not `app.component.ts`).
- Use `inject()` function, not constructor injection.
- Organize by feature: `features/<feature-name>/` for routes, `core/` for cross-cutting concerns.
- State management via NgRx SignalStore — no ad-hoc service state for shared data.
- i18n keys via Transloco — never hardcode user-facing strings.

### NestJS (API)

- Organize by domain module: one directory per bounded context (e.g., `system/`, `flows/`, `auth/`).
- Use the NestJS class-based approach: `@Controller`, `@Injectable`, `@Module`.
- Validation via `class-validator` and `class-transformer` with the global `ValidationPipe`.
- Guard-based auth: `@UseGuards(JwtAuthGuard)` for user routes, `@UseGuards(ApiKeyGuard)` for SDK routes.
- All responses follow the shapes defined in the OpenAPI spec. If you need a new endpoint, add it to the spec first.

### Prisma

- Schema lives in `prisma/schema.prisma`.
- All tenant-scoped models must have a `workspaceId` field.
- Use UUIDs for primary keys.
- Create migrations with descriptive names: `npx prisma migrate dev --name <description>`.

### Testing

- Unit tests with Vitest. Test files live next to the code they test (`*.spec.ts`).
- E2E tests with Playwright in the `*-e2e` apps.
- Write tests for business logic and guards. Don't test framework boilerplate.

### Git

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`, `style:`.
- semantic-release handles versioning — never manually bump version numbers.
- Branch naming: `feat/<name>`, `fix/<name>`, `chore/<name>`.
