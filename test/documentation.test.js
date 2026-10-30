"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));

const expectedLanguages = ["ar", "en", "pl", "de", "fr", "id", "hi", "zh", "ru", "sw", "el", "ja", "es"];

test("documentation manifest declares the complete supported language set", () => {
  const manifest = readJson("docs/documentation-manifest.json");
  const codes = manifest.languages.map((language) => language.code);
  assert.equal(manifest.schema, "nexus-documentation-manifest/v1");
  assert.equal(manifest.sourceLanguage, "en");
  assert.deepEqual([...codes].sort(), [...expectedLanguages].sort());
  assert.equal(new Set(codes).size, codes.length, "language codes must be unique");
});

test("every manifest document exists and contains both audience sections", () => {
  const manifest = readJson("docs/documentation-manifest.json");
  for (const language of manifest.languages) {
    assert.ok(language.path.startsWith("docs/i18n/"), language.code + " path must stay under docs/i18n");
    assert.ok(fs.existsSync(path.join(root, language.path)), language.code + " document must exist");
    assert.deepEqual(language.sections, ["technical-readout", "plain-language"]);
    const document = readText(language.path);
    assert.ok(document.trim().length >= 1200, language.code + " document is unexpectedly short");
    const headings = document.match(/^##\s+/gm) || [];
    assert.ok(headings.length >= 2, language.code + " document must contain separate section headings");
  }
});

test("documentation index links to every manifest document", () => {
  const manifest = readJson("docs/documentation-manifest.json");
  const index = readText("docs/system-documentation.md");
  for (const language of manifest.languages) {
    const relativePath = language.path.replace(/^docs\//, "");
    assert.ok(index.includes("(" + relativePath + ")"), "index must link to " + language.code);
  }
});

test("maintenance policy distinguishes implemented, partial, planned, and unverified status", () => {
  const policy = readText("docs/documentation-maintenance.md");
  for (const term of ["Implemented", "Partial/limited", "Planned", "Unverified"]) {
    assert.ok(policy.includes(term), "maintenance policy must define " + term);
  }
});
