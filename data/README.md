# Graph dataset archive

This directory stores version-controlled copies of the Nexus CKG Engine's original synthetic seed graph and import-format fixtures.

- `canonical/graph.json`: canonical snapshot preserving the original node and edge fields.
- `import-fixtures/graph.json`: JSON graph payload for the application's JSON importer.
- `import-fixtures/graph.csv`: CSV fixture with separate node and edge sections.
- `import-fixtures/graph.cypher`: limited Cypher-style fixture for the application's simple pattern parser.
- `manifest.json`: inventory, counts, and known compatibility caveats.

The application currently exposes JSON, CSV, and Cypher ingestion. SVG is an export-only format in the current UI, so it is not listed as an import fixture. These fixtures are not yet proof of lossless round-trip support: the current CSV parser splits on commas without respecting CSV quoting, and the Cypher parser does not preserve every property (including edge weights). The import parser should be hardened and tested before these fixtures are described as round-trip compatible.

The seed graph is synthetic demonstration data. It should not be treated as a verified knowledge base or as evidence that its descriptions are factually correct.
