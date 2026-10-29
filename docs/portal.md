# Nexus static portal

The portal is a read-only browser UI for the current repository snapshot. It is not a server API.

## Included views

- **Graph search:** lexical matching against canonical graph nodes and edges.
- **Relationship inspector:** uses the repository's bundled `queryNeuralArtifactCorpus` and bounded traversal implementation over the validated graph, references, evidence, and artifacts. It applies depth/result caps and reports query warnings. Results are structural navigation, not causal inference.
- **Sources and evidence:** separate source, claim, and evidence-link records with raw metadata and verification stance.
- **Submission preview:** uses the same `parseSubmissionText` importer and `normalizeSubmission` code as the Node.js project, bundled for the browser. JSON/JSONL parsing, byte/record limits, typed envelope checks, and duplicate idempotency-key detection share the repository implementation. It does not persist or authorize anything.
- **Endpoint directory:** shows configured endpoint profile properties and explicitly labels live connectivity as unverified.
- **Implementation registry:** feature status, repository evidence paths, and limitations.

## Data loading

The Pages build runs the repository test suite, loads and validates the canonical corpus with `loadNeuralArtifactCorpus`, and emits `data/portal-corpus.json`. The portal fetches this validated snapshot plus the endpoint and implementation registries. The browser query/import bundle is generated from the repository's CommonJS modules by `scripts/build-pages.js`. Use GitHub Pages or a local static HTTP server; opening the HTML via `file://` may block fetch requests.

## Safety and limitations

- Current graph/source fixtures are synthetic demonstration data. Build fails if the corpus loader reports validation errors.
- Search is lexical, not semantic or embedding-based.
- The browser UI never invokes the outbound endpoint client.
- Submission preview calls the shared repository importer/normalizer code, but valid preview records are still only candidates; there is no authorization, corpus conflict check, or persistence.
- There is no database write, authentication, server-side authorization, commit, or audit-log service.
- Endpoint enablement means selectable profile, not successful connectivity.
- Implementation statuses are maintained metadata and are not a substitute for CI/deployment results.
