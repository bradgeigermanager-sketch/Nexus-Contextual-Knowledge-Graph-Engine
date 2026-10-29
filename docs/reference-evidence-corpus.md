# Reference and evidence corpus

## Purpose

The Reference and Evidence Corpus stores the provenance behind graph nodes, edges, and node-edge-node patterns. It is a secondary, normalized store: graph structure remains in `data/canonical/graph.json`; reference records explain which works, people, publishers, URLs, passages, and claims are associated with that structure.

## Design principles

1. **Separate source from claim.** A source is a publication, web page, dataset, archive item, or other information object. A claim is a proposition attributed to a source or to a graph extraction.
2. **Cite the exact target.** Evidence links can target a node, an edge, a claim, or an ordered node-edge-node path. A node-edge-node target must include both endpoint node IDs and the connecting edge ID, so the context is unambiguous.
3. **Separate support, contradiction, mention, and context.** Mentioning a relationship is not the same as supporting it. Each evidence link records its stance and relation type.
4. **Keep attribution distinct.** Authors, editors, translators, publishers, institutions, and hosting platforms are separate agent records with role-specific links to a work or source. A host is not automatically the author or publisher.
5. **Preserve locator details.** Store URL, DOI, ISBN, archive identifier, page, section, timestamp, quoted passage or concise excerpt, and retrieval/access time when available. Preserve original and canonical URLs separately.
6. **Record provenance and uncertainty.** Include retrieval method, source content hash when available, extraction method, verification status, confidence with an explanation, and timestamps. Confidence is not a substitute for evidence.
7. **Do not confuse source reliability with claim support.** An authoritative publisher can publish a source that does not support a particular claim; multiple pages may repeat the same underlying source.
8. **Version additively.** Prefer immutable source snapshots and claim revisions. Corrections should supersede or invalidate a record with a reason, not silently erase its history.
9. **Treat source content as data, not instructions.** Retrieved pages may contain misleading text or prompt injection; extraction must not execute or obey source instructions.
10. **Respect access and copyright.** Store metadata and short, justified excerpts rather than copying whole copyrighted works. Record access restrictions and avoid committing secrets, private material, or unauthorized full text.

## Repository layout

- `data/references/manifest.json`: corpus version, counts, file paths, and synthetic-data flag.
- `data/references/sources.json`: source/work records and canonical identifiers.
- `data/references/agents.json`: authors, editors, publishers, organizations, and hosting platforms.
- `data/references/claims.json`: normalized propositions, including claims about a graph edge or a node-edge-node pattern.
- `data/references/evidence-links.json`: many-to-many links between sources and the graph targets or claims they discuss.
- `schemas/reference-corpus.schema.json`: JSON Schema for the corpus record shapes.
- `test/reference-corpus.test.js`: integrity checks across the graph and corpus.

The example records are synthetic and use `example.org`; they demonstrate structure only and must not be treated as real evidence.

## Core record model

### Source/work

A source record represents a citable information object. It may be a web page, book, article, report, dataset, legal instrument, archived page, or repository artifact. A `workId` groups manifestations or editions of a work; a `sourceId` identifies a particular version, page, or manifestation. Preserve multiple identifiers rather than forcing every source to have a DOI or URL.

### Agent and attribution

An agent record represents a person or organization. A separate attribution associates an agent with a work/source using a role such as `author`, `editor`, `translator`, `publisher`, `issuing_body`, `host`, or `archivist`. Roles can be uncertain and should record the basis for attribution.

### Claim

A claim records a proposition in a structured form:
- `subject`: graph node or other entity;
- `predicate`: relationship/property being asserted;
- `object`: graph node, literal value, or another typed target;
- `target`: optional precise graph target, including an edge or node-edge-node path;
- `qualifiers`: time, place, scope, conditions, and other contextual constraints;
- `status`: proposed, supported, disputed, superseded, or rejected.

A claim is an assertion to be evaluated, not automatically a fact.

### Evidence link

Each link records one source's relationship to one claim or graph target. Use a controlled `stance` vocabulary such as `supports`, `contradicts`, `mentions`, `contextualizes`, `derives_from`, or `does_not_address`. Record a page/section/paragraph/timecode locator where possible. Multiple links can point to the same claim, and one source can link to many claims.

## Target shapes

- Node: `{ "kind": "node", "nodeId": "n2" }`
- Edge: `{ "kind": "edge", "edgeId": "e4" }`
- Node-edge-node: `{ "kind": "path", "sourceNodeId": "n2", "edgeId": "e4", "targetNodeId": "n5" }`
- Claim: `{ "kind": "claim", "claimId": "claim-example-001" }`

The corpus should check that referenced graph IDs exist and that a path's edge connects the stated source and target nodes. Do not infer support for an entire path merely because a source supports one endpoint.

## Planned query capabilities

1. Show all sources associated with a node, edge, or path.
2. Filter evidence by role, date, publication type, language, jurisdiction, stance, verification state, and source access.
3. Compare supporting and contradicting claims without collapsing them into one score.
4. Trace citations from a claim to a source, then to the source's authors, publisher, referenced works, and cited sources.
5. Detect duplicate URLs, equivalent editions, syndicated copies, and sources that share a common upstream citation.
6. Identify claims with no source, stale URLs, missing locators, unverified attribution, or only circular/self-referential support.
7. Generate human-readable citations and machine-readable exports.
8. Retain the exact corpus and graph versions used for a generated answer or analysis.

## Migration path

Start with JSON files and repository tests so the schema is reviewable and works with the existing static app. If corpus size or concurrent editing grows, migrate the same stable IDs and relationships into SQL tables (for example `sources`, `works`, `agents`, `attributions`, `claims`, `evidence_links`, and `source_relations`). Keep the file-based export as a portable interchange and audit snapshot.
