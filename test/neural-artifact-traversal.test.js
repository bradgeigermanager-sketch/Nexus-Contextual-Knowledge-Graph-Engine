"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadNeuralArtifactCorpus } = require("../src/neural-artifact-corpus");
const { traverseNeuralArtifactCorpus } = require("../src/neural-artifact-traversal");

const corpus = () => loadNeuralArtifactCorpus({ rootDir: path.join(__dirname, "..") });

test("traversal starts from a graph node and reaches its containing artifact with provenance", () => {
  const result = traverseNeuralArtifactCorpus(corpus(), { refType: "graph_node", refId: "n2" }, { maxDepth: 2 });
  assert.equal(result.warnings.length, 0);
  assert.ok(result.results.some((item) => item.ref.refType === "artifact" && item.ref.refId === "artifact-topic-region-example"));
  assert.ok(result.paths.some((item) => item.steps.some((step) => step.relation.kind === "artifact_membership")));
});

test("traversal follows artifact links and members without treating membership as evidence", () => {
  const result = traverseNeuralArtifactCorpus(corpus(), { refType: "artifact", refId: "artifact-topic-region-example" }, { maxDepth: 2 });
  assert.ok(result.results.some((item) => item.ref.refId === "artifact-evidence-bundle-example"));
  assert.ok(result.paths.some((item) => item.steps.some((step) => step.relation.linkId === "artifact-link-region-bundle-example")));
  assert.ok(result.results.some((item) => item.ref.refType === "evidence_link"));
});

test("traversal bounds depth and result count and reports truncation", () => {
  const data = corpus();
  const shallow = traverseNeuralArtifactCorpus(data, { refType: "artifact", refId: "artifact-topic-region-example" }, { maxDepth: 0 });
  assert.equal(shallow.results.length, 1);
  const bounded = traverseNeuralArtifactCorpus(data, { refType: "artifact", refId: "artifact-topic-region-example" }, { maxDepth: 5, maxResults: 2 });
  assert.equal(bounded.results.length, 2);
  assert.equal(bounded.truncated, true);
});

test("traversal returns a warning for an unresolved start and rejects invalid limits", () => {
  const data = corpus();
  const missing = traverseNeuralArtifactCorpus(data, { refType: "graph_node", refId: "missing-node" });
  assert.equal(missing.results.length, 0);
  assert.match(missing.warnings[0], /does not resolve/);
  assert.throws(() => traverseNeuralArtifactCorpus(data, { refType: "graph_node", refId: "n2" }, { maxDepth: -1 }), /maxDepth/);
  assert.throws(() => traverseNeuralArtifactCorpus(data, { refType: "graph_node", refId: "n2" }, { artifactDirection: "sideways" }), /artifactDirection/);
});
