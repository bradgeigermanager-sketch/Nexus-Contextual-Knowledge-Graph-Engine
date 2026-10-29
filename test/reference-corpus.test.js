"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const readJson = (relativePath) => JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", relativePath), "utf8"
));

test("reference corpus manifest declares only synthetic example data", () => {
  const manifest = readJson("data/references/manifest.json");
  assert.equal(manifest.schema, "nexus-reference-corpus-manifest/v1");
  assert.equal(manifest.synthetic, true);
  assert.deepEqual(manifest.counts, { sources: 1, agents: 2, claims: 1, evidenceLinks: 1 });
});

test("sources, agents, attributions, claims, and evidence links have unique IDs", () => {
  const sources = readJson("data/references/sources.json").sources;
  const agentData = readJson("data/references/agents.json");
  const claims = readJson("data/references/claims.json").claims;
  const evidence = readJson("data/references/evidence-links.json").evidenceLinks;
  const unique = (items, field) => {
    const ids = items.map((item) => item[field]);
    assert.equal(new Set(ids).size, ids.length, field + " values must be unique");
    assert.ok(ids.every((id) => typeof id === "string" && id.length > 0));
  };
  unique(sources, "sourceId");
  unique(agentData.agents, "agentId");
  unique(agentData.attributions, "attributionId");
  unique(claims, "claimId");
  unique(evidence, "evidenceLinkId");
});

test("attributions and evidence links resolve to existing corpus records", () => {
  const sources = readJson("data/references/sources.json").sources;
  const { agents, attributions } = readJson("data/references/agents.json");
  const claims = readJson("data/references/claims.json").claims;
  const evidence = readJson("data/references/evidence-links.json").evidenceLinks;
  const sourceIds = new Set(sources.map((x) => x.sourceId));
  const workIds = new Set(sources.map((x) => x.workId));
  const agentIds = new Set(agents.map((x) => x.agentId));
  const claimIds = new Set(claims.map((x) => x.claimId));
  for (const attribution of attributions) {
    assert.ok(agentIds.has(attribution.agentId), "attribution agent exists");
    assert.ok(workIds.has(attribution.workId), "attribution work exists");
  }
  for (const link of evidence) {
    assert.ok(sourceIds.has(link.sourceId), "evidence source exists");
    if (link.claimId) assert.ok(claimIds.has(link.claimId), "evidence claim exists");
  }
});

test("node-edge-node targets resolve to a matching directed graph path", () => {
  const graph = readJson("data/canonical/graph.json");
  const claims = readJson("data/references/claims.json").claims;
  const evidence = readJson("data/references/evidence-links.json").evidenceLinks;
  const checkTarget = (target) => {
    if (!target || target.kind !== "path") return;
    const edge = graph.edges.find((item) => item.id === target.edgeId);
    assert.ok(edge, "path edge exists");
    assert.equal(edge.source, target.sourceNodeId, "path source matches edge source");
    assert.equal(edge.target, target.targetNodeId, "path target matches edge target");
    assert.ok(graph.nodes.some((item) => item.id === target.sourceNodeId), "path source node exists");
    assert.ok(graph.nodes.some((item) => item.id === target.targetNodeId), "path target node exists");
  };
  for (const claim of claims) checkTarget(claim.target);
  for (const link of evidence) checkTarget(link.target);
});

test("reference examples use a placeholder domain and do not masquerade as real citations", () => {
  const source = readJson("data/references/sources.json").sources[0];
  const claims = readJson("data/references/claims.json").claims;
  const evidence = readJson("data/references/evidence-links.json").evidenceLinks;
  assert.equal(new URL(source.url).hostname, "example.org");
  assert.equal(source.synthetic, true);
  assert.ok(claims.every((claim) => claim.synthetic === true));
  assert.ok(evidence.every((link) => link.synthetic === true));
});
