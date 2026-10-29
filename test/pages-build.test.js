"use strict";
const test = require("node:test");
const fs = require("node:fs");
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
  assert.equal(typeof context.NexusModules.stageSubmissionText, "function");
  assert.equal(typeof context.NexusModules.summarizeStagingForReview, "function");
  assert.equal(typeof context.NexusModules.validateReviewDecision, "function");
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
  const staged = context.NexusModules.stageSubmissionText(JSON.stringify(envelope), browserCorpus);
  assert.equal(staged.records[0].classification, "ready_for_review");
  assert.equal(staged.committed, false);
  const reviewSummary = context.NexusModules.summarizeStagingForReview(staged);
  assert.equal(reviewSummary.counts.ready_for_review, 1);
  const decision = { schema: "nexus-review-decision/v1", decisionId: "review-bundle-1", submissionId: staged.records[0].submissionId, candidateFingerprint: staged.records[0].fingerprint, corpusSnapshotId: "fixture-snapshot-1", reviewer: { subject: "test:reviewer" }, decidedAt: "2026-10-28T19:00:00Z", decision: "accept", rationale: "Automated bundle contract test." };
  assert.equal(context.NexusModules.validateReviewDecision(decision, staged.records[0], "fixture-snapshot-1").valid, true);
});

test("portal inline JavaScript parses before publication", () => {
  const html = fs.readFileSync(path.join(__dirname, "../site/portal.html"), "utf8");
  const scripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(match => match[1]).filter(source => source.trim());
  assert.ok(scripts.length > 0, "expected inline portal script");
  for (const source of scripts) new vm.Script(source, { filename: "site/portal.html:inline-script" });
});
