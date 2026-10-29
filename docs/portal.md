# Nexus static portal

The portal is a read-only browser UI for the current repository snapshot. It is not a server API.

## Included views

- **Graph search:** lexical matching against canonical graph nodes and edges.
- **Relationship inspector:** direct-edge lookup and shortest unweighted path inspection. Path discovery treats edges as traversable in either direction; edge direction remains visible in labels. This is structural navigation, not causal inference.
- **Sources and evidence:** separate source, claim, and evidence-link records with raw metadata and verification stance.
- **Submission preview:** bounded client-side JSON/JSONL parsing, core envelope checks, and duplicate idempotency-key detection within the pasted batch. It does not persist or authorize anything. The Node.js normalizer remains authoritative for repository contract checks.
- **Endpoint directory:** shows configured endpoint profile properties and explicitly labels live connectivity as unverified.
- **Implementation registry:** feature status, repository evidence paths, and limitations.

## Data loading

The page fetches the canonical graph, source/claim/evidence JSON, endpoint registry, and implementation registry as static files from the deployed site. Use GitHub Pages or a local static HTTP server; opening the HTML via `file://` may block fetch requests.

## Safety and limitations

- Current graph/source fixtures are synthetic demonstration data.
- Search is lexical, not semantic or embedding-based.
- The browser UI never invokes the outbound endpoint client.
- Submission preview is not the repository's full Node validator, and valid preview records are only candidates.
- There is no database write, authentication, server-side authorization, commit, or audit-log service.
- Endpoint enablement means selectable profile, not successful connectivity.
- Implementation statuses are maintained metadata and are not a substitute for CI/deployment results.
