# ADR-006: Element Targeting Approach

## Status

Accepted

## Context

A core feature of Onboordo is attaching onboarding steps (tooltips, highlights) to specific elements in the customer's web application. The admin needs a way to select which element a step targets, and the SDK needs to reliably find that element at runtime.

We researched how industry leaders (Userflow, Appcues, Userpilot) approach this and found a consistent pattern:

- **All major no-code onboarding tools use a browser extension** for the authoring experience (element selection). The extension runs in the admin's browser on their actual site, avoiding cross-origin/iframe issues entirely
- An **iframe-based preview** inside the dashboard (embedding the customer's site) is problematic because most sites set `X-Frame-Options` or CSP headers that block iframe embedding
- An **SDK "design mode"** (admin activates an overlay on the live site) couples authoring to the runtime SDK and complicates the admin experience

For element identification, Userflow uses an **inference algorithm** that evaluates multiple selector strategies (IDs, classes, attributes, DOM path) rather than relying on a single CSS selector. This makes targeting resilient to minor DOM changes between deploys.

## Decision

- Use a **Chrome Extension** for visual point-and-click element selection during flow authoring
- The extension captures the selected element's selector data (using multiple strategies for resilience) and a screenshot for visual confirmation in the dashboard
- Provide a **manual CSS selector override** for power users who prefer explicit targeting or have custom `data-*` attributes
- The extension communicates element data back to the dashboard via the API
- At runtime, the SDK uses the stored selector data to find and attach to the target element

## Consequences

- Admins must install a browser extension to use the visual element picker — this is industry-standard for no-code onboarding tools and expected by the target audience
- The extension avoids all cross-origin and CSP issues that plague iframe-based approaches
- Selector inference (multiple strategies) adds complexity but significantly improves reliability across deployments
- The extension is a separate application in the monorepo (`apps/extension`), with its own build and release pipeline
- Power users who add `data-onboordo-*` attributes to their DOM get the most stable targeting, but it's not required
- The SDK must implement the same selector resolution logic as the extension to find elements consistently
