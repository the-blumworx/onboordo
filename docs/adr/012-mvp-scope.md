# ADR-012: MVP Scope

## Status

Accepted

## Context

Onboordo could support a wide range of onboarding element types, analytics depth, targeting complexity, and builder sophistication. Defining what's in and out of the first release is critical to shipping something usable without overbuilding.

This ADR captures the scoping decisions for the initial release and what is explicitly deferred.

## Decision

### In scope for MVP

**Onboarding element types:**

- Product Tours (step-by-step guided walkthroughs)
- Tooltips (contextual hints attached to elements)
- Checklists (progress-tracked task lists)

**Flow builder:**

- Node-based graph editor for step ordering and branching logic
- Step content editor with multi-locale support
- Visual element picker via Chrome Extension
- Draft → Review → Published workflow

**Analytics:**

- Simple flow-level metrics: view count, completion count, completion rate
- Designed so the underlying event data can support deeper analytics later without schema changes

**Dashboard:**

- Dark mode support from day one (Material 3 color scheme)
- RBAC (Admin, Editor, Viewer)
- i18n via Transloco

### Explicitly deferred to post-MVP

| Feature                                               | Rationale                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| OAuth2 (Google, GitHub)                               | Email/password covers the primary use case; OAuth adds external dependencies    |
| User property / segment targeting                     | Requires SDK consumers to integrate user identity, increasing adoption friction |
| Event-based flow triggers                             | Requires event tracking infrastructure; URL matching covers 80% of use cases    |
| Modals / Announcements                                | Not a core onboarding primitive; can be added as a step type later              |
| Surveys / NPS                                         | Different product concern; deferred                                             |
| Banners                                               | Low complexity to add later                                                     |
| Full analytics (funnels, drop-off, step-level timing) | Data model supports it, but the visualization and API surface is significant    |
| Mobile SDK                                            | Web-first; mobile follows if there's demand                                     |
| Angular graph editor library selection                | Evaluate ngx-vflow, Foblex Flow, and NgDrawFlow during implementation           |

## Consequences

- The MVP focuses on the core value loop: admin creates a flow → publishes it → end-users see it → admin sees basic metrics
- Three element types (tours, tooltips, checklists) cover the most common onboarding patterns
- Simple analytics keeps the MVP shipping timeline reasonable while the append-only event model ensures no data is lost for future deeper analysis
- Deferring OAuth, advanced targeting, and surveys keeps the initial integration surface small, lowering the barrier to adoption
- The graph editor library is intentionally left as an evaluate-during-implementation decision rather than a premature commitment
