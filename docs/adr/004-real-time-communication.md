# ADR-004: Real-Time Communication

## Status

Accepted

## Context

The embeddable SDK needs to receive updates when an admin publishes or modifies a flow, so end-users see changes without a page refresh. The SDK also needs to report events (flow started, step viewed, completed, dismissed) back to the server.

The data flow is asymmetric: server→client push is the primary real-time need, while client→server reporting is fire-and-forget and doesn't need a persistent connection.

We considered:

- **Socket.IO** — full bidirectional, auto-reconnect, but adds ~50KB to the SDK bundle and requires a Redis adapter for multi-instance scaling
- **Raw WebSocket (ws)** — lighter than Socket.IO, bidirectional, but requires manual reconnection logic and sticky sessions for scaling
- **SSE (Server-Sent Events)** — server→client only, native browser API (0KB added to SDK), built-in auto-reconnect, works over plain HTTP, scales without sticky sessions

## Decision

Use **SSE (Server-Sent Events)** for server→client real-time push and **standard REST endpoints** for SDK→server event reporting.

## Consequences

- The SDK remains as small as possible — SSE uses the native `EventSource` API with zero additional bundle size
- SSE auto-reconnects natively without library code
- No CORS complications beyond standard HTTP — SSE works through proxies and CDNs
- Scaling is straightforward since SSE connections are stateless HTTP; no sticky sessions or Redis pub/sub adapters needed for basic use
- NestJS supports SSE natively via the `@Sse()` decorator
- If true bidirectional communication is needed in the future (e.g., collaborative flow editing), WebSocket can be added alongside SSE without replacing it
- Event reporting via REST is simpler to debug, log, and rate-limit than socket-based reporting
