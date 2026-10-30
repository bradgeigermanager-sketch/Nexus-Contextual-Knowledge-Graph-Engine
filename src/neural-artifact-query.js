"use strict";

const { traverseNeuralArtifactCorpus } = require("./neural-artifact-traversal");

const REF_TYPES = new Set(["graph_node", "graph_edge", "source", "claim", "evidence_link", "artifact"]);
const REF_ALIASES = Object.freeze({ node: "graph_node", edge: "graph_edge" });

function normalizeRef(ref, label) {
  if (!ref || typeof ref !== "object") throw new TypeError(label + " must be a { refType, refId } reference");
  const refType = REF_ALIASES[ref.refType] || ref.refType;
  if (!REF_TYPES.has(refType) || typeof ref.refId !== "string" || !ref.refId.trim()) {
    throw new TypeError(label + " must use a supported refType and non-empty refId");
  }
  return { refType, refId: ref.refId };
}

function key(ref) {
  return ref.refType + ":" + ref.refId;
}

function recordMatches(result, query) {
  const record = result.entity || {};
  if (query.refTypes && !query.refTypes.includes(result.ref.refType)) return false;
  if (result.ref.refType === "artifact") {
    if (query.artifactTypes && !query.artifactTypes.includes(record.artifactType)) return false;
    if (query.statuses && !query.statuses.includes(record.status)) return false;
    const domain = record.context && record.context.domain;
    if (query.contextDomains && !query.contextDomains.includes(domain)) return false;
  } else {
    if (query.statuses) {
      const status = record.status || (record.verification && record.verification.status);
      if (!query.statuses.includes(status)) return false;
    }
  }
  return true;
}

function pathMatches(path, query) {
  for (const step of path.steps) {
    const relation = step.relation || {};
    if (query.relationKinds && !query.relationKinds.includes(relation.kind)) return false;
    if (query.relationTypes && !query.relationTypes.includes(relation.relationType)) return false;
  }
  return true;
}

/**
 * Query the loaded corpus by a starting reference and optional target/filters.
 *
 * This is a deterministic query wrapper around bounded traversal. Filters are
 * applied to the discovered records and paths; they do not change which paths
 * traversal explores. Returned paths are discovered shortest paths, not all
 * possible paths. This function does not score truth or semantic similarity.
 */
function queryNeuralArtifactCorpus(corpus, query = {}) {
  const start = normalizeRef(query.start, "start");
  const target = query.target == null ? null : normalizeRef(query.target, "target");
  const allowedArrays = ["refTypes", "artifactTypes", "statuses", "contextDomains", "relationKinds", "relationTypes"];
  for (const name of allowedArrays) {
    if (query[name] !== undefined && (!Array.isArray(query[name]) || query[name].some((item) => typeof item !== "string"))) {
      throw new TypeError(name + " must be an array of strings");
    }
  }

  const traversal = traverseNeuralArtifactCorpus(corpus, start, {
    maxDepth: query.maxDepth,
    maxResults: query.maxResults,
    artifactDirection: query.artifactDirection,
    includeGraphNeighbors: query.includeGraphNeighbors
  });
  const matches = traversal.results.filter((item) => recordMatches(item, query));
  const targetKey = target ? key(target) : null;
  const targetResult = targetKey ? traversal.results.find((item) => key(item.ref) === targetKey) : null;
  const matchingPaths = traversal.paths.filter((item) => {
    if (targetKey && key(item.to) !== targetKey) return false;
    if (query.maxDepth !== undefined && item.depth > query.maxDepth) return false;
    return pathMatches(item, query);
  });
  const targetReached = target ? Boolean(targetResult) : null;
  const targetMatched = target ? matchingPaths.length > 0 : null;
  const warnings = [...traversal.warnings];
  if (target && !targetReached) warnings.push("target reference was not reached within the traversal limits: " + targetKey);
  else if (target && !targetMatched) warnings.push("target was reached, but no discovered path satisfied the requested relationship filters");

  return {
    start,
    target,
    matches,
    paths: matchingPaths,
    targetReached,
    targetMatched,
    truncated: traversal.truncated,
    incomplete: traversal.truncated || !corpus.valid,
    warnings,
    appliedFilters: Object.fromEntries(allowedArrays.filter((name) => query[name] !== undefined).map((name) => [name, query[name]])),
    limitations: [
      "Filters are applied after bounded traversal and do not constrain exploration.",
      "Only the shortest discovered path per reached reference is returned; alternative paths may be omitted.",
      "Results describe recorded structure and do not establish factual truth or semantic relevance."
    ]
  };
}

module.exports = { queryNeuralArtifactCorpus };
