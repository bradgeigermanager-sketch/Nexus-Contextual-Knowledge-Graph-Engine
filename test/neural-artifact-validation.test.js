"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { validateNeuralArtifactCorpus } = require("../src/neural-artifact-validation");

const readJson = (relativePath) => JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", relativePath), "utf8"
));

function fixtureInput() {
  return {
    graph: readJson("data/canonical/graph.json"),
    sources: readJson("data/references/sources.json").sources,
    claims: readJson("data/references/claims.json").claims,
    evidenceLinks: readJson("data/references/evidence-links.json").evidenceLinks,
    artifacts: readJson("data/artifacts/artifacts.json").artifacts,
    artifactLinks: readJson("data/artifacts/artifact-links.json").links
  };
}

test("reusable validator accepts the current synthetic artifact corpus", () => {
  const result = validateNeuralArtifactCorpus(fixtureInput());
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
  assert.ok(result.indexes.nodesById.has("n2"));
  assert.ok(result.indexes.artifactsById.has("artifact-topic-region-example"));
  assert.ok(result.indexes.evidenceLinksById.has("evidence-example-001"));
});

test("validator rejects missing member references and mismatched artifact versions", () => {
  const input = fixtureInput();
  input.artifacts[0].members.push({
    refType: "graph_node",
    refId: "node-that-does-not-exist",
    role: "invalid_fixture"
  });
  input.artifactLinks[0].sourceVersionId = "wrong-version";
  const result = validateNeuralArtifactCorpus(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("node-that-does-not-exist")));
  assert.ok(result.errors.some((error) => error.includes("source version does not match")));
});

test("validator warns for unresolved extension member types but supports explicit resolvers", () => {
  const input = fixtureInput();
  input.artifacts[0].members.push({
    refType: "context",
    refId: "context-demo",
    role: "context"
  });
  const withoutResolver = validateNeuralArtifactCorpus(input);
  assert.equal(withoutResolver.valid, true);
  assert.ok(withoutResolver.warnings.some((warning) => warning.includes("context-demo")));
  const withResolver = validateNeuralArtifactCorpus({
    ...input,
    externalResolvers: { context: ["context-demo"] }
  });
  assert.equal(withResolver.valid, true);
  assert.deepEqual(withResolver.warnings, []);
});

test("validator rejects malformed top-level collections and duplicate artifact IDs", () => {
  assert.equal(validateNeuralArtifactCorpus({ graph: {}, artifacts: [] }).valid, false);
  const input = fixtureInput();
  input.artifacts.push({ ...input.artifacts[0] });
  const result = validateNeuralArtifactCorpus(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("duplicate artifact identifier")));
});
