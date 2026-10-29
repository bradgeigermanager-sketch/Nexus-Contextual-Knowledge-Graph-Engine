"use strict";

/**
 * Bounded, explainable traversal across the loaded graph/reference/artifact corpus.
 * This is deterministic graph traversal, not neural inference or ranking.
 */
const TYPE_ALIASES = Object.freeze({
  node: "graph_node",
  edge: "graph_edge",
  graph_node: "graph_node",
  graph_edge: "graph_edge",
  source: "source",
  claim: "claim",
  evidence_link: "evidence_link",
  artifact: "artifact"
});

function normalizeRef(ref) {
  if (!ref || typeof ref !== "object") throw new TypeError("start must be { refType, refId }");
  const refType = TYPE_ALIASES[ref.refType];
  if (!refType || typeof ref.refId !== "string" || !ref.refId.trim()) {
    throw new TypeError("start must use a supported refType and non-empty refId");
  }
  return { refType, refId: ref.refId };
}

function entityKey(ref) {
  return ref.refType + ":" + ref.refId;
}

function indexCorpus(corpus) {
  if (!corpus || !corpus.data || !corpus.indexes) {
    throw new TypeError("corpus must be returned by loadNeuralArtifactCorpus");
  }
  const data = corpus.data;
  const indexes = corpus.indexes;
  const entities = new Map();
  const add = (type, id, value) => {
    if (typeof id === "string") entities.set(type + ":" + id, { refType: type, refId: id, value });
  };
  for (const item of data.graph.nodes || []) add("graph_node", item.id, item);
  for (const item of data.graph.edges || []) add("graph_edge", item.id, item);
  for (const item of data.sources || []) add("source", item.sourceId, item);
  for (const item of data.claims || []) add("claim", item.claimId, item);
  for (const item of data.evidenceLinks || []) add("evidence_link", item.evidenceLinkId, item);
  for (const item of data.artifacts || []) add("artifact", item.artifactId, item);

  const membersByEntity = new Map();
  const artifactsByEntity = new Map();
  const addRelation = (map, key, relation) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(relation);
  };
  for (const artifact of data.artifacts || []) {
    const artifactRef = { refType: "artifact", refId: artifact.artifactId };
    for (const member of artifact.members || []) {
      const key = member.refType + ":" + member.refId;
      addRelation(artifactsByEntity, key, {
        kind: "artifact_membership", from: { refType: member.refType, refId: member.refId },
        to: artifactRef, role: member.role || null, rationale: member.rationale || null,
        artifactVersionId: artifact.versionId
      });
      addRelation(membersByEntity, entityKey(artifactRef), {
        kind: "artifact_member", from: artifactRef, to: { refType: member.refType, refId: member.refId },
        role: member.role || null, rationale: member.rationale || null,
        artifactVersionId: artifact.versionId
      });
    }
    for (const evidenceRef of artifact.evidenceRefs || []) {
      const to = { refType: "evidence_link", refId: evidenceRef };
      addRelation(membersByEntity, entityKey(artifactRef), {
        kind: "artifact_evidence_reference", from: artifactRef, to,
        artifactVersionId: artifact.versionId
      });
      addRelation(artifactsByEntity, entityKey(to), {
        kind: "artifact_evidence_reference", from: to, to: artifactRef,
        artifactVersionId: artifact.versionId
      });
    }
  }
  const links = data.artifactLinks || [];
  const artifactLinksByEntity = new Map();
  for (const link of links) {
    const from = { refType: "artifact", refId: link.sourceArtifactId };
    const to = { refType: "artifact", refId: link.targetArtifactId };
    addRelation(artifactLinksByEntity, entityKey(from), {
      kind: "artifact_link", from, to, relationType: link.relationType,
      linkId: link.linkId, directionality: link.directionality || "directed",
      weight: link.weight ?? null, evidenceRefs: link.evidenceRefs || [],
      sourceVersionId: link.sourceVersionId || null, targetVersionId: link.targetVersionId || null
    });
    if (link.directionality === "undirected") {
      addRelation(artifactLinksByEntity, entityKey(to), {
        kind: "artifact_link", from: to, to: from, relationType: link.relationType,
        linkId: link.linkId, directionality: "undirected", weight: link.weight ?? null,
        evidenceRefs: link.evidenceRefs || [], sourceVersionId: link.sourceVersionId || null,
        targetVersionId: link.targetVersionId || null
      });
    }
  }

  const graphRelations = new Map();
  const addGraphRelation = (key, relation) => addRelation(graphRelations, key, relation);
  for (const edge of data.graph.edges || []) {
    const source = { refType: "graph_node", refId: edge.source };
    const target = { refType: "graph_node", refId: edge.target };
    const edgeRef = { refType: "graph_edge", refId: edge.id };
    addGraphRelation(entityKey(source), { kind: "graph_edge_source", from: source, to: edgeRef, edgeLabel: edge.label || null });
    addGraphRelation(entityKey(edgeRef), { kind: "graph_edge_to_target", from: edgeRef, to: target, edgeLabel: edge.label || null });
    addGraphRelation(entityKey(target), { kind: "graph_edge_target", from: target, to: edgeRef, edgeLabel: edge.label || null });
    addGraphRelation(entityKey(edgeRef), { kind: "graph_edge_to_source", from: edgeRef, to: source, edgeLabel: edge.label || null });
  }

  return { data, indexes, entities, membersByEntity, artifactsByEntity, artifactLinksByEntity, graphRelations };
}

/**
 * Explore the connected corpus from a typed reference.
 * Options: maxDepth (default 3), maxResults (default 100), artifactDirection
 * ("out", "in", or "both", default "both"), includeGraphNeighbors (default false).
 * Each result contains a shortest discovered path; repeated entities are not requeued.
 */
function traverseNeuralArtifactCorpus(corpus, start, options = {}) {
  const normalizedStart = normalizeRef(start);
  const maxDepth = options.maxDepth === undefined ? 3 : options.maxDepth;
  const maxResults = options.maxResults === undefined ? 100 : options.maxResults;
  const direction = options.artifactDirection || "both";
  if (!Number.isInteger(maxDepth) || maxDepth < 0) throw new RangeError("maxDepth must be a non-negative integer");
  if (!Number.isInteger(maxResults) || maxResults < 1) throw new RangeError("maxResults must be a positive integer");
  if (!["out", "in", "both"].includes(direction)) throw new TypeError("artifactDirection must be out, in, or both");

  const index = indexCorpus(corpus);
  const startKey = entityKey(normalizedStart);
  if (!index.entities.has(startKey)) {
    return { start: normalizedStart, results: [], paths: [], truncated: false, warnings: ["start reference does not resolve: " + startKey] };
  }
  const queue = [{ ref: normalizedStart, depth: 0, path: [] }];
  const seen = new Set([startKey]);
  const results = [];
  const paths = [];
  let truncated = false;

  while (queue.length) {
    const current = queue.shift();
    const entity = index.entities.get(entityKey(current.ref));
    results.push({
      ref: current.ref,
      depth: current.depth,
      entity: entity ? entity.value : null,
      path: current.path
    });
    if (results.length >= maxResults && queue.length) {
      truncated = true;
      break;
    }
    if (current.depth >= maxDepth) continue;

    const key = entityKey(current.ref);
    const relations = [];
    relations.push(...(index.membersByEntity.get(key) || []));
    relations.push(...(index.artifactsByEntity.get(key) || []));
    if (current.ref.refType === "artifact") {
      relations.push(...(index.artifactLinksByEntity.get(key) || []));
    }
    if (index.artifactLinksByEntity.size && direction !== "both" && current.ref.refType === "artifact") {
      // For incoming-only traversal, remove the outgoing artifact-link records.
      if (direction === "in") relations.splice(0, relations.length,
        ...(index.membersByEntity.get(key) || []),
        ...(index.artifactsByEntity.get(key) || []));
    }
    if (current.ref.refType === "artifact" && direction !== "out") {
      for (const [otherKey, otherRelations] of index.artifactLinksByEntity.entries()) {
        if (otherRelations.some((rel) => rel.to && entityKey(rel.to) === key)) {
          for (const rel of otherRelations.filter((item) => item.to && entityKey(item.to) === key)) {
            relations.push({ ...rel, from: current.ref, to: { refType: "artifact", refId: otherKey.slice("artifact:".length) } });
          }
        }
      }
    }
    if (options.includeGraphNeighbors && ["graph_node", "graph_edge"].includes(current.ref.refType)) {
      relations.push(...(index.graphRelations.get(key) || []));
    }

    for (const relation of relations) {
      const next = relation.to;
      if (!next) continue;
      const nextKey = entityKey(next);
      if (seen.has(nextKey) || !index.entities.has(nextKey)) continue;
      seen.add(nextKey);
      const nextPath = current.path.concat([{
        relation: {
          kind: relation.kind,
          relationType: relation.relationType || null,
          role: relation.role || null,
          linkId: relation.linkId || null,
          evidenceRefs: relation.evidenceRefs || [],
          artifactVersionId: relation.artifactVersionId || null,
          edgeLabel: relation.edgeLabel || null,
          weight: relation.weight ?? null
        },
        from: current.ref,
        to: next
      }]);
      paths.push({ from: normalizedStart, to: next, depth: current.depth + 1, steps: nextPath });
      queue.push({ ref: next, depth: current.depth + 1, path: nextPath });
    }
  }

  return {
    start: normalizedStart,
    results,
    paths,
    truncated,
    warnings: corpus.valid ? [] : ["corpus contains load or validation errors; traversal may be incomplete"]
  };
}

module.exports = { traverseNeuralArtifactCorpus };
