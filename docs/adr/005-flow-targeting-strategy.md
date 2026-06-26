# ADR-005: Flow Targeting Strategy

## Status

Accepted

## Context

When the SDK loads on an end-user's page, it needs to determine which flows (if any) to display. Targeting defines the rules for matching flows to users and pages. There are three common targeting strategies:

- **URL path matching** — show a flow when the user is on a specific page (e.g., `/dashboard`). Low effort, covers the primary use case of page-specific onboarding
- **User properties / segments** — show a flow based on user attributes (e.g., plan tier, sign-up date, role). Requires the SDK consumer to pass user metadata during initialization, increasing integration effort
- **Event-based triggers** — show a flow after a user performs a specific action. Requires an event tracking infrastructure, which is the highest complexity option

Display frequency is also a concern: should a flow show every time, only once, or a limited number of times?

## Decision

For MVP, use **URL path matching only**, combined with **display frequency rules** (show once, show always, show N times).

User property segments and event-based triggers are deferred to post-MVP.

## Consequences

- Covers the dominant use case: "show this product tour when the user visits the dashboard for the first time"
- The SDK only needs to report the current URL — no complex user identity integration required from the consumer
- Display frequency tracking is handled client-side (localStorage) by the SDK
- Keeps the integration burden low for early adopters, which is important for adoption of an open-source tool
- User property targeting (post-MVP) will require the SDK consumer to pass user metadata, which is a larger integration ask
- The targeting rules data model should be designed flexibly (e.g., a rules JSON object) so new targeting types can be added without schema changes
