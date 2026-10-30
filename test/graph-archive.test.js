"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { validateGraph } = require("../src/graph-validation");

const read = (relativePath) => fs.readFileSync(
  path.join(__dirname, "..", relativePath),
  "utf8"
);

test("canonical graph archive is structurally valid and has expected counts", () => {
  const graph = JSON.parse(read("data/canonical/graph.json"));
  assert.equal(graph.schema, "nexus-ckg-graph/v1");
  assert.equal(graph.nodes.length, 8);
  assert.equal(graph.edges.length, 8);
  assert.deepEqual(validateGraph(graph.nodes, graph.edges), { valid: true, errors: [] });
});

test("JSON import fixture preserves canonical node and edge identities", () => {
  const canonical = JSON.parse(read("data/canonical/graph.json"));
  const fixture = JSON.parse(read("data/import-fixtures/graph.json"));
  assert.deepEqual(fixture.nodes.map((n) => n.id), canonical.nodes.map((n) => n.id));
  assert.deepEqual(fixture.edges.map((e) => [e.id, e.source, e.target]),
    canonical.edges.map((e) => [e.id, e.source, e.target]));
  assert.deepEqual(validateGraph(fixture.nodes, fixture.edges), { valid: true, errors: [] });
});

test("CSV fixture follows the application's node/edge section convention", () => {
  const csv = read("data/import-fixtures/graph.csv");
  const sections = csv.split("---edges---");
  assert.equal(sections.length, 2);
  const nodeLines = sections[0].trim().split("\n");
  const edgeLines = sections[1].trim().split("\n");
  assert.equal(nodeLines[0], "id,label,type,val,color,desc,metrics_json");
  assert.equal(edgeLines[0], "id,source,target,label,weight");
  assert.equal(nodeLines.length - 1, 8);
  assert.equal(edgeLines.length - 1, 8);
  assert.ok(nodeLines[1].includes('""latency"":""12ms"",""weight"":0.95'));
});
