# Nexus-Contextual-Knowledge-Graph-Engine

A browser-based contextual knowledge graph application with a version-controlled graph archive and an evolving reference/evidence corpus.

## Repository data

- `data/canonical/graph.json`: canonical repository snapshot of the sample graph.
- `data/import-fixtures/`: format-specific fixtures for the current import UI.
- `data/references/`: source/work metadata, author and publisher attribution, structured claims, and evidence links.
- `schemas/reference-corpus.schema.json`: JSON Schema for reference/evidence record shapes.

The graph archive and reference corpus currently use explicitly synthetic demonstration data. They exercise schemas and relationships, not real-world factual assertions.

## Documentation

- [Graph archive and format policy](docs/graph-archive.md)
- [Graph data contract](docs/graph-data-contract.md)
- [Reference and evidence corpus](docs/reference-evidence-corpus.md)

## Validation

The repository uses Node.js built-in tests and GitHub Actions to check graph structure, import/export helper behavior, archive fixtures, and reference-corpus relationships.
