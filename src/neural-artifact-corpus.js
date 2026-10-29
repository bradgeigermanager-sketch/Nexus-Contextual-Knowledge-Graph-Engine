"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { validateNeuralArtifactCorpus } = require("./neural-artifact-validation");

const DEFAULT_FILES = Object.freeze({
  graph: "data/canonical/graph.json",
  sources: "data/references/sources.json",
  claims: "data/references/claims.json",
  evidenceLinks: "data/references/evidence-links.json",
  artifacts: "data/artifacts/artifacts.json",
  artifactLinks: "data/artifacts/artifact-links.json"
});

function readJson(rootDir, relativePath, errors) {
  const absolutePath = path.resolve(rootDir, relativePath);
  const allowedRoot = path.resolve(rootDir) + path.sep;
  if (!absolutePath.startsWith(allowedRoot)) {
    errors.push("input path escapes the configured root: " + relativePath);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    errors.push("could not load " + relativePath + ": " + error.message);
    return null;
  }
}

function unwrapCollection(document, property, relativePath, errors) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    errors.push(relativePath + " must contain a JSON object");
    return [];
  }
  if (!Array.isArray(document[property])) {
    errors.push(relativePath + " must contain an array named " + property);
    return [];
  }
  return document[property];
}

/**
 * Load all current graph, reference, evidence, and artifact files as one corpus.
 *
 * Options:
 *   rootDir: repository root (defaults to process.cwd())
 *   files: optional map overriding relative input paths
 *   externalResolvers: optional map of future member types to Sets/arrays of IDs
 *   throwOnError: throw an Error if any load or validation error occurs
 *
 * The returned object includes the normalized input collections, validation
 * report, and indexes. Validation checks structure and references, not truth.
 */
function loadNeuralArtifactCorpus(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const files = { ...DEFAULT_FILES, ...(options.files || {}) };
  const loadErrors = [];

  const documents = {};
  for (const [key, relativePath] of Object.entries(files)) {
    documents[key] = readJson(rootDir, relativePath, loadErrors);
  }

  const graphDoc = documents.graph;
  const input = {
    graph: graphDoc && typeof graphDoc === "object" && !Array.isArray(graphDoc)
      ? { nodes: graphDoc.nodes, edges: graphDoc.edges }
      : {},
    sources: unwrapCollection(documents.sources, "sources", files.sources, loadErrors),
    claims: unwrapCollection(documents.claims, "claims", files.claims, loadErrors),
    evidenceLinks: unwrapCollection(documents.evidenceLinks, "evidenceLinks", files.evidenceLinks, loadErrors),
    artifacts: unwrapCollection(documents.artifacts, "artifacts", files.artifacts, loadErrors),
    artifactLinks: unwrapCollection(documents.artifactLinks, "links", files.artifactLinks, loadErrors),
    externalResolvers: options.externalResolvers || {}
  };

  if (!graphDoc || typeof graphDoc !== "object" || Array.isArray(graphDoc)) {
    loadErrors.push(files.graph + " must contain a JSON object");
  }

  const validation = validateNeuralArtifactCorpus(input);
  const errors = [...loadErrors, ...validation.errors];
  const result = {
    valid: errors.length === 0,
    errors,
    warnings: validation.warnings,
    data: input,
    indexes: validation.indexes,
    files: { ...files }
  };

  if (options.throwOnError && !result.valid) {
    const error = new Error("Neural artifact corpus failed validation:\n" + errors.join("\n"));
    error.name = "NeuralArtifactCorpusError";
    error.report = result;
    throw error;
  }
  return result;
}

module.exports = { DEFAULT_FILES, loadNeuralArtifactCorpus };
