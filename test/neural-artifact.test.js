"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));

test("neural artifact manifest counts and labels its fixtures synthetic", () => {
  const manifest = readJson("data/artifacts/manifest.json");
  const data = readJson("data/artifacts/artifacts.json");
  const links = readJson("data/artifacts/artifact-links.json");
  assert.equal(manifest.synthetic, true);
  assert.equal(data.synthetic, true);
  assert.equal(data.artifacts.length, manifest.counts.artifacts);
  assert.equal(links.links.length, manifest.counts.artifactLinks);
  assert.ok(data.artifacts.every((a) => a.synthetic === true));
});

test("artifact and version identifiers are unique and artifact links resolve", () => {
  const { artifacts } = readJson("data/artifacts/artifacts.json");
  const { links } = readJson("data/artifacts/artifact-links.json");
  assert.equal(new Set(artifacts.map((a) => a.artifactId)).size, artifacts.length);
  assert.equal(new Set(artifacts.map((a) => a.versionId)).size, artifacts.length);
  assert.equal(new Set(links.map((a) => a.linkId)).size, links.length);
  const byId = new Map(artifacts.map((a) => [a.artifactId, a]));
  for (const link of links) {
    assert.ok(byId.has(link.sourceArtifactId), "source artifact resolves");
    assert.ok(byId.has(link.targetArtifactId), "target artifact resolves");
    assert.ok(["directed", "undirected"].includes(link.directionality));
    if (link.sourceVersionId) assert.equal(byId.get(link.sourceArtifactId).versionId, link.sourceVersionId);
    if (link.targetVersionId) assert.equal(byId.get(link.targetArtifactId).versionId, link.targetVersionId);
  }
});

test("typed artifact members resolve against graph and reference corpus", () => {
  const graph = readJson("data/canonical/graph.json");
  const refs = {
    graph_node: new Set(graph.nodes.map((n) => n.id)),
    graph_edge: new Set(graph.edges.map((e) => e.id)),
    source: new Set(readJson("data/references/sources.json").sources.map((s) => s.sourceId)),
    claim: new Set(readJson("data/references/claims.json").claims.map((c) => c.claimId)),
    evidence_link: new Set(readJson("data/references/evidence-links.json").evidenceLinks.map((e) => e.evidenceLinkId))
  };
  const { artifacts } = readJson("data/artifacts/artifacts.json");
  for (const artifact of artifacts) {
    for (const member of artifact.members) {
      if (refs[member.refType]) {
        assert.ok(refs[member.refType].has(member.refId),
          "member " + member.refType + ":" + member.refId + " resolves");
      } else if (member.refType === "artifact") {
        assert.ok(artifacts.some((a) => a.artifactId === member.refId), "artifact member resolves");
      } else {
        assert.fail("unknown member reference type: " + member.refType);
      }
    }
    for (const evidenceRef of artifact.evidenceRefs) {
      assert.ok(refs.evidence_link.has(evidenceRef), "artifact evidence reference resolves");
    }
  }
});

test("similarity and evidence stance remain distinct relation concepts", () => {
  const { links } = readJson("data/artifacts/artifact-links.json");
  assert.ok(links.every((link) => typeof link.relationType === "string" && link.relationType.length > 0));
  assert.ok(!links.some((link) => link.relationType === "confidence"));
});
