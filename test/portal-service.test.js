"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { createPortalService } = require("../src/portal-service");

test("portal service loads a validated corpus and exposes its status", () => {
  const service = createPortalService({ rootDir: path.join(__dirname, "..") });
  const status = service.corpusStatus();
  assert.equal(status.valid, true, status.errors.join("\\n"));
});

test("portal service delegates graph queries to the bounded corpus query API", () => {
  const service = createPortalService({ rootDir: path.join(__dirname, "..") });
  const result = service.query({
    start: { refType: "graph_node", refId: "n2" },
    target: { refType: "graph_node", refId: "n5" },
    maxDepth: 4,
    maxResults: 100,
    includeGraphNeighbors: true
  });
  assert.equal(result.valid, true, result.errors.join("\\n"));
  assert.equal(result.result.targetReached, true);
  assert.ok(result.result.paths.length >= 1);
  assert.ok(result.result.limitations.length > 0);
});

test("portal service rejects unresolved references and malformed query envelopes safely", () => {
  const service = createPortalService({ rootDir: path.join(__dirname, "..") });
  const missing = service.query({ start: { refType: "graph_node", refId: "not-present" } });
  assert.equal(missing.valid, true);
  assert.ok(missing.result.warnings.some((warning) => warning.includes("does not resolve")));
  const malformed = service.query({ start: { refType: "unknown", refId: "x" } });
  assert.equal(malformed.valid, false);
});

test("portal submission preview uses repository JSONL importer and never commits", () => {
  const service = createPortalService({ rootDir: path.join(__dirname, "..") });
  const envelope = {
    schema: "nexus-submission/v1", submissionId: "portal-preview-001",
    recordType: "node", operation: "create_candidate",
    payload: { externalId: "candidate-001", node: { type: "concept", label: "Example" } },
    provenance: { channel: "portal_test" }, idempotencyKey: "portal-preview-key-001"
  };
  const result = service.previewSubmissions(JSON.stringify(envelope));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.committed, false);
  assert.equal(result.records.length, 1);
});

test("portal service stages candidates with explicit review classification", () => {
  const service = createPortalService({ rootDir: path.join(__dirname, "..") });
  const envelope = {
    schema: "nexus-submission/v1", submissionId: "portal-stage-0001",
    recordType: "node", operation: "create_candidate",
    payload: { externalId: "portal-stage-candidate-1", node: { type: "concept", label: "Staging candidate" } },
    provenance: { channel: "portal_test", sourceRef: "source:source-example-report-page" },
    idempotencyKey: "portal-stage-key-0001"
  };
  const result = service.stageSubmissions(JSON.stringify(envelope));
  assert.equal(result.records[0].classification, "ready_for_review");
  assert.equal(result.records[0].provenance.sourceRef, "source:source-example-report-page");
  assert.equal(result.committed, false);
});
