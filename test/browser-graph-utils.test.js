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

const cypherStart = html.indexOf("                    } else if (format === 'cypher') {");
const cypherEnd = html.indexOf("                    }\n\n                    setParsedPreview", cypherStart);
if (cypherStart < 0 || cypherEnd < 0) throw new Error("Cypher import branch not found.");
const cypherBranch = html.slice(cypherStart, cypherEnd);
const cypherCode = cypherBranch.slice(cypherBranch.indexOf("\n") + 1);
const parseCypher = new Function("inputText", "graphCategory", "existingNodes", "existingEdges",
  "let newNodes = [], newEdges = [];" + cypherCode + "; return { newNodes, newEdges };");

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

test("Cypher importer resolves exported MATCH aliases to node IDs and preserves weights", () => {
  const source = "CREATE (:ENTITY {id: 'n1', label: 'User Query', desc: 'Description'})\n" +
    "CREATE (:CKG {id: 'n2', label: 'Financial Report', desc: 'Report'})\n" +
    "MATCH (a {id: 'n1'}), (b {id: 'n2'}) CREATE (a)-[:REFERENCES {weight: 0.9}]->(b)";
  const parsed = parseCypher(source, "ckg", [], []);
  assert.deepEqual(parsed.newNodes.map((node) => node.id), ["n1", "n2"]);
  assert.equal(parsed.newEdges[0].source, "n1");
  assert.equal(parsed.newEdges[0].target, "n2");
  assert.equal(parsed.newEdges[0].weight, 0.9);
});

test("Cypher importer maps CREATE variables and reads relationship weights", () => {
  const source = "CREATE (n:CKG {id: 'ckg_12', label: 'Supply Chain Model', desc: 'Example'})\n" +
    "CREATE (n)-[:IMPACTS {weight: 0.9}]->(n2)";
  const parsed = parseCypher(source, "ckg", [{ id: "n2", label: "Existing" }], []);
  assert.equal(parsed.newNodes[0].id, "ckg_12");
  assert.equal(parsed.newEdges[0].source, "ckg_12");
  assert.equal(parsed.newEdges[0].target, "n2");
  assert.equal(parsed.newEdges[0].weight, 0.9);
});
