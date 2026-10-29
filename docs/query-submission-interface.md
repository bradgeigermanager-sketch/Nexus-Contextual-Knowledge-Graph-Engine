# Query and Submission Interface Layer

## Purpose

This layer gives humans, scripts, agents, and external systems a stable contract for asking questions and proposing graph records without requiring them to share the same transport or source format. Canonical envelopes separate transport adapters from Nexus domain logic.

## Interface families

- Query ingress: typed JSON first; future adapters may map natural-language requests, REST/OpenAPI, GraphQL, SPARQL, Cypher, Gremlin, SQL-backed lookup, CLI flags, or saved query templates into the canonical query envelope.
- Submission ingress: canonical JSON and JSONL first; future adapters may support CSV/TSV, JSON-LD, RDF, GraphML/GEXF, database connectors, and archive bundles.
- Output egress: typed JSON is the control format; JSONL supports streams; CSV suits flat projections; GraphML is graph-oriented and may not preserve all provenance or domain metadata.

A format named in this plan is not a claim that its adapter exists. The schemas and normalizer define contracts and guardrails, not live endpoints or complete third-party language parsers.

## Canonical query envelope

schemas/query-envelope.schema.json defines nexus-query/v1. A query declares intent, a typed start reference, optional target, filters, bounded traversal constraints, and output preferences. Reference types include graph nodes, graph edges, sources, claims, evidence links, and artifacts.

Limits are part of the contract: depth and result counts are bounded, and path counts have a separate cap for future path-comparison work. Adapters must reject unsupported syntax rather than silently reinterpret it. Current query execution remains the deterministic bounded API in src/neural-artifact-query.js; the envelope validator does not execute queries.

## Canonical submission envelope

schemas/submission-envelope.schema.json defines nexus-submission/v1. A submission carries a stable submission ID and idempotency key, record type, explicit operation, typed payload, ingress provenance, and a dry-run flag that defaults to true.

Record-specific contracts are in node-submission.schema.json, edge-submission.schema.json, source-submission.schema.json, and claim-evidence-submission.schema.json. Edge endpoints are typed references, not bare labels. Claims and evidence are separate concepts: evidence has a source, locator, stance, and optional extraction confidence. Confidence is not truth.

## Validation and staging lifecycle

Recommended lifecycle for a future persistence service:

1. Receive bytes with payload-size and rate limits.
2. Parse the declared format using a format-specific parser.
3. Normalize into a canonical envelope without discarding source identifiers.
4. Validate envelope and record-specific shape.
5. Resolve references against an identified corpus snapshot.
6. Detect duplicates, conflicts, and proposed supersessions.
7. Return a preview plus a machine-readable validation report.
8. Stage for review; commit only through a separately authorized persistence path.

src/submission-contracts.js currently performs local shape checks and normalization only. It does not authenticate callers, resolve graph references, detect corpus conflicts, write to the graph, or commit records. Setting dryRun=false does not enable persistence; normalized output remains dry-run and includes a warning.

Submission result states are designed to distinguish received, invalid, staged, needs_review, committed, rejected, and duplicate. The contract describes these states but does not implement a workflow engine.

## Adapter registry

schemas/adapter-manifest.schema.json describes adapter ID/version, direction, formats, capabilities, lossiness, trust defaults, authentication/review requirements, and resource limits. Keep adapters explicit and versioned. Imported code must not execute; the manifest sets mayExecuteCode to false.

## Safety, provenance, and correctness rules

- Imported records are untrusted until validated and reviewed under policy.
- A newer timestamp alone does not prove that a record is more authoritative.
- Preserve original identifiers, content hashes, locators, timestamps, and transformation metadata.
- Preserve conflicting claims and evidence; do not silently overwrite competing records.
- Make operations idempotent and distinguish candidate creation, upsert, and supersession.
- Do not silently convert unsupported or lossy formats.
- Keep evidence stance, extraction confidence, source reliability, similarity, relevance, and truth separate.
- Record query filters and result limits so query results can be reproduced.

## Next implementation steps

1. Add a pinned JSON Schema validator with draft 2020-12 support in CI.
2. Implement JSON/JSONL parser adapters and CSV mapping profiles with lossiness reports.
3. Add corpus-snapshot reference resolution and duplicate/conflict reports.
4. Add alternative-path discovery and relationship comparison to the query engine.
5. Design authenticated API routes and a review/staging UI after these contracts stabilize.
