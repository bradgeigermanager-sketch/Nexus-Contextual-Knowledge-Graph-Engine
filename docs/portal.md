# Nexus static portal

The portal is a read-only browser UI for the current repository snapshot. It is not a server API.

## Included views

- **Graph search:** lexical matching against canonical graph nodes and edges.
- **Relationship inspector:** uses the repository's bundled `queryNeuralArtifactCorpus` and bounded traversal implementation over the validated graph, references, evidence, and artifacts. It applies depth/result caps and reports query warnings. Results are structural navigation, not causal inference.
- **Sources and evidence:** separate source, claim, and evidence-link records with raw metadata and verification stance.
- **Submission staging and review:** uses the shared JSON/JSONL importer, envelope normalizer, conflict-aware staging, and grouped review summaries. The portal can draft a review decision (accept, reject, request more evidence, defer), binding it to a candidate fingerprint and manually supplied corpus snapshot ID; the draft is validated locally but not saved. It preserves provenance and idempotency keys, fingerprints candidate payloads for review, and classifies candidates as ready for review, duplicate/conflict with existing records, unresolved references, or duplicate/conflict within the batch. The FNV-1a 32-bit fingerprint is a non-cryptographic review aid, not a security or integrity guarantee. The separate review helper validates proposed decisions against a candidate fingerprint and supplied corpus snapshot ID. It does not authenticate reviewers, authorize, persist, or commit anything.
- **Endpoint directory:** shows configured endpoint profile properties and explicitly labels live connectivity as unverified.
- **Implementation registry:** feature status, repository evidence paths, and limitations.

## Data loading

The Pages build runs the repository test suite, loads and validates the canonical corpus with `loadNeuralArtifactCorpus`, and emits `data/portal-corpus.json`. The portal fetches this validated snapshot plus the endpoint and implementation registries. The browser query/import bundle is generated from the repository's CommonJS modules by `scripts/build-pages.js`. Use GitHub Pages or a local static HTTP server; opening the HTML via `file://` may block fetch requests.

## Safety and limitations

- Current graph/source fixtures are synthetic demonstration data. Build fails if the corpus loader reports validation errors.
- Search is lexical, not semantic or embedding-based.
- The browser UI never invokes the outbound endpoint client.
- Submission preview calls the shared importer, normalizer, conflict-aware staging, and review-summary code. Valid preview records remain candidates; there is no reviewer authentication, authorization, durable decision record, or persistence. Decision drafts are user-supplied assertions, not proof of reviewer identity.
- There is no database write, authentication, server-side authorization, commit, or audit-log service. Staging comparisons are a review aid; they are not a final merge/conflict resolution decision.
- Endpoint enablement means selectable profile, not successful connectivity.
- Implementation statuses are maintained metadata and are not a substitute for CI/deployment results.
