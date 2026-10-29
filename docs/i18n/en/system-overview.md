# System documentation — English

## Part A — Technical read-out

### System purpose and boundaries
Nexus Contextual Knowledge Graph Engine is being developed as a graph-centered environment for representing entities and relationships, preserving source/evidence context, validating imported graph data, and connecting larger regions of knowledge through higher-order artifacts. The repository currently contains a single-file HTML/React application plus supporting JavaScript validation modules, JSON fixtures, schemas, tests, and GitHub Actions automation.

### Core layers
1. **Canonical graph:** nodes and edges are the primary entity/relationship representation. Preserve IDs and attributes across supported import/export operations where possible.
2. **Graph validation and interchange:** structural validation, saved-state recovery, import modes, and format-specific fixtures/tests. CSV handling supports quoted fields, escaped quotes, and embedded newlines. The Cypher importer is a limited regex-based subset, not a complete Cypher parser.
3. **Reference and evidence corpus:** separate records for sources/works, people or organizations acting as authors/publishers, claims, and evidence links. Evidence can target nodes, edges, claims, or a directed node-edge-node path. A source, a claim, the stance of evidence, source reliability, and extraction confidence are distinct concepts.
4. **Higher-order neural artifact layer:** versioned artifacts can group typed references to graph nodes, edges, claims, sources, evidence links, contexts, and other artifacts. Artifact-to-artifact links describe typed relations such as contains, overlaps, contextualizes, contradicts, or depends_on. “Neural” currently describes a higher-order network modeling concept; it does not mean that a trained neural network or live inference pipeline is already implemented.
5. **Validation and automation:** Node.js tests and GitHub Actions provide automated checks for supported data contracts and fixtures.

### Provenance and uncertainty
Keep canonical object identity separate from artifact membership. Record provenance, version, derivation method, input snapshots, time/context scope, and evidence references where applicable. Similarity, relevance, edge weight, confidence, source reliability, evidence stance, and factual truth must not be collapsed into one score. Synthetic fixture data is for testing and is not a real-world citation.

### Current implementation status
Implemented in the current working branch: graph-data validation and tests; canonical archive/import fixtures and documentation; reference/evidence corpus schema, synthetic examples and integrity tests; neural artifact design, schema, synthetic examples, typed artifact links and integrity tests. The user-facing reference editor, artifact explorer/overlay, broad source ingestion, and actual neural/embedding inference remain future work. Check the branch’s current GitHub Actions status before asserting that the latest commit passes.

### Planned evolution
Prioritize loaders and cross-file integrity validation, then user-facing browsing/editing of references and artifacts, context-aware navigation, import/export/versioning, and only then optional clustering/embedding/model backends with recorded versions and reproducible inputs. Maintain backward-compatible schemas or explicitly version breaking changes.

## Part B — Plain-language guide

Nexus is a project for organizing information as connected pieces. A node represents something; an edge represents a relationship between things. The system is being extended so that sources and evidence can explain why a relationship is recorded, and larger groups of related items can be treated as reusable collections called artifacts.

For example, a collection could group a report, a topic, the connection between them, and the sources that discuss that connection. Collections can also connect to other collections. This helps people explore a large information space without copying the same facts everywhere.

The system is still being built. Some data checks, example records, schemas, and automated tests exist. A full visual editor for references and higher-level collections, automatic collection discovery, and real neural-network analysis are not yet complete. Examples marked synthetic are demonstrations, not proof of real-world facts.

When reading results, keep three questions separate: What does the record say? What source or evidence supports it? How certain are we that the interpretation is correct? The system should preserve disagreements and uncertainty instead of hiding them.