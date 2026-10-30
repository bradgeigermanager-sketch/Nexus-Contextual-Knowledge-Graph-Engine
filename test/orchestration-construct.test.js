const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/orchestration-construct.schema.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'data/orchestration/constructs.json'), 'utf8'));

test('orchestration construct schema declares the required contract and safe execution fields', () => {
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.ok(schema.required.includes('constructId'));
  assert.ok(schema.required.includes('versionId'));
  assert.ok(schema.required.includes('inputContract') === false, 'input contracts may be absent for some constructs');
  assert.ok(schema.properties.security.properties.executionEnabled);
  assert.ok(schema.properties.security.properties.secretRefs);
});

test('synthetic construct fixture has unique IDs, explicit contracts, and disabled execution', () => {
  assert.equal(corpus.synthetic, true);
  assert.ok(Array.isArray(corpus.constructs));
  const ids = new Set();
  const versions = new Set();
  for (const item of corpus.constructs) {
    assert.ok(item.constructId);
    assert.ok(item.versionId);
    assert.ok(!ids.has(item.constructId), 'construct IDs must be unique');
    assert.ok(!versions.has(item.versionId), 'version IDs must be unique');
    ids.add(item.constructId);
    versions.add(item.versionId);
    assert.ok(schema.properties.family.enum.includes(item.family));
    assert.ok(item.inputContract && item.outputContract);
    assert.equal(item.provenance.synthetic, true);
    assert.equal(item.security.executionEnabled, false, 'fixture constructs must not enable execution');
    assert.ok(Array.isArray(item.dependencies));
    assert.ok(Array.isArray(item.security.secretRefs));
  }
});

test('documentation describes the construct layer as declarative, not an active runtime', () => {
  const doc = fs.readFileSync(path.join(root, 'docs/langchain-constructs.md'), 'utf8');
  assert.match(doc, /not an installed LangChain runtime/i);
  assert.match(doc, /Credentials must be represented as secret references/i);
  assert.match(doc, /retriever returning a source does not establish that a claim is true/i);
});
