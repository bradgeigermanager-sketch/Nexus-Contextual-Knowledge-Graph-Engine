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

### Artifact definition

- artifactId: stable conceptual ID.
- versionId: immutable version ID.
- artifactType: controlled type, such as subgraph, context_bundle, evidence_bundle, topic_cluster, process_model, feature_set, embedding, model_output, rule_set, temporal_slice, spatial_region, or composite.
- label, description, status: human-readable identity and lifecycle.
- members: typed references to graph and corpus objects, each with role and optional weight/rationale.
- context: scope, assumptions, time/place bounds, classification, and inclusion/exclusion criteria.
- features: optional typed features; numeric values are not automatically factual.
- derivation: origin, algorithm/model, parameters, input versions, run ID, and timestamp.
- evidenceRefs: pointers to evidence links, claims, or source records relevant to the artifact.
- supersedes, createdAt, createdBy, synthetic.

### Artifact-to-artifact links

Use a separate relation record with linkId, sourceArtifactId/version, targetArtifactId/version, relationType, directionality, optional weight, valid time, context, evidence references, rationale, and provenance.

Relation vocabulary can include structural relations (contains, part_of, overlaps, adjacent_to), semantic relations (related_to, similar_to, contrasts_with, analogous_to), evidentiary relations (supports, contradicts, contextualizes, derived_from), procedural relations (depends_on, precedes, produces, consumes), and spatial/temporal relations (within_region, co_located_with, overlaps_in_time). Keep similarity distinct from evidentiary support.

## Example use cases

1. Source-connected knowledge region: a topic cluster contains a selected subgraph and links to sources, claims, and evidence passages.
2. Context-sensitive edge interpretation: one canonical edge is referenced by two context artifacts with different periods, jurisdictions, or operating conditions.
3. Cross-repository synthesis: artifacts from multiple repositories connect through typed links and provenance without being collapsed into an undifferentiated node.
4. Process-to-evidence map: a process model connects inputs, steps, outputs, dependencies, and sources supporting each step.
5. Alternative hypothesis comparison: competing artifacts expose shared and differing members, assumptions, evidence, and exclusions.
6. Model-generated clusters: an algorithm proposes a cluster, records feature/embedding versions and parameters, and marks it proposed until reviewed.

## Integrity checks

- Every member reference resolves to an object in its declared domain and declared snapshot.
- Every artifact link resolves to existing artifact IDs and versions.
- Weights and similarity values use explicit named fields, finite numeric values, and documented ranges.
- Detect cycles where acyclic composition is required; permit cycles only for relation types where they are meaningful.
- Derived artifacts record input graph/corpus snapshots and derivation details.
- Evidence references resolve and remain distinct from the artifact's own status.
- Large recursive traversals have depth and size limits.
- Schema validity, structural validity, semantic plausibility, and factual verification are separate stages.

## Suggested implementation sequence

1. Keep the first layer in versioned JSON with typed references and automated integrity tests.
2. Add a loader that indexes artifacts and resolves member references against graph and reference-corpus records.
3. Add UI overlays for membership, subgraph expansion/collapse, artifact navigation, and context filters.
4. Add deterministic cluster/rule generation with recorded inputs and reproducible parameters.
5. Add optional embeddings or learned models behind an interface. Preserve model name/version, vector dimensions, normalization, distance metric, input provenance, and uncertainty. Do not make the core graph depend on a particular ML framework.
6. If scale requires it, move records into SQL while retaining portable versioned JSON exports.

## Repository layout

- data/artifacts/manifest.json
- data/artifacts/artifacts.json
- data/artifacts/artifact-links.json
- schemas/neural-artifact.schema.json
- test/neural-artifact.test.js

This layer sits alongside the primary graph and reference corpus; it replaces neither.