# Graph archive and format policy

## Purpose

Keep a reproducible, version-controlled snapshot of the graph database in the repository, alongside fixtures for every format the browser UI currently offers for ingestion.

## Authority and versions

- `data/canonical/graph.json` is the authoritative repository snapshot of the original seed graph.
- `data/import-fixtures/` contains format-specific import fixtures, not independent sources of truth.
- `data/manifest.json` records dataset identity, counts, format support, and known caveats.
- Changes to the graph should update the canonical snapshot, regenerate fixtures, and update the manifest in the same change.
- Historical snapshots should be additive and named with a date or release identifier; do not silently overwrite a historical release snapshot.

## Formats identified in the current UI

- JSON: import and export.
- CSV: import and export.
- Cypher: import and export.
- SVG: export only; it is a visualization, not a graph-database interchange format in the current UI.

The CSV importer currently uses naive comma splitting, so quoted fields containing commas, quotes, or newlines are not reliably supported. The Cypher importer uses regular expressions for a narrow subset of syntax and does not retain all properties such as edge weights. These are known implementation gaps, not reasons to claim full compatibility. The archive includes fixtures so the gaps can be tested and closed.

## Required validation

1. Parse each import fixture using the same parser code as the browser application.
2. Validate node IDs, edge IDs, and source/target references.
3. Compare imported graph semantics with the canonical graph, documenting any intentional loss.
4. Test CSV quoting, commas, embedded quotes, and line breaks.
5. Test Cypher strings containing apostrophes, node-variable mappings, relationship types, and numeric properties.
6. Treat structural validity separately from factual verification and provenance.

## Privacy and provenance

Only commit synthetic or explicitly approved data. Do not place private user data, credentials, API keys, or restricted records in the public repository. Preserve provenance and confidence metadata when available.
