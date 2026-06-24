# ADR-007: SDK Architecture

## Status

Accepted

## Context

Onboordo's embeddable SDK is the runtime component that renders onboarding flows (tooltips, modals, checklists) on the end-user's page. It is injected into the customer's web application and must coexist with arbitrary host page styles and scripts.

Key constraints:

- **Bundle size must be minimal.** The SDK is loaded on every page view for the customer's users. Every KB impacts their performance metrics (Core Web Vitals)
- **Style isolation is critical.** The SDK's UI must not be affected by the host page's CSS, and must not leak its own styles into the host page
- **Framework agnosticism.** The SDK must work regardless of what framework the customer uses (React, Vue, Angular, vanilla, or anything else)
- **Dual distribution.** Non-technical users should be able to add a `<script>` tag; developers should be able to `npm install` and initialize programmatically

We considered:

- **Vanilla JS** — zero dependencies, maximum control over bundle size, works everywhere
- **Preact** — tiny component model but still adds ~4KB and introduces a framework dependency
- **Web Components** — framework-agnostic but browser support for advanced features varies

For style isolation:

- **Shadow DOM** — native browser API for style encapsulation, no CSS leakage in or out
- **iframe per element** — strong isolation but poor performance and positioning challenges
- **CSS scoping / BEM** — fragile, can still be overridden by aggressive host styles

## Decision

- Build the SDK in **vanilla JavaScript** with zero framework dependencies, targeting the smallest possible bundle (goal: < 20KB gzipped)
- Use **Shadow DOM** for rendering all onboarding UI (tooltips, modals, checklists) to achieve CSS isolation from the host page
- Distribute via **both channels**: a `<script>` tag (with `data-*` attribute configuration) and an npm package (with a programmatic JS API)
- The SDK lives in the monorepo as `libs/sdk` for development convenience

## Consequences

- Vanilla JS means more manual DOM manipulation but eliminates all framework overhead and compatibility concerns
- Shadow DOM provides robust style isolation but has some positioning nuances (e.g., tooltips that need to escape shadow boundaries may require careful z-index and positioning strategies)
- Dual distribution means maintaining both a UMD/IIFE bundle (for the script tag) and an ESM package (for npm)
- Living in the monorepo simplifies development iteration with the API, but the SDK will need its own build pipeline for publishing to npm/CDN
- The < 20KB target is aggressive and will require discipline around dependencies — every import must be justified
