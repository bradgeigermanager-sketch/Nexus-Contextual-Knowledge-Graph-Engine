"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { normalizeSubmission, validateQueryEnvelope } = require("../src/submission-contracts");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", name), "utf8"));
const baseSubmission = () => ({
  schema: "nexus-submission/v1", submissionId: "submission-demo-001", recordType: "edge", operation: "create_candidate",
  payload: { externalId: "external-edge-1", edge: { source: { refType: "graph_node", refId: "n1" }, target: { refType: "graph_node", refId: "n2" }, relationshipType: "related_to", status: "proposed", evidenceRefs: [] } },
  provenance: { channel: "manual", sourceRef: null }, idempotencyKey: "demo-key-0001", dryRun: true
});
test("all interface schemas parse and declare JSON Schema draft 2020-12", () => {
  for (const file of ["schemas/query-envelope.schema.json","schemas/submission-envelope.schema.json","schemas/node-submission.schema.json","schemas/edge-submission.schema.json","schemas/source-submission.schema.json","schemas/claim-evidence-submission.schema.json","schemas/adapter-manifest.schema.json","schemas/validation-report.schema.json","schemas/submission-result.schema.json"]) {
    const schema = readJson(file);
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema", file);
    assert.equal(typeof schema.title, "string", file);
  }
});
test("normalizer accepts typed edge candidate and defaults to dry-run behavior", () => {
  const result = normalizeSubmission(baseSubmission());
  assert.equal(result.valid, true, result.errors.map((e) => e.message).join("\n"));
  assert.equal(result.normalized.dryRun, true);
  assert.equal(result.normalized.payload.edge.source.refType, "graph_node");
  assert.equal(result.warnings.length, 0);
});
test("normalizer rejects malformed endpoints and weak idempotency keys", () => {
  const input = baseSubmission(); input.payload.edge.target.refId = " "; input.idempotencyKey = "short";
  const result = normalizeSubmission(input);
  assert.equal(result.valid, false); assert.equal(result.normalized, null);
  assert.ok(result.errors.some((e) => e.code === "reference.id_required"));
  assert.ok(result.errors.some((e) => e.code === "submission.idempotency_key_invalid"));
});
test("unknown provenance channels are retained as warnings; commit requests never commit", () => {
  const input = baseSubmission(); input.provenance.channel = "custom_connector"; input.dryRun = false;
  const result = normalizeSubmission(input);
  assert.equal(result.valid, true);
  assert.ok(result.warnings.some((e) => e.code === "provenance.channel_extension"));
  assert.ok(result.warnings.some((e) => e.code === "submission.commit_not_performed"));
  assert.equal(result.normalized.dryRun, true);
});
test("query validation checks typed references, bounded limits, and output format", () => {
  const q = { schema: "nexus-query/v1", queryId: "query-demo-001", intent: "traverse_and_filter", start: { refType: "graph_node", refId: "n2" }, target: { refType: "artifact", refId: "artifact-topic-region-example" }, constraints: { maxDepth: 4, maxResults: 100 }, output: { format: "typed_json", includePaths: true } };
  assert.equal(validateQueryEnvelope(q).valid, true);
  q.constraints.maxDepth = 500; q.output.format = "unknown";
  const result = validateQueryEnvelope(q);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.code === "query.max_depth_invalid"));
  assert.ok(result.errors.some((e) => e.code === "query.output_invalid"));
});
