"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { loadNeuralArtifactCorpus } = require("../src/neural-artifact-corpus");

const root = path.resolve(__dirname, "..");
const outDir = path.resolve(process.argv[2] || path.join(root, "_site"));
const modules = [
  "src/neural-artifact-traversal.js",
  "src/neural-artifact-query.js",
  "src/submission-contracts.js",
  "src/submission-import.js"
];

function copy(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

function buildBrowserBundle() {
  const definitions = modules.map((relative) => {
    const id = "./" + path.basename(relative, ".js");
    const source = fs.readFileSync(path.join(root, relative), "utf8");
    return JSON.stringify(id) + ": function(module, exports, require, Buffer) {\n" + source + "\n}";
  }).join(",\n");
  return `/* Generated from repository CommonJS modules by scripts/build-pages.js. Do not edit by hand. */
(function(root) {
  "use strict";
  const definitions = {\n${definitions}\n};
  const cache = Object.create(null);
  function load(id) {
    if (cache[id]) return cache[id].exports;
    if (!definitions[id]) throw new Error("Browser bundle module not found: " + id);
    const module = { exports: {} };
    cache[id] = module;
    const localRequire = function(request) {
      const normalized = request.replace(/\\.js$/, "");
      if (normalized === "./neural-artifact-traversal") return load("./neural-artifact-traversal");
      if (normalized === "./submission-contracts") return load("./submission-contracts");
      throw new Error("Unsupported bundled dependency: " + request);
    };
    const bufferShim = { byteLength: function(value) { return new TextEncoder().encode(value).length; } };
    definitions[id](module, module.exports, localRequire, bufferShim);
    return module.exports;
  }
  root.NexusModules = Object.freeze({
    queryNeuralArtifactCorpus: load("./neural-artifact-query").queryNeuralArtifactCorpus,
    traverseNeuralArtifactCorpus: load("./neural-artifact-traversal").traverseNeuralArtifactCorpus,
    normalizeSubmission: load("./submission-contracts").normalizeSubmission,
    validateQueryEnvelope: load("./submission-contracts").validateQueryEnvelope,
    parseSubmissionText: load("./submission-import").parseSubmissionText
  });
})(typeof window !== "undefined" ? window : globalThis);
`;
}

function main() {
  const corpus = loadNeuralArtifactCorpus({ rootDir: root });
  if (!corpus.valid) {
    throw new Error("Canonical corpus validation failed; refusing to build Pages data:\\n" + corpus.errors.join("\\n"));
  }
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  copy(path.join(root, "site/index.html"), path.join(outDir, "index.html"));
  copy(path.join(root, "site/docs.html"), path.join(outDir, "docs.html"));
  copy(path.join(root, "site/portal.html"), path.join(outDir, "portal.html"));
  copy(path.join(root, "index.html"), path.join(outDir, "explorer.html"));
  copy(path.join(root, "docs"), path.join(outDir, "docs"));
  copy(path.join(root, "data"), path.join(outDir, "data"));
  copy(path.join(root, "schemas"), path.join(outDir, "schemas"));
  fs.writeFileSync(path.join(outDir, "data/portal-corpus.json"), JSON.stringify({
    schema: "nexus-portal-corpus/v1",
    valid: corpus.valid,
    validation: { errors: corpus.errors, warnings: corpus.warnings },
    data: corpus.data
  }, null, 2) + "\\n");
  fs.writeFileSync(path.join(outDir, "nexus-modules.js"), buildBrowserBundle());
  fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
  for (const required of [
    "index.html", "docs.html", "portal.html", "explorer.html",
    "data/portal-corpus.json", "data/implementation-status.json",
    "docs/i18n/en/system-overview.md", "nexus-modules.js"
  ]) {
    const full = path.join(outDir, required);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile() || fs.statSync(full).size === 0) {
      throw new Error("Required Pages artifact missing or empty: " + required);
    }
  }
  console.log("Pages artifact built. Corpus valid: " + corpus.valid +
    "; graph nodes: " + corpus.data.graph.nodes.length +
    "; graph edges: " + corpus.data.graph.edges.length);
}

if (require.main === module) main();
module.exports = { buildBrowserBundle };
