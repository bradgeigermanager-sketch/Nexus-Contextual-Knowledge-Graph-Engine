"use strict";

const KNOWN_MEMBER_TYPES = new Set([
  "graph_node", "graph_edge", "source", "claim", "evidence_link", "artifact"
]);

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const idSet = (items, field, label, errors) => {
  const ids = new Set();
  for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
    const id = item && item[field];
    if (typeof id !== "string" || id.trim() === "") {
      errors.push(label + "[" + index + "] has no valid " + field);
    } else if (ids.has(id)) {
      errors.push("duplicate " + label + " identifier: " + id);
    } else {
      ids.add(id);
    }
  }
  return ids;
};

/**
 * Validate the higher-order artifact corpus against graph and evidence records.
 * This checks structure and cross-references; it does not establish factual truth.
 *
 * Input fields: graph, sources, claims, evidenceLinks, artifacts, artifactLinks,
 * and optional externalResolvers. An external resolver maps a future member
 * type (such as context, model, process, or collection) to a Set or array of IDs.
 *
 * Output: { valid, errors, warnings, indexes }
 */
function validateNeuralArtifactCorpus(input = {}) {
  const errors = [];
  const warnings = [];
  const graph = input.graph || {};
  const sources = input.sources || [];
  const claims = input.claims || [];
  const evidenceLinks = input.evidenceLinks || [];
  const artifacts = input.artifacts || [];
  const artifactLinks = input.artifactLinks || [];
  const externalResolvers = input.externalResolvers || {};

  if (!Array.isArray(graph.nodes)) errors.push("graph.nodes must be an array");
  if (!Array.isArray(graph.edges)) errors.push("graph.edges must be an array");
  for (const [name, value] of Object.entries({ sources, claims, evidenceLinks, artifacts, artifactLinks })) {
    if (!Array.isArray(value)) errors.push(name + " must be an array");
  }
  if (errors.length) return { valid: false, errors, warnings, indexes: null };

  const nodeIds = idSet(graph.nodes, "id", "graph node", errors);
  const edgeIds = idSet(graph.edges, "id", "graph edge", errors);
  const sourceIds = idSet(sources, "sourceId", "source", errors);
  const claimIds = idSet(claims, "claimId", "claim", errors);
  const evidenceIds = idSet(evidenceLinks, "evidenceLinkId", "evidence link", errors);
  const artifactIds = idSet(artifacts, "artifactId", "artifact", errors);
  const versionIds = idSet(artifacts, "versionId", "artifact version", errors);
  const artifactLinkIds = idSet(artifactLinks, "linkId", "artifact link", errors);

  const nodesById = new Map(graph.nodes.map((item) => [item.id, item]));
  const edgesById = new Map(graph.edges.map((item) => [item.id, item]));
  const artifactsById = new Map(artifacts.map((item) => [item.artifactId, item]));
  const artifactsByVersion = new Map(artifacts.map((item) => [item.versionId, item]));
  const resolvers = {
    graph_node: nodeIds,
    graph_edge: edgeIds,
    source: sourceIds,
    claim: claimIds,
    evidence_link: evidenceIds,
    artifact: artifactIds
  };

  for (const [type, ids] of Object.entries(externalResolvers)) {
    if (ids instanceof Set) resolvers[type] = ids;
    else if (Array.isArray(ids)) resolvers[type] = new Set(ids);
    else warnings.push("external resolver for " + type + " must be a Set or array");
  }

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.source)) errors.push("edge " + edge.id + " references missing source node " + edge.source);
    if (!nodeIds.has(edge.target)) errors.push("edge " + edge.id + " references missing target node " + edge.target);
  }

  for (const artifact of artifacts) {
    if (!Array.isArray(artifact.members)) {
      errors.push("artifact " + artifact.artifactId + " members must be an array");
      continue;
    }
    if (artifact.evidenceRefs !== undefined && !Array.isArray(artifact.evidenceRefs)) {
      errors.push("artifact " + artifact.artifactId + " evidenceRefs must be an array");
    }
    for (const member of artifact.members) {
      if (!isRecord(member) || typeof member.refType !== "string" || typeof member.refId !== "string") {
        errors.push("artifact " + artifact.artifactId + " has an invalid member reference");
        continue;
      }
      const resolver = resolvers[member.refType];
      if (resolver) {
        if (!resolver.has(member.refId)) {
          errors.push("artifact " + artifact.artifactId + " member does not resolve: " + member.refType + ":" + member.refId);
        }
      } else if (KNOWN_MEMBER_TYPES.has(member.refType)) {
        errors.push("no resolver available for member type " + member.refType);
      } else {
        warnings.push("unresolved extension member type " + member.refType + " on artifact " + artifact.artifactId);
      }
    }
    for (const evidenceRef of artifact.evidenceRefs || []) {
      if (!evidenceIds.has(evidenceRef)) errors.push("artifact " + artifact.artifactId + " references missing evidence link " + evidenceRef);
    }
    for (const supersededId of artifact.supersedes || []) {
      if (!artifactIds.has(supersededId)) errors.push("artifact " + artifact.artifactId + " supersedes missing artifact " + supersededId);
    }
  }

  for (const link of artifactLinks) {
    const sourceArtifact = artifactsById.get(link.sourceArtifactId);
    const targetArtifact = artifactsById.get(link.targetArtifactId);
    if (!sourceArtifact) errors.push("artifact link " + link.linkId + " has missing source artifact " + link.sourceArtifactId);
    if (!targetArtifact) errors.push("artifact link " + link.linkId + " has missing target artifact " + link.targetArtifactId);
    if (!["directed", "undirected"].includes(link.directionality)) {
      errors.push("artifact link " + link.linkId + " has invalid directionality");
    }
    if (link.sourceVersionId && sourceArtifact && sourceArtifact.versionId !== link.sourceVersionId) {
      errors.push("artifact link " + link.linkId + " source version does not match artifact");
    }
    if (link.targetVersionId && targetArtifact && targetArtifact.versionId !== link.targetVersionId) {
      errors.push("artifact link " + link.linkId + " target version does not match artifact");
    }
    if (link.weight !== undefined && link.weight !== null &&
        (typeof link.weight !== "number" || !Number.isFinite(link.weight))) {
      errors.push("artifact link " + link.linkId + " weight must be a finite number or null");
    }
    for (const evidenceRef of link.evidenceRefs || []) {
      if (!evidenceIds.has(evidenceRef)) errors.push("artifact link " + link.linkId + " references missing evidence link " + evidenceRef);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    indexes: {
      nodesById,
      edgesById,
      artifactsById,
      artifactsByVersion,
      sourcesById: new Map(sources.map((item) => [item.sourceId, item])),
      claimsById: new Map(claims.map((item) => [item.claimId, item])),
      evidenceLinksById: new Map(evidenceLinks.map((item) => [item.evidenceLinkId, item]))
    }
  };
}

module.exports = { validateNeuralArtifactCorpus };
