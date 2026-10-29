"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadNeuralArtifactCorpus, DEFAULT_FILES } = require("../src/neural-artifact-corpus");

const rootDir = path.join(__dirname, "..");

test("corpus loader loads all current stores and builds navigable indexes", () => {
  const result = loadNeuralArtifactCorpus({ rootDir });
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
  assert.equal(result.data.graph.nodes.length > 0, true);
  assert.equal(result.data.sources.length, 1);
  assert.equal(result.data.claims.length, 1);
  assert.equal(result.data.evidenceLinks.length, 1);
  assert.equal(result.data.artifacts.length > 0, true);
  assert.equal(result.data.artifactLinks.length > 0, true);
  assert.ok(result.indexes.nodesById.has("n2"));
  assert.ok(result.indexes.edgesById.has("e4"));
  assert.ok(result.indexes.artifactsByVersion.has("artifact-topic-region-example@1"));
});

test("loader reports missing files without throwing by default", () => {
  const result = loadNeuralArtifactCorpus({
    rootDir,
    files: { ...DEFAULT_FILES, sources: "data/references/absent-sources.json" }
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("absent-sources.json")));
});

test("loader can throw a structured error report for invalid corpora", () => {
  assert.throws(
    () => loadNeuralArtifactCorpus({
      rootDir,
      files: { ...DEFAULT_FILES, claims: "data/references/absent-claims.json" },
      throwOnError: true
    }),
    (error) => error.name === "NeuralArtifactCorpusError" &&
      error.report.valid === false &&
      error.report.errors.some((item) => item.includes("absent-claims.json"))
  );
});

test("loader prevents configured paths from escaping the repository root", () => {
  const result = loadNeuralArtifactCorpus({
    rootDir,
    files: { ...DEFAULT_FILES, graph: "../outside-graph.json" }
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("escapes the configured root")));
});
