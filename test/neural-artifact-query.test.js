"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadNeuralArtifactCorpus } = require("../src/neural-artifact-corpus");
const { queryNeuralArtifactCorpus } = require("../src/neural-artifact-query");

const corpus = () => loadNeuralArtifactCorpus({ rootDir: path.join(__dirname, "..") });

test("query can target an artifact and preserve a typed relationship path", () => {
  const result = queryNeuralArtifactCorpus(corpus(), {
    start: { refType: "graph_node", refId: "n2" },
    target: { refType: "artifact", refId: "artifact-topic-region-example" },
    maxDepth: 2
  });
  assert.equal(result.targetReached, true);
  assert.equal(result.targetMatched, true);
  assert.ok(result.paths.some((p) => p.steps.some((step) => step.relation.kind === "artifact_membership")));
  assert.equal(result.incomplete, false);
});

test("query filters returned records and paths by type and relation", () => {
  const result = queryNeuralArtifactCorpus(corpus(), {
    start: { refType: "artifact", refId: "artifact-topic-region-example" },
    refTypes: ["artifact"],
    artifactTypes: ["evidence_bundle"],
    relationTypes: ["contextualizes"],
    maxDepth: 3
  });
  assert.ok(result.matches.length > 0);
  assert.ok(result.matches.every((item) => item.ref.refType === "artifact" && item.entity.artifactType === "evidence_bundle"));
  assert.ok(result.paths.every((p) => p.steps.every((step) => step.relation.relationType === "contextualizes")));
});

test("query reports unreachable targets and bounded results", () => {
  const data = corpus();
  const missing = queryNeuralArtifactCorpus(data, {
    start: { refType: "graph_node", refId: "n2" },
    target: { refType: "graph_node", refId: "not-present" }
  });
  assert.equal(missing.targetReached, false);
  assert.ok(missing.warnings.some((w) => w.includes("target reference was not reached")));
  const bounded = queryNeuralArtifactCorpus(data, {
    start: { refType: "artifact", refId: "artifact-topic-region-example" },
    maxDepth: 5,
    maxResults: 2
  });
  assert.equal(bounded.truncated, true);
  assert.equal(bounded.incomplete, true);
});

test("query validates reference shapes and filter types", () => {
  const data = corpus();
  assert.throws(() => queryNeuralArtifactCorpus(data, { start: { refType: "bogus", refId: "x" } }), /start must use/);
  assert.throws(() => queryNeuralArtifactCorpus(data, { start: { refType: "node", refId: "n2" }, statuses: "proposed" }), /statuses must be an array/);
});
