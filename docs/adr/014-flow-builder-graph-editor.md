# ADR-014: Flow Builder — Graph-Based Editor

## Status

Accepted

## Context

The flow builder is Onboordo's core feature — where admins design onboarding experiences. The builder's editing paradigm determines both the UX complexity and the underlying data model.

We considered three approaches:

- **Sequential step list** — admin adds steps in a linear order, reorders via drag-and-drop. Simple to build and understand, but cannot express branching logic (e.g., "if user clicks Yes, go to step 3; if No, skip to step 5")
- **Step-by-step form wizard** — add steps sequentially with a live preview panel. Similar limitations to a step list but with a preview-driven workflow
- **Node-based graph editor** — steps are nodes on a canvas, connected by edges that define flow order and branching. Similar to tools like React Flow or visual programming environments. Supports linear flows, branching, and conditional paths

Onboarding flows benefit from branching: "Did the user complete the task? → Yes: show congratulations → No: show a help tooltip." A linear step list cannot express this without workarounds.

## Decision

Use a **node-based graph editor** for the flow builder. Steps are represented as nodes on a canvas, connected by edges that define sequence and branching logic.

The specific Angular graph editor library is **not yet decided**. Candidates under evaluation are ngx-vflow, Foblex Flow, and NgDrawFlow. The library will be selected during implementation based on hands-on evaluation of Angular integration quality, customization flexibility, and maintenance health.

## Consequences

- Enables branching and conditional onboarding paths, which is a differentiator over simpler competitors
- The data model must support step connections with optional conditions (not just a step order integer)
- Higher implementation complexity than a linear step list — both in the UI (canvas rendering, connection drawing, zoom/pan) and in the backend (graph validation, cycle detection)
- The SDK must be able to traverse a graph structure at runtime, not just iterate a list
- Admin UX needs careful design to keep the graph editor approachable for non-technical users while exposing branching power for advanced use cases
- The library decision is deferred intentionally to allow hands-on evaluation rather than committing based on documentation alone
