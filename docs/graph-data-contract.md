# Graph data contract

This contract describes structural requirements for Nexus graph records. Passing validation does **not** establish that a claim, source, or relationship is true.

## Nodes
A node must be a JSON object with a unique, non-empty string `id`, a non-empty string `label`, and an optional finite non-negative numeric `val`. Other properties are allowed and should be preserved.

## Edges
An edge must be a JSON object with a unique, non-empty string `id`, `source` and `target` values that reference existing node IDs, and an optional finite numeric `weight` between 0 and 1 inclusive. Node and edge IDs have separate uniqueness scopes. Self-edges and cycles are allowed.

## Import and persistence requirements
1. Parse input inside error handling.
2. Validate the full candidate graph before changing active state; support both merge and explicit replace modes.
3. Reject duplicate IDs and edges with missing endpoints.
4. Do not silently coerce invalid weights or values.
5. Recover from malformed saved graph JSON by using known-good seed data and log a warning.
6. Provide a merge mode for additive imports and a replace mode for full snapshots; validate the complete candidate before committing either operation.
6. Do not persist a graph state that fails structural validation.
7. Preserve original fields where the format supports them; document format-specific losses.

## CSV
CSV fields use quoted-field escaping for commas, double quotes, and embedded line breaks. The UI's node section and edge section are separated by a standalone `---edges---` line. Node columns include `id,label,type`; optional supported columns include `val,color,desc,metrics_json`. Edge columns include `source,target,label,weight`; an optional `id` column preserves edge IDs.

## Evidence and provenance
Structural validation is separate from epistemic assessment. Later provenance work should record source identifiers, retrieval timestamps, transformation history, attribution, evidence status, and reviewer decisions without treating graph connectivity or a numeric weight as proof of truth.
