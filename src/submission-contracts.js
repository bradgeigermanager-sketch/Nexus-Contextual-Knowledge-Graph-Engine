"use strict";
const QUERY_SCHEMA = "nexus-query/v1";
const SUBMISSION_SCHEMA = "nexus-submission/v1";
const RECORD_TYPES = new Set(["node", "edge", "source", "claim_evidence"]);
const OPERATIONS = new Set(["create_candidate", "upsert_candidate", "propose_supersession"]);
const REF_TYPES = new Set(["graph_node", "graph_edge", "source", "claim", "evidence_link", "artifact"]);
const QUERY_INTENTS = new Set(["lookup", "traverse", "traverse_and_filter", "compare_paths", "find_relationships"]);
const OUTPUT_FORMATS = new Set(["typed_json", "jsonl", "csv", "graphml"]);
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const issue = (code, message, path = null) => ({ code, message, path, severity: "error" });
function validateReference(ref, path) {
  if (!isObject(ref)) return [issue("reference.object_required", "Reference must be an object.", path)];
  const errors = [];
  if (!REF_TYPES.has(ref.refType)) errors.push(issue("reference.type_invalid", "Unsupported reference type.", path + ".refType"));
  if (typeof ref.refId !== "string" || !ref.refId.trim()) errors.push(issue("reference.id_required", "Reference ID must be a non-empty string.", path + ".refId"));
  return errors;
}
/** Normalize an envelope only; no authorization, corpus lookup, or persistence occurs. */
function normalizeSubmission(input, options = {}) {
  const errors = [], warnings = [];
  if (!isObject(input)) return { valid: false, normalized: null, errors: [issue("submission.object_required", "Submission must be a JSON object.")], warnings };
  if (input.schema !== SUBMISSION_SCHEMA) errors.push(issue("submission.schema_unsupported", "schema must be nexus-submission/v1.", "$.schema"));
  if (typeof input.submissionId !== "string" || !input.submissionId.trim()) errors.push(issue("submission.id_required", "submissionId is required.", "$.submissionId"));
  if (!RECORD_TYPES.has(input.recordType)) errors.push(issue("submission.record_type_invalid", "Unsupported recordType.", "$.recordType"));
  if (!OPERATIONS.has(input.operation)) errors.push(issue("submission.operation_invalid", "Unsupported operation.", "$.operation"));
  if (!isObject(input.payload)) errors.push(issue("submission.payload_required", "payload must be an object.", "$.payload"));
  if (!isObject(input.provenance) || typeof input.provenance.channel !== "string" || !input.provenance.channel.trim()) errors.push(issue("submission.provenance_required", "provenance.channel is required.", "$.provenance.channel"));
  if (typeof input.idempotencyKey !== "string" || input.idempotencyKey.trim().length < 8 || input.idempotencyKey.length > 200) errors.push(issue("submission.idempotency_key_invalid", "idempotencyKey must contain 8 to 200 characters.", "$.idempotencyKey"));
  const p = input.payload;
  if (isObject(p) && RECORD_TYPES.has(input.recordType)) {
    if (input.recordType === "node") {
      if (typeof p.externalId !== "string" || !p.externalId.trim()) errors.push(issue("node.external_id_required", "Node payload requires externalId.", "$.payload.externalId"));
      if (!isObject(p.node) || typeof p.node.type !== "string" || !p.node.type.trim() || typeof p.node.label !== "string" || !p.node.label.trim()) errors.push(issue("node.fields_required", "Node payload requires node.type and node.label.", "$.payload.node"));
    } else if (input.recordType === "edge") {
      if (typeof p.externalId !== "string" || !p.externalId.trim()) errors.push(issue("edge.external_id_required", "Edge payload requires externalId.", "$.payload.externalId"));
      if (!isObject(p.edge)) errors.push(issue("edge.object_required", "Edge payload requires an edge object.", "$.payload.edge"));
      else {
        errors.push(...validateReference(p.edge.source, "$.payload.edge.source"), ...validateReference(p.edge.target, "$.payload.edge.target"));
        if (typeof p.edge.relationshipType !== "string" || !p.edge.relationshipType.trim()) errors.push(issue("edge.relationship_required", "Edge requires relationshipType.", "$.payload.edge.relationshipType"));
      }
    } else if (input.recordType === "source") {
      if (!isObject(p.source) || !["sourceId", "sourceType", "title"].every((k) => typeof p.source[k] === "string" && p.source[k].trim())) errors.push(issue("source.fields_required", "Source requires sourceId, sourceType, and title.", "$.payload.source"));
    } else {
      if (!isObject(p.claim) || typeof p.claim.claimId !== "string" || !p.claim.claimId.trim() || typeof p.claim.statement !== "string" || !p.claim.statement.trim()) errors.push(issue("claim.fields_required", "Claim/evidence payload requires claim.claimId and claim.statement.", "$.payload.claim"));
      if (!isObject(p.evidence) || !["evidenceId", "sourceRef", "stance"].every((k) => typeof p.evidence[k] === "string" && p.evidence[k].trim())) errors.push(issue("evidence.fields_required", "Evidence requires evidenceId, sourceRef, and stance.", "$.payload.evidence"));
    }
  }
  const channels = new Set(["api", "ui", "cli", "file_import", "agent", "connector", "manual"]);
  if (isObject(input.provenance) && !channels.has(input.provenance.channel)) warnings.push({ code: "provenance.channel_extension", message: "Unknown provenance channel retained for adapter-specific handling.", path: "$.provenance.channel", severity: "warning" });
  if (input.dryRun === false) warnings.push({ code: "submission.commit_not_performed", message: "This library validates envelopes only; it never commits records.", path: "$.dryRun", severity: "warning" });
  const normalized = errors.length ? null : {
    schema: SUBMISSION_SCHEMA, submissionId: input.submissionId.trim(), recordType: input.recordType, operation: input.operation,
    payload: input.payload, provenance: input.provenance, idempotencyKey: input.idempotencyKey.trim(),
    submittedAt: input.submittedAt || options.now || null, submittedBy: input.submittedBy || null, dryRun: true
  };
  return { valid: errors.length === 0, normalized, errors, warnings };
}
function validateQueryEnvelope(input) {
  const errors = [];
  if (!isObject(input)) return { valid: false, errors: [issue("query.object_required", "Query must be a JSON object.")] };
  if (input.schema !== QUERY_SCHEMA) errors.push(issue("query.schema_unsupported", "schema must be nexus-query/v1.", "$.schema"));
  if (typeof input.queryId !== "string" || !input.queryId.trim()) errors.push(issue("query.id_required", "queryId is required.", "$.queryId"));
  if (!QUERY_INTENTS.has(input.intent)) errors.push(issue("query.intent_invalid", "Unsupported query intent.", "$.intent"));
  errors.push(...validateReference(input.start, "$.start"));
  if (input.target != null) errors.push(...validateReference(input.target, "$.target"));
  if (!isObject(input.constraints)) errors.push(issue("query.constraints_required", "constraints must be an object.", "$.constraints"));
  else {
    if (input.constraints.maxDepth !== undefined && (!Number.isInteger(input.constraints.maxDepth) || input.constraints.maxDepth < 0 || input.constraints.maxDepth > 32)) errors.push(issue("query.max_depth_invalid", "maxDepth must be an integer from 0 to 32.", "$.constraints.maxDepth"));
    if (input.constraints.maxResults !== undefined && (!Number.isInteger(input.constraints.maxResults) || input.constraints.maxResults < 1 || input.constraints.maxResults > 10000)) errors.push(issue("query.max_results_invalid", "maxResults must be an integer from 1 to 10000.", "$.constraints.maxResults"));
  }
  if (!isObject(input.output) || !OUTPUT_FORMATS.has(input.output.format)) errors.push(issue("query.output_invalid", "Unsupported output.format.", "$.output.format"));
  if (input.filters !== undefined && !isObject(input.filters)) errors.push(issue("query.filters_invalid", "filters must be an object.", "$.filters"));
  if (isObject(input.filters)) for (const key of ["refTypes", "statuses", "relationshipTypes", "relationshipKinds", "contextDomains"]) {
    if (input.filters[key] !== undefined && (!Array.isArray(input.filters[key]) || input.filters[key].some((v) => typeof v !== "string" || !v.trim()))) errors.push(issue("query.filter_invalid", key + " must be an array of non-empty strings.", "$.filters." + key));
  }
  return { valid: errors.length === 0, errors };
}
module.exports = { normalizeSubmission, validateQueryEnvelope };
