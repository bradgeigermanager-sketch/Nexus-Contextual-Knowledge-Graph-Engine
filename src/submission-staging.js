"use strict";

const crypto = require("node:crypto");
const { parseSubmissionText } = require("./submission-import");

const keyOf = (type, id) => type + ":" + id;
const stableJson = (value) => JSON.stringify(value, Object.keys(value || {}).sort());

function indexCorpus(corpus) {
  const data = corpus && corpus.data;
  if (!data || !data.graph) throw new TypeError("corpus must include validated data.graph");
  const entities = new Map();
  const add = (type, id, record) => { if (typeof id === "string") entities.set(keyOf(type, id), record); };
  for (const record of data.graph.nodes || []) add("graph_node", record.id, record);
  for (const record of data.graph.edges || []) add("graph_edge", record.id, record);
  for (const record of data.sources || []) add("source", record.sourceId, record);
  for (const record of data.claims || []) add("claim", record.claimId, record);
  for (const record of data.evidenceLinks || []) add("evidence_link", record.evidenceLinkId, record);
  for (const record of data.artifacts || []) add("artifact", record.artifactId, record);
  return { data, entities };
}

function candidateIdentity(submission) {
  const p = submission.payload || {};
  if (submission.recordType === "node" || submission.recordType === "edge") return p.externalId ? keyOf(submission.recordType === "node" ? "graph_node" : "graph_edge", p.externalId) : null;
  if (submission.recordType === "source") return p.source && p.source.sourceId ? keyOf("source", p.source.sourceId) : null;
  if (submission.recordType === "claim_evidence") return p.claim && p.claim.claimId ? keyOf("claim", p.claim.claimId) : null;
  return null;
}

function compareExisting(submission, corpusIndex) {
  const p = submission.payload || {};
  const identity = candidateIdentity(submission);
  const existing = identity ? corpusIndex.entities.get(identity) : null;
  const issues = [];
  if (existing) {
    let same = false;
    if (submission.recordType === "node") same = existing.label === p.node.label && existing.type === p.node.type;
    else if (submission.recordType === "edge") same = existing.source === p.edge.source.refId && existing.target === p.edge.target.refId && (existing.label || existing.relationshipType) === p.edge.relationshipType;
    else if (submission.recordType === "source") same = existing.title === p.source.title && (existing.canonicalUrl || existing.url || null) === (p.source.canonicalUrl || p.source.url || null);
    else same = existing.statement === p.claim.statement;
    issues.push({ code: same ? "candidate.already_exists" : "candidate.identity_conflict", ref: identity, message: same ? "An equivalent record already exists under this identifier." : "This identifier already exists with materially different fields." });
    return { classification: same ? "duplicate_existing" : "conflict_existing", issues };
  }

  const missing = [];
  const checkRef = (ref) => {
    if (!ref || !corpusIndex.entities.has(keyOf(ref.refType, ref.refId))) missing.push(keyOf(ref && ref.refType || "unknown", ref && ref.refId || "missing"));
  };
  if (submission.recordType === "edge") {
    checkRef(p.edge.source);
    checkRef(p.edge.target);
  }
  if (submission.recordType === "claim_evidence") {
    const sourceRef = p.evidence && p.evidence.sourceRef;
    const sourceId = typeof sourceRef === "string" ? sourceRef.replace(/^source:/, "") : "";
    if (!sourceId || !corpusIndex.entities.has(keyOf("source", sourceId))) missing.push(keyOf("source", sourceId || "missing"));
    const claimId = p.claim && p.claim.claimId;
    if (claimId && corpusIndex.entities.has(keyOf("claim", claimId))) {
      const existingClaim = corpusIndex.entities.get(keyOf("claim", claimId));
      if (existingClaim.statement !== p.claim.statement) issues.push({ code: "candidate.claim_conflict", ref: keyOf("claim", claimId), message: "Claim ID exists with a different statement." });
    }
  }
  if (missing.length) {
    issues.push({ code: "candidate.unresolved_references", refs: [...new Set(missing)], message: "One or more typed references do not resolve in the current corpus snapshot." });
    return { classification: "needs_reference_resolution", issues };
  }
  if (issues.length) return { classification: "conflict_existing", issues };
  return { classification: "ready_for_review", issues };
}

/**
 * Prepare candidates for human review. This is not authorization, persistence,
 * or a decision that a candidate is factually true.
 */
function stageSubmissionText(text, corpus, options = {}) {
  if (!corpus || corpus.valid !== true) {
    return {
      valid: false, format: options.format || "json", records: [],
      errors: [{ code: "staging.corpus_not_valid", message: "A validated corpus snapshot is required before staging." }],
      warnings: [], dryRun: true, committed: false
    };
  }
  const imported = parseSubmissionText(text, options);
  const corpusIndex = indexCorpus(corpus);
  const seen = new Map();
  const records = imported.records.map((item) => {
    const submission = item.submission;
    const compared = compareExisting(submission, corpusIndex);
    const identity = candidateIdentity(submission);
    let classification = compared.classification;
    const issues = [...compared.issues];
    if (identity && seen.has(identity) && !["duplicate_existing", "conflict_existing"].includes(classification)) {
      const previous = seen.get(identity);
      const same = JSON.stringify(previous.payload) === JSON.stringify(submission.payload);
      classification = same ? "duplicate_in_batch" : "conflict_in_batch";
      issues.push({ code: same ? "candidate.duplicate_in_batch" : "candidate.batch_identity_conflict", ref: identity, message: same ? "Equivalent candidate identity appears earlier in this batch." : "This candidate identity appears earlier in the batch with different payload fields." });
    } else if (identity) {
      seen.set(identity, submission);
    }
    const fingerprint = crypto.createHash("sha256").update(JSON.stringify(submission)).digest("hex");
    return {
      index: item.index, line: item.line,
      submissionId: submission.submissionId,
      recordType: submission.recordType,
      classification,
      issues,
      fingerprint: { algorithm: "sha256", value: fingerprint },
      provenance: submission.provenance,
      idempotencyKey: submission.idempotencyKey,
      submission,
      reviewRequired: true,
      committed: false
    };
  });
  return {
    valid: imported.valid && records.every((record) => record.classification === "ready_for_review"),
    format: imported.format,
    records,
    errors: imported.errors,
    warnings: imported.warnings,
    dryRun: true,
    committed: false,
    persistence: "not_configured",
    summary: records.reduce((acc, record) => { acc[record.classification] = (acc[record.classification] || 0) + 1; return acc; }, {})
  };
}

module.exports = { stageSubmissionText, indexCorpus, candidateIdentity };
