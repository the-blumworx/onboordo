# ADR-009: Internationalization

## Status

Accepted

## Context

Onboordo has two distinct i18n concerns:

1. **Dashboard UI i18n** — the admin-facing interface (buttons, labels, navigation) needs to support multiple languages so non-English-speaking teams can use the product
2. **Flow content i18n** — the onboarding content that end-users see (tooltip text, tour step titles, checklist items) must support multiple languages because Onboordo's customers may serve a global audience

These are fundamentally different problems. Dashboard i18n is a standard frontend translation challenge. Flow content i18n is a data modeling and runtime concern.

For dashboard i18n, we considered:

- **Angular's built-in i18n** — compile-time approach, produces one build per locale. Robust but operationally heavy (N builds for N languages) and doesn't support runtime switching
- **@jsverse/transloco** — runtime translation loading, single build for all locales, lazy loading per route, actively maintained successor to ngx-translate
- **ngx-translate** — similar to Transloco but less actively maintained

## Decision

- **Dashboard UI**: Use **@jsverse/transloco** for runtime i18n with lazy-loaded translation files
- **Flow content**: Build a **translation layer into the data model** — each flow step supports content in multiple locales. The admin creates translations per locale in the flow builder. The SDK detects the end-user's locale and renders the appropriate translation, falling back through a chain: user locale → flow's default locale → first available translation

## Consequences

- Transloco provides a single build for all locales with runtime language switching, simplifying deployment
- Translation files can be loaded lazily per dashboard route, keeping initial load fast
- The flow content translation model means the data layer must support locale-keyed content per step — this is a schema concern, not just a UI concern
- The SDK must implement locale detection (navigator language, configurable override) and fallback logic
- Admins need a UI in the flow builder to manage translations per step, adding complexity to the builder interface
- This approach supports full localization from day one, which is a differentiator for an open-source tool targeting global teams
