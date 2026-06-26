# Onboordo — Claude Code Rules

This file exists so Claude Code picks up the project conventions. The canonical source of truth is `.agents/AGENTS.md` — read that file for all rules. The content below is intentionally identical.

---

<!-- SYNC: This file is kept in sync with .agents/AGENTS.md. If you update conventions, update both. -->

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
- `apps/extension` — Chrome Extension (Manifest V3, service worker)
- `libs/sdk` — Embeddable vanilla JS SDK (Vite library mode, ESM only)
- `libs/shared` — Shared types/interfaces consumed by both API and dashboard
- `prisma/` — Database schema, migrations, and seed script
- `generated/` — OpenAPI-generated code (gitignored, regenerated in CI via openapi-generator)
- `docs/adr/` — Architecture Decision Records

## Code Style & Conventions

### General

- Formatting is enforced by Prettier (see `.prettierrc`). Do not override Prettier decisions.
- Linting is enforced by ESLint (see `eslint.config.mjs`). Fix lint errors, don't suppress them.
- 2 spaces, no tabs. Single quotes. Semicolons. Trailing commas (ES5). Max line width 100.
- Always add a final newline.

### Naming

- **Files:** kebab-case (`flow-builder.service.ts`).
- **Classes, interfaces, types:** PascalCase (`FlowService`, `IFlowService`).
- **Interfaces:** Prefix with `I` (`IFlowService`, `IStepConfig`).
- **Variables, functions, methods:** camelCase (`getFlowById`, `isPublished`).
- **Constants:** UPPER_SNAKE_CASE for true constants (`MAX_RETRY_COUNT`), camelCase for config objects.
- **Enums:** PascalCase name, PascalCase members. Use `enum` only for values shared with the database. Prefer union types (`type Status = 'draft' | 'published'`) for internal code.

### TypeScript

- Strict mode. No `any` unless absolutely unavoidable and justified with a comment.
- Prefer `readonly` for properties that shouldn't change.
- Prefer named exports over default exports. No default exports.
- TSDoc on all exported functions, classes, and interfaces.
- Never use magic strings — define constants or enums for repeated values (route paths, event names, config keys).
- Absolute imports via tsconfig paths (`@onboordo/sdk`, `@api/auth`). No relative imports across app/lib boundaries.
- Async/await in NestJS. RxJS in Angular services that talk to the API.

### Code Structure

- Keep it lean — avoid abstractions until you need them in 3+ places (Rule of Three).
- Moderate function length — break up when it improves readability, no strict line limit.
- No nested ternaries — use if/else or early returns.
- Prefer early returns over deep nesting.
- Max 3 levels of nesting in any function.
- No `else` after `return` (guard clause pattern).

## Angular (Dashboard)

### Components

- Standalone components only. No NgModules for new code.
- Use Angular signals and the new control flow syntax (`@if`, `@for`, `@switch`).
- Components use the shorthand file naming: `app.ts`, `app.html`, `app.css` (not `app.component.ts`).
- Use `inject()` function, not constructor injection.
- OnPush change detection for all components (signal-based makes this natural).

### Feature Structure

Organize by feature: `features/<feature-name>/` for routes, `core/` for cross-cutting concerns.

```
features/flow-builder/
  flow-builder.ts          # smart/page component
  flow-builder.html
  flow-builder.css
  store.ts                 # NgRx SignalStore
  flow-builder.service.ts  # data-access (API calls)
  models.ts                # types/interfaces for this feature
  ui/                      # dumb/presentational sub-components
    step-card.ts
    step-card.html
  index.ts                 # barrel re-export
```

- Barrel files (`index.ts`) per feature directory.
- State management via NgRx SignalStore — no ad-hoc service state for shared data.
- Store files named `store.ts` inside the feature directory.

### Routing & Navigation

- Lazy-load all feature routes.
- Page titles via Angular Router's built-in `TitleStrategy` with Transloco keys.
- Functional route guards with `inject()`. Use a shared `authGuard` utility that checks roles.

### Forms & Inputs

- Signal-based forms (new Angular forms API).
- Debounce/throttle user input that triggers API calls.

### Theming

- Mix approach: Material 3 theme defines design tokens (colors, typography, shape) via CSS custom properties. Tailwind v4 handles layout, spacing, and responsive utilities.
- Notifications/toasts via Angular Material's `MatSnackBar`.

### HTTP & Auth

- `HttpInterceptor` that attaches JWT and handles 401 → refresh token flow.
- RxJS in Angular services that talk to the API.

### UX Patterns

- Optimistic UI updates where possible, loading spinners as fallback.
- Virtual scrolling for large lists.
- Image optimization (lazy loading, responsive sizes).

### i18n

- i18n keys via Transloco — never hardcode user-facing strings.

### Accessibility

- Not a priority for MVP. Rely on Angular Material's built-in a11y features.

## NestJS (API)

### Architecture

- Organize by domain module: one directory per bounded context (e.g., `system/`, `flows/`, `auth/`).
- Use the NestJS class-based approach: `@Controller`, `@Injectable`, `@Module`.
- Controllers are thin: validation + delegation + response shaping. Services own all business logic.
- One service per domain entity (`FlowService`, `StepService`, etc.).
- All responses follow the shapes defined in the OpenAPI spec. If you need a new endpoint, add it to the spec first.

### Validation & Sanitization

- Validation via `class-validator` and `class-transformer` with the global `ValidationPipe`.
- Input sanitization via `class-transformer`: trim strings, strip unknown fields.

### DTOs

- Suffix with `Dto`: `CreateFlowDto`, `UpdateFlowDto`, `FlowResponseDto`.
- On mutations (POST/PUT/PATCH), return the created/updated resource in the response body.

### Error Handling

- Custom domain exception classes (e.g., `FlowNotFoundException`, `DuplicateFlowNameException`) that get mapped to HTTP responses by a global exception filter.
- Error response format: **RFC 7807 Problem Details** (`type`, `title`, `status`, `detail`, `instance`).
- Domain exceptions for known/expected errors. Global exception filter catches unexpected errors and returns a generic 500 with no internal details exposed to the client.
- Log the full stack trace server-side for all unexpected errors.

### Logging

- Structured JSON logging via **Pino** (`nestjs-pino`).
- Services can log freely — inject the logger wherever needed.

### Auth & Security

- Guard-based auth: `@UseGuards(JwtAuthGuard)` for user routes, `@UseGuards(ApiKeyGuard)` for SDK routes.
- **Helmet** for HTTP security headers.
- **CORS** configured per-environment (strict origins in production, `localhost` in development).
- **`@nestjs/throttler`** for rate limiting (defense in depth).

### API Design

- Pagination: offset-based (`?page=2&limit=20`).
- API field casing: camelCase in JSON responses. Prisma maps to snake_case in the database automatically.

## Prisma (Database)

- Schema lives in `prisma/schema.prisma`.
- All tenant-scoped models must have a `workspaceId` field.
- Use UUIDs for primary keys.
- All models include `createdAt` and `updatedAt` timestamps.
- Column naming: snake_case in the database, mapped to camelCase in Prisma client.
- Soft delete (via `deletedAt` timestamp) for important entities (flows, workspaces). Hard delete for ephemeral data.
- Create migrations with descriptive names: `npx prisma migrate dev --name <description>`.
- Seed data via `prisma/seed.ts`, run with `npx prisma db seed`.

## OpenAPI & Code Generation

- Contract-first: the OpenAPI spec (`apps/api/openapi.yaml`) is the source of truth.
- Code generation via `openapi-generator` (configured in `openapitools.json`).
- Generated code lives in `generated/` and is **gitignored** — regenerated in CI.
- Never hand-edit generated client/server code.
- Shared types/interfaces live in `libs/shared` for consumption by both API and dashboard.

## SDK

- Vanilla JS, zero dependencies, Shadow DOM. Target < 20KB gzipped.
- Bundled with **Vite library mode**.
- Output format: **ESM only**.

## Chrome Extension

- Manifest V3 with service worker.

## Testing

### Unit Tests

- Unit tests with Vitest. Test files live next to the code they test (`*.spec.ts`).
- Write tests for business logic and guards. Don't test framework boilerplate.
- Test naming: descriptive method-style names (`createFlow_shouldThrowWhenNameIsDuplicate`).
- Test structure: Arrange / Act / Assert (AAA) with clear section comments.
- Mock Prisma in unit tests for speed and isolation.

### Integration & E2E Tests

- Real Postgres via **testcontainers** for integration and E2E tests.
- E2E tests with Playwright in the `*-e2e` apps.

### Coverage

- No global minimum. Enforce ~80% on critical modules (auth, guards, flow engine) via per-project Nx thresholds.

## Environment & Configuration

- **API secrets:** `.env` files with Nx environment-specific overrides (`.env.development`, `.env.production`). Commit `.env.example` with placeholder values.
- **Dashboard build-time config:** Angular `fileReplacements` (`environment.ts` → `environment.prod.ts`).
- Never commit real secrets to git.

## Containerization

- Docker images for everything (dev + prod).
- Docker Compose provided as both a dev and production example.

## Nx Monorepo

- Strict dependency boundaries via `enforce-module-boundaries` (tags + constraints).
- Barrel files (`index.ts`) at feature and lib levels.

## Git

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`, `style:`.
- semantic-release handles versioning — never manually bump version numbers.
- Branch naming: `feat/<name>`, `fix/<name>`, `chore/<name>`.
- Husky + lint-staged for pre-commit hooks (formatting and linting).
- One `CHANGELOG.md` per package, auto-generated by semantic-release.

## Documentation

- A thorough `README.md` in each app/lib with setup instructions, architecture notes, and run commands.
- Root `README.md` for project overview and quick start.
- ADRs in `docs/adr/` for major design decisions.
- Storybook for reusable UI components is planned but not yet implemented.
