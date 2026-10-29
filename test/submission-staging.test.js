"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadNeuralArtifactCorpus } = require("../src/neural-artifact-corpus");
const { stageSubmissionText } = require("../src/submission-staging");

const corpus = loadNeuralArtifactCorpus({ rootDir: path.join(__dirname, "..") });
const node = (id, label = "Candidate concept") => ({
  schema: "nexus-submission/v1", submissionId: "stage-" + id,
  recordType: "node", operation: "create_candidate",
  payload: { externalId: id, node: { type: "concept", label } },
  provenance: { channel: "manual", sourceRef: "source:source-example-report-page" },
  idempotencyKey: "stage-key-" + id
});

test("staging preserves provenance and fingerprints candidate without persistence", () => {
  const result = stageSubmissionText(JSON.stringify(node("new-stage-node")), corpus);
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].classification, "ready_for_review");
  assert.equal(result.records[0].provenance.sourceRef, "source:source-example-report-page");
  assert.equal(result.records[0].fingerprint.algorithm, "sha256");
  assert.equal(result.records[0].committed, false);
  assert.equal(result.committed, false);
});

test("staging identifies equivalent existing node and conflicting reused identifier", () => {
  const same = node("n2", "Financial Report");
  same.payload.node.type = "ckg";
  const duplicate = stageSubmissionText(JSON.stringify(same), corpus);
  assert.equal(duplicate.records[0].classification, "duplicate_existing");
  const conflict = stageSubmissionText(JSON.stringify(node("n2", "Different label")), corpus);
  assert.equal(conflict.records[0].classification, "conflict_existing");
});

test("staging marks unresolved typed edge references for review", () => {
  const submission = {
    schema: "nexus-submission/v1", submissionId: "stage-edge-001",
    recordType: "edge", operation: "create_candidate",
    payload: { externalId: "edge-not-yet", edge: { source: { refType: "graph_node", refId: "missing-a" }, target: { refType: "graph_node", refId: "missing-b" }, relationshipType: "related_to" } },
    provenance: { channel: "manual" }, idempotencyKey: "stage-edge-key-001"
  };
  const result = stageSubmissionText(JSON.stringify(submission), corpus);
  assert.equal(result.records[0].classification, "needs_reference_resolution");
  assert.ok(result.records[0].issues.some((i) => i.code === "candidate.unresolved_references"));
});

test("staging refuses to run against an invalid corpus and does not auto-commit", () => {
  const result = stageSubmissionText(JSON.stringify(node("safe-stage-node")), { valid: false, data: {} });
  assert.equal(result.valid, false);
  assert.equal(result.committed, false);
  assert.equal(result.errors[0].code, "staging.corpus_not_valid");
});
