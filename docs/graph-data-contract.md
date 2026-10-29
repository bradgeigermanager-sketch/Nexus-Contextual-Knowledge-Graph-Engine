# Graph data contract

This contract describes structural requirements for Nexus graph records. Passing validation does **not** establish that a claim, source, or relationship is true.

## Nodes

A node must be a JSON object with:

- `id`: non-empty string, unique among nodes.
- `label`: non-empty string.
- `val`: optional finite, non-negative number.

Other properties (for example `type`, `color`, `desc`, and `metrics`) may be present and are preserved by consumers.

## Edges

An edge must be a JSON object with:

- `id`: non-empty string, unique among edges.
- `source`: non-empty string matching an existing node ID.
- `target`: non-empty string matching an existing node ID.
- `weight`: optional finite number from 0 through 1 inclusive.

Other properties such as `label` may be present.

Node IDs and edge IDs have separate uniqueness scopes. Self-edges and cycles are allowed by this initial contract; applications may impose stricter domain-specific rules later.

## Import and persistence requirements

1. Parse untrusted JSON inside error handling.
2. Validate the full candidate graph before replacing active graph state.
3. Reject duplicate IDs and edges with missing endpoints.
4. Do not silently coerce strings, nulls, NaN-like values, or out-of-range weights.
5. If persisted data is malformed, retain or restore a known-good fallback and surface a user-visible warning.
6. Preserve original imported fields unless a documented migration explicitly changes them.

## Evidence and provenance

Structural validation is separate from epistemic assessment. Later provenance work should record source identifiers, retrieval timestamps, transformation history, attribution, evidence status, and reviewer decisions without treating graph connectivity or a numeric weight as proof of truth.
