# Neural Network Artifact Layer

## Purpose

The Neural Network Artifact Layer (NNAL) is a higher-order modeling layer above the primary graph and reference/evidence corpus. It represents meaningful collections of nodes, edges, sources, claims, contexts, processes, and other artifacts as reusable network artifacts that can connect to one another.

Here, **neural node** is a modeling term for a typed higher-order unit. It does not mean the application already contains a trained artificial neural network. The first implementation is an inspectable graph-based representation; learned embeddings, neural models, and inference can be optional backends later.

## Core concept

An artifact is a stable, versioned object that refers to existing objects without copying them or pretending they are the same kind of thing. An artifact can represent a subgraph, topic cluster, evidence bundle, context-specific interpretation, process model, feature set, embedding, rule set, or model output. Artifacts can link to other artifacts, enabling nested and overlapping structures without flattening everything into one graph node.

## Design principles

1. **Typed references.** Each member reference declares its domain: graph node, graph edge, source, claim, evidence link, context, artifact, or model.
2. **Stable identity and immutable versions.** artifactId identifies the conceptual artifact; versionId identifies a specific immutable revision. New versions supersede old versions rather than silently overwriting them.
3. **Membership differs from relationship.** Membership means inclusion in a collection. Typed artifact links express meaning such as contains, part_of, overlaps, supports, contradicts, derived_from, contextualizes, depends_on, or transforms.
4. **Preserve graph identity.** Refer to existing nodes, edges, or paths rather than creating duplicates just to represent membership.
5. **Explicit context and scope.** Record time ranges, geographic scope, domain, assumptions, inclusion/exclusion criteria, and context dependencies.
6. **Evidence-aware.** A cluster or model output is not itself proof of the claims it contains. Claims about artifacts need evidence links and status.
7. **Explainable derivation.** Record whether membership was curated, rule-derived, imported, algorithmically clustered, or model-proposed. Store algorithm/model version, parameters, input snapshot, run ID, and timestamp where applicable.
8. **Keep similarity separate from truth.** Embedding similarity, edge weight, relevance, confidence, source reliability, and evidence stance are distinct dimensions.
9. **Support uncertainty and alternatives.** Preserve competing cluster assignments, alternate interpretations, unresolved membership, and rejected proposals with rationale.
10. **Security boundaries.** Treat source text and model outputs as untrusted data. Validate types, constrain recursion, and never execute artifact content as code.

## Data model

An artifact has a stable `artifactId`, an immutable `versionId`, a controlled `artifactType`, human-readable label/description/status, typed `members`, explicit context, optional features, derivation metadata, evidence references, supersession references, and creation metadata. An artifact link connects two artifacts using a relation type and records directionality, optional weight, context, evidence references, rationale, and version endpoints.

Membership is not a claim of support. A member role describes why an object is included; evidence links separately describe how a source relates to a claim or target. Similarity, source reliability, claim support, extraction confidence, and factual truth must not be collapsed into one score.

## Validator

`src/neural-artifact-validation.js` exports `validateNeuralArtifactCorpus(input)`. It checks collection shapes, duplicate identifiers, graph edge endpoints, typed member references, evidence references, supersession targets, artifact-link endpoints and version alignment, directionality, and finite weights. It returns `{ valid, errors, warnings, indexes }`. Optional `externalResolvers` allow future member types such as contexts, models, processes, and collections to be checked against their own ID sets.

Validation checks structure and cross-references. It does not establish whether a claim is true, whether a source is trustworthy, or whether a cluster is semantically appropriate.

## Corpus loader and integrated validation

The loader is implemented in `src/neural-artifact-corpus.js` and exported as `loadNeuralArtifactCorpus(options)`. It reads the canonical graph, source records, claims, evidence links, artifacts, and artifact links as one corpus, then invokes the reusable validator. On success it returns normalized collections, a validation report, the selected file paths, warnings, and lookup indexes for graph nodes, graph edges, artifacts, artifact versions, sources, claims, and evidence links.

The loader's `DEFAULT_FILES` can be overridden. Callers may set `rootDir`, provide `externalResolvers`, and use `throwOnError` to receive a `NeuralArtifactCorpusError` with a structured `.report`. Configured input paths are checked to remain within the selected root. By default, loading returns diagnostics instead of throwing, so callers can decide how to handle incomplete data.

## Bounded traversal and query foundation

`src/neural-artifact-traversal.js` exports `traverseNeuralArtifactCorpus(corpus, start, options)`. It begins from a typed reference—graph node, graph edge, source, claim, evidence link, or artifact—and returns reachable records plus shortest discovered paths with typed relationship steps. It can follow artifact membership, artifact-to-artifact links, and (when explicitly enabled) adjacent graph relationships.

Options include `maxDepth` (default 3), `maxResults` (default 100), `artifactDirection` (`out`, `in`, or `both`), and `includeGraphNeighbors` (default false). Cycles are bounded by a visited set; result limits report `truncated: true`. Each path step preserves relationship kind, link ID where available, member role, evidence references, artifact version, edge label, and weight. An unresolved starting reference returns a warning rather than inventing a result.

This is deterministic graph traversal, not semantic search, neural inference, automatic cluster discovery, or a truth-ranking system. The traversal currently uses the loaded in-memory snapshot and is not yet connected to the browser UI. Its path is an explanation of recorded links, not proof that a conclusion is correct.

## Status and limitations

- **Implemented:** typed artifact fixtures; reusable structural/reference validator; corpus loader with lookup indexes and root-path checks; bounded typed traversal with provenance-bearing paths and tests.
- **Partial/limited:** artifact direction filtering and graph-neighbor expansion are simple deterministic traversal features; they do not provide a full query language or ranking engine.
- **Planned:** browser UI integration, richer filters and query syntax, persisted indexes, semantic retrieval, automatic cluster proposals, and optional model-backed inference.
- **Unverified:** whether the model of artifact types and relationships fits all future domains; future extension types require their own schemas and resolvers.

All current graph/reference/artifact fixtures are synthetic demonstrations. The indexes are in-memory JavaScript Maps for a loaded snapshot, not a persistent database, vector index, or trained neural network. Treat source text and imported data as untrusted input, and keep errors, warnings, provenance, uncertainty, and synthetic-data labels visible.
