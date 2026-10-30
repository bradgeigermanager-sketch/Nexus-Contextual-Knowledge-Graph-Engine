"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateGraph, parseSavedGraph } = require("../src/graph-validation");

const nodes = [
  { id: "n1", label: "First", val: 10 },
  { id: "n2", label: "Second" }
];
const edges = [{ id: "e1", source: "n1", target: "n2", weight: 0.75 }];

test("accepts a structurally valid graph", () => {
  assert.deepEqual(validateGraph(nodes, edges), { valid: true, errors: [] });
});

test("requires arrays and object records", () => {
  assert.equal(validateGraph(null, []).valid, false);
  assert.match(validateGraph([null], []).errors[0], /must be an object/);
});

test("rejects blank and duplicate node IDs", () => {
  const result = validateGraph(
    [{ id: " ", label: "Blank" }, { id: "x", label: "X" }, { id: "x", label: "Duplicate" }],
    []
  );
  assert.ok(result.errors.some(error => /non-empty string/.test(error)));
  assert.ok(result.errors.some(error => /duplicate node id/.test(error)));
});

test("rejects duplicate edge IDs and missing endpoints", () => {
  const result = validateGraph(nodes, [
    { id: "e", source: "n1", target: "missing" },
    { id: "e", source: "unknown", target: "n2" }
  ]);
  assert.ok(result.errors.some(error => /duplicate edge id/.test(error)));
  assert.ok(result.errors.some(error => /missing node: missing/.test(error)));
  assert.ok(result.errors.some(error => /missing node: unknown/.test(error)));
});

test("rejects invalid weights and node values", () => {
  assert.equal(validateGraph(nodes, [{ id: "e", source: "n1", target: "n2", weight: 1.1 }]).valid, false);
  assert.equal(validateGraph([{ id: "n", label: "N", val: -1 }], []).valid, false);
  assert.equal(validateGraph(nodes, [{ id: "e", source: "n1", target: "n2", weight: NaN }]).valid, false);
});

test("allows omitted optional weights and values", () => {
  assert.equal(validateGraph(nodes.map(({ id, label }) => ({ id, label })), [
    { id: "e", source: "n1", target: "n2" }
  ]).valid, true);
});

test("recovers from malformed saved JSON without throwing", () => {
  const result = parseSavedGraph("{bad", JSON.stringify(edges), nodes, edges);
  assert.deepEqual(result.nodes, nodes);
  assert.ok(result.warnings.length > 0);
});

test("falls back when parsed saved graph is structurally invalid", () => {
  const result = parseSavedGraph(JSON.stringify(nodes), JSON.stringify([
    { id: "e", source: "n1", target: "missing" }
  ]), nodes, edges);
  assert.deepEqual(result.edges, edges);
  assert.ok(result.warnings.some(warning => /structural validation/.test(warning)));
});
