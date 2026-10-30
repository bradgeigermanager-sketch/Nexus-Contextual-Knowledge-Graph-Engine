# Nexus-Contextual-Knowledge-Graph-Engine

A browser-based contextual knowledge graph application with a version-controlled graph archive and an evolving reference/evidence corpus.

## Repository data

- `data/canonical/graph.json`: canonical repository snapshot of the sample graph.
- `data/import-fixtures/`: format-specific fixtures for the current import UI.
- `data/references/`: source/work metadata, author and publisher attribution, structured claims, and evidence links.
- `schemas/reference-corpus.schema.json`: JSON Schema for reference/evidence record shapes.
- `data/artifacts/`: higher-order network artifacts that group and connect typed graph/corpus objects.
- `data/orchestration/constructs.json`: synthetic declarative example of a framework-neutral orchestration construct with LangChain adapter metadata.
- `schemas/orchestration-construct.schema.json`: JSON Schema for orchestration construct records.
- `schemas/neural-artifact.schema.json`: schema for artifact records and artifact-to-artifact links.

The graph archive and reference corpus currently use explicitly synthetic demonstration data. They exercise schemas and relationships, not real-world factual assertions.

## Public project site

- [GitHub Pages implementation guide](docs/github-pages.md)
- [Nexus portal guide](docs/portal.md)
- [Read-only Nexus portal](site/portal.html): graph search, bounded relationship inspection, source/evidence review, shared-module submission preview, endpoint directory, and implementation status.
- [Implementation status registry](data/implementation-status.json).
- Build script: `scripts/build-pages.js` (validates the corpus and generates the browser bundle).
- Shared staging/review services: `src/submission-staging.js` and `src/submission-review.js` (conflict-aware candidate classifications, grouped review queues, snapshot-bound decision validation; no authentication or persistence).
- Static landing page source: `site/index.html`
- Multilingual documentation reader: `site/docs.html`
- Deployment workflow: `.github/workflows/pages.yml` (publishes only from `main`; branch and pull-request runs build the artifact without replacing the published site).

## Documentation

- [Graph archive and format policy](docs/graph-archive.md)
- [Graph data contract](docs/graph-data-contract.md)
- [Reference and evidence corpus](docs/reference-evidence-corpus.md)
- [Neural Network Artifact Layer design, loader, validator, and traversal](docs/neural-artifact-layer.md)
- [LangChain-style orchestration constructs](docs/langchain-constructs.md)
- [Query and submission interface contracts](docs/query-submission-interface.md)
- [Active web endpoint layer](docs/web-endpoints.md)
- [Submission review workflow](docs/submission-review.md)

## Validation and query foundation

The repository uses Node.js built-in tests and GitHub Actions to check graph structure, import/export helper behavior, archive fixtures, reference-corpus relationships, corpus loading, and bounded traversal.

- `src/neural-artifact-validation.js`: reusable structural and cross-reference validator.
- `src/neural-artifact-corpus.js`: loads the graph, references, evidence, artifacts, and artifact links into one validated snapshot with lookup indexes.
- `src/neural-artifact-traversal.js`: bounded typed traversal from nodes, edges, sources, claims, evidence links, or artifacts; returns paths that preserve relationship and provenance metadata.
- `src/neural-artifact-query.js`: typed start/target queries and post-traversal filters for record types, artifact types, statuses, contexts, and relationships.
- `src/submission-contracts.js`: local shape checks for canonical query envelopes and node/edge/source/claim-evidence submission envelopes; no persistence or authorization.
- `src/submission-import.js`: bounded JSON and JSONL parsing into validated submission envelopes, with per-record errors and dry-run-only results.
- `src/submission-staging.js`: conflict-aware dry-run staging against the validated corpus snapshot; no commit path.
- `src/submission-review.js`: grouped review summaries and validation of reviewer-decision records against a candidate fingerprint and caller-supplied corpus snapshot ID; no identity authentication or persistence.
- `src/web-endpoint-client.js`: curated HTTPS endpoint requests with explicit host/method policies, disabled redirects, timeouts, and bounded response bodies.
- `data/endpoints/registry.json` and `schemas/web-endpoint.schema.json`: versioned profiles for GitHub REST and Wikidata SPARQL.
- `schemas/query-envelope.schema.json` and the `*-submission.schema.json` files: versioned JSON contracts for queries and typed record submissions.
- `schemas/adapter-manifest.schema.json`, `schemas/validation-report.schema.json`, and `schemas/submission-result.schema.json`: adapter capability, validation, and staging-result contracts.
- `schemas/submission-review-decision.schema.json`: decision-record contract for accept, reject, request-more-evidence, and defer outcomes.
- `test/neural-artifact-corpus.test.js`, `test/neural-artifact-traversal.test.js`, and `test/neural-artifact-query.test.js`: loader, traversal, and query tests.

The query/submission layer currently defines canonical JSON contracts, local envelope validation, and bounded JSON/JSONL import. It is not yet a general crawler, inbound webhook service, REST API for Nexus itself, UI, CSV/RDF/GraphML parser, corpus-reference resolver, or persistence service. The outbound endpoint client is opt-in and requires deployment-level egress controls. The orchestration catalog is declarative groundwork, not a connected LangChain runtime. Construct examples are synthetic and execution-disabled. Traversal and queries are deterministic graph exploration, not a trained neural network, semantic search engine, or truth-ranking system. Query filters are currently applied after bounded traversal, and only one shortest discovered path per reached reference is returned. The static portal is wired to the validated corpus and shared traversal/query/staging modules. Submission review helpers validate decision records but do not authenticate reviewers or persist decisions.

## Multilingual system documentation

The maintained documentation set provides a technical read-out and a plain-language guide in 13 languages: Arabic, English, Polish, German, French, Indonesian, Hindi, Simplified Chinese, Russian, Swahili, Greek, Japanese, and Spanish.

- [Documentation index](docs/system-documentation.md)
- [Documentation maintenance policy](docs/documentation-maintenance.md)
- [Language manifest](docs/documentation-manifest.json)

Each language has its own file under `docs/i18n/`. English is the terminology-control version; translations should be updated together whenever implementation status or system concepts change. The documentation distinguishes current implementation from planned work and labels synthetic examples as demonstrations rather than real-world evidence.
