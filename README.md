# Nexus-Contextual-Knowledge-Graph-Engine

A browser-based contextual knowledge graph application with a version-controlled graph archive and an evolving reference/evidence corpus.

## Repository data

- `data/canonical/graph.json`: canonical repository snapshot of the sample graph.
- `data/import-fixtures/`: format-specific fixtures for the current import UI.
- `data/references/`: source/work metadata, author and publisher attribution, structured claims, and evidence links.
- `schemas/reference-corpus.schema.json`: JSON Schema for reference/evidence record shapes.
- `data/artifacts/`: higher-order network artifacts that group and connect typed graph/corpus objects.
- `schemas/neural-artifact.schema.json`: schema for artifact records and artifact-to-artifact links.

The graph archive and reference corpus currently use explicitly synthetic demonstration data. They exercise schemas and relationships, not real-world factual assertions.

## Documentation

- [Graph archive and format policy](docs/graph-archive.md)
- [Graph data contract](docs/graph-data-contract.md)
- [Reference and evidence corpus](docs/reference-evidence-corpus.md)

## Validation

The repository uses Node.js built-in tests and GitHub Actions to check graph structure, import/export helper behavior, archive fixtures, and reference-corpus relationships.

## Multilingual system documentation

The maintained documentation set provides a technical read-out and a plain-language guide in 13 languages: Arabic, English, Polish, German, French, Indonesian, Hindi, Simplified Chinese, Russian, Swahili, Greek, Japanese, and Spanish.

- [Documentation index](docs/system-documentation.md)
- [Documentation maintenance policy](docs/documentation-maintenance.md)
- [Language manifest](docs/documentation-manifest.json)

Each language has its own file under `docs/i18n/`. English is the terminology-control version; translations should be updated together whenever implementation status or system concepts change. The documentation distinguishes current implementation from planned work and labels synthetic examples as demonstrations rather than real-world evidence.

- [Neural Network Artifact Layer design](docs/neural-artifact-layer.md)

The automated Node.js test suite also checks multilingual documentation completeness against `docs/documentation-manifest.json`.