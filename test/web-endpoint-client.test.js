"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { validateEndpointProfile, isPrivateOrLocalHost, requestEndpoint, appendPath } = require("../src/web-endpoint-client");
const registry = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data/endpoints/registry.json"), "utf8"));
test("endpoint registry profiles use secure, explicit host and method policies", () => {
  assert.equal(registry.schema, "nexus-web-endpoint-registry/v1");
  assert.equal(registry.endpoints.length >= 2, true);
  for (const profile of registry.endpoints) {
    const result = validateEndpointProfile(profile);
    assert.equal(result.valid, true, profile.endpointId + ": " + result.errors.join("; "));
  }
});
test("endpoint profile validation rejects credentials, HTTP, private hosts, and host mismatches", () => {
  const base = structuredClone(registry.endpoints[0]);
  base.baseUrl = "http://api.github.com";
  assert.equal(validateEndpointProfile(base).valid, false);
  base.baseUrl = "https://user:pass@api.github.com";
  assert.equal(validateEndpointProfile(base).valid, false);
  base.baseUrl = "https://127.0.0.1";
  assert.equal(validateEndpointProfile(base).valid, false);
  base.baseUrl = "https://evil.example";
  assert.equal(validateEndpointProfile(base).valid, false);
  assert.equal(isPrivateOrLocalHost("localhost"), true);
  assert.equal(isPrivateOrLocalHost("192.168.1.1"), true);
  assert.equal(isPrivateOrLocalHost("8.8.8.8"), false);
});
test("endpoint requests reject disabled profiles, disallowed methods, and path escapes before network access", async () => {
  const base = structuredClone(registry.endpoints[0]);
  base.enabled = false;
  assert.equal((await requestEndpoint(base)).error.code, "endpoint.disabled");
  base.enabled = true;
  assert.equal((await requestEndpoint(base, { method: "DELETE" })).error.code, "endpoint.method_not_allowed");
  assert.equal((await requestEndpoint(base, { path: "https://evil.example/" })).error.code, "endpoint.path_invalid");
});

test("endpoint path resolution preserves base paths and rejects traversal", () => {
  assert.equal(appendPath("https://query.wikidata.org/sparql").toString(), "https://query.wikidata.org/sparql");
  assert.equal(appendPath("https://api.github.com", "repos/example/project").toString(), "https://api.github.com/repos/example/project");
  assert.throws(() => appendPath("https://api.github.com/api", "../admin"), /escapes/);
});
