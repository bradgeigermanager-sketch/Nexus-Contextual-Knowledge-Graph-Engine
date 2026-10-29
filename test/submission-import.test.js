"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { parseSubmissionText } = require("../src/submission-import");
const edge = (id) => ({
  schema: "nexus-submission/v1", submissionId: id, recordType: "edge", operation: "create_candidate",
  payload: { externalId: id, edge: { source: { refType: "graph_node", refId: "n1" }, target: { refType: "graph_node", refId: "n2" }, relationshipType: "related_to" } },
  provenance: { channel: "file_import" }, idempotencyKey: "import-key-" + id
});
test("JSON import accepts one envelope or a bounded array and stays dry-run", () => {
  const single = parseSubmissionText(JSON.stringify(edge("single001")));
  assert.equal(single.valid, true);
  assert.equal(single.records.length, 1);
  assert.equal(single.committed, false);
  const batch = parseSubmissionText(JSON.stringify([edge("batch0001"), edge("batch0002")]));
  assert.equal(batch.valid, true);
  assert.equal(batch.records.length, 2);
});
test("JSONL import preserves line numbers and reports invalid rows without hiding valid rows", () => {
  const text = [JSON.stringify(edge("valid0001")), "{invalid json", JSON.stringify(edge("valid0002"))].join("\n");
  const result = parseSubmissionText(text, { format: "jsonl" });
  assert.equal(result.valid, false);
  assert.equal(result.records.length, 2);
  assert.ok(result.errors.some((e) => e.code === "import.jsonl_parse_error" && e.line === 2));
  assert.equal(result.committed, false);
});
test("import enforces format, byte, and record limits", () => {
  assert.equal(parseSubmissionText("{}", { format: "csv" }).errors[0].code, "import.format_unsupported");
  assert.equal(parseSubmissionText("12345", { maxBytes: 2 }).errors[0].code, "import.payload_too_large");
  const tooMany = parseSubmissionText(JSON.stringify([edge("record0001"), edge("record0002")]), { maxRecords: 1 });
  assert.equal(tooMany.errors[0].code, "import.record_limit_exceeded");
});
