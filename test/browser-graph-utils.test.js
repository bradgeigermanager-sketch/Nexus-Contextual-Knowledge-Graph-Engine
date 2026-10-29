"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const start = html.indexOf("        const validateGraphData =");
const end = html.indexOf("        const loadSavedGraph =", start);
if (start < 0 || end < 0) throw new Error("Browser graph utility definitions not found.");
const sandbox = {};
vm.runInNewContext(html.slice(start, end) + "\nglobalThis.__testUtils = { validateGraphData, parseCsvRecords, csvField };", sandbox);
const utils = sandbox.__testUtils;
const plain = (value) => JSON.parse(JSON.stringify(value));

test("browser graph validator accepts a complete graph", () => {
  const result = utils.validateGraphData(
    [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    [{ id: "e", source: "a", target: "b", weight: 0.5 }]
  );
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("browser graph validator rejects missing endpoints and duplicate IDs", () => {
  const result = utils.validateGraphData(
    [{ id: "a", label: "A" }, { id: "a", label: "Duplicate" }],
    [{ id: "e", source: "a", target: "missing" }]
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("Duplicate node ID")));
  assert.ok(result.errors.some((error) => error.includes("missing target")));
});

test("CSV parser preserves quoted commas, quotes, and embedded newlines", () => {
  const input = 'id,label,desc\n1,"North, West","He said ""hello"""\n2,"Multi\nline","plain"';
  assert.deepEqual(plain(utils.parseCsvRecords(input)), [
    ["id", "label", "desc"],
    ["1", "North, West", 'He said "hello"'],
    ["2", "Multi\nline", "plain"]
  ]);
});

test("CSV parser rejects unterminated quoted fields", () => {
  assert.throws(() => utils.parseCsvRecords('id,label\n1,"unfinished'), /unterminated quoted field/i);
});

test("CSV exporter escapes values accepted by the parser", () => {
  const value = 'Text, with "quotes"\nand newline';
  const encoded = utils.csvField(value);
  assert.equal(encoded, '"Text, with ""quotes""\nand newline"');
  assert.equal(plain(utils.parseCsvRecords(encoded))[0][0], value);
});

test("application ingestion validates the combined candidate before state changes", () => {
  assert.ok(html.includes("const candidateNodes=[...nodes,...newNodes],candidateEdges=[...edges,...newEdges]"));
  assert.ok(html.includes("if(!validation.valid){showToast"));
  assert.ok(html.includes("const [initialGraph] = useState(() => loadSavedGraph())"));
});
