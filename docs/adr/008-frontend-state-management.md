# ADR-008: Frontend State Management

## Status

Accepted

## Context

The Onboordo dashboard is an Angular 21 application. Its most complex feature — the node-based flow builder — involves deeply nested state: flows contain versions, versions contain steps, steps contain element data and translations, and steps are connected via branching logic. The builder also needs undo/redo capabilities and optimistic updates.

We considered:

- **Plain Angular signals + services** — minimal overhead, no learning curve, but lacks structure for complex state, no devtools, and undo/redo is entirely custom
- **NgRx SignalStore** — modern, signal-based state management from the NgRx team. Lower boilerplate than classic NgRx, has devtools support, entity management plugins, and structured patterns for complex state
- **NgRx (full Redux pattern)** — battle-tested, actions/reducers/effects pattern. Powerful and predictable but extremely verbose, with significant ceremony per feature

## Decision

Use **NgRx SignalStore** for state management in the dashboard.

## Consequences

- Provides structured state management with significantly less boilerplate than classic NgRx
- Signal-based reactivity aligns with Angular's direction and integrates naturally with Angular 21's signal APIs
- Redux Devtools support enables time-travel debugging during development, which is valuable for a complex flow builder
- Entity management support (via `@ngrx/signals/entities`) simplifies working with collections of flows, steps, and versions
- The learning curve is lower than full NgRx but higher than plain services — team members need to understand the SignalStore patterns
- If the state complexity exceeds what SignalStore handles well, migrating to full NgRx is a natural upgrade path since they share the same ecosystem
