"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const path = require("node:path");
const { buildBrowserBundle } = require("../scripts/build-pages");
const { loadNeuralArtifactCorpus } = require("../src/neural-artifact-corpus");

test("generated browser bundle parses and exposes shared query and submission APIs", () => {
  const context = { TextEncoder };
  context.window = context;
  context.globalThis = context;
  vm.runInNewContext(buildBrowserBundle(), context, { timeout: 2000 });
  assert.equal(typeof context.NexusModules.queryNeuralArtifactCorpus, "function");
  assert.equal(typeof context.NexusModules.parseSubmissionText, "function");
  const corpus = loadNeuralArtifactCorpus({ rootDir: path.join(__dirname, "..") });
  const browserCorpus = { valid: corpus.valid, data: corpus.data, indexes: {} };
  const query = context.NexusModules.queryNeuralArtifactCorpus(browserCorpus, {
    start: { refType: "graph_node", refId: "n2" },
    target: { refType: "graph_node", refId: "n5" },
    maxDepth: 4,
    maxResults: 100,
    includeGraphNeighbors: true
  });
  assert.equal(query.targetReached, true);
  assert.equal(query.targetMatched, true);
  const envelope = {
    schema: "nexus-submission/v1", submissionId: "bundle-test-0001",
    recordType: "node", operation: "create_candidate",
    payload: { externalId: "bundle-candidate-1", node: { type: "concept", label: "Browser bundle test" } },
    provenance: { channel: "bundle_test" }, idempotencyKey: "bundle-test-key-0001"
  };
  const imported = context.NexusModules.parseSubmissionText(JSON.stringify(envelope));
  assert.equal(imported.valid, true, JSON.stringify(imported.errors));
  assert.equal(imported.committed, false);
});
