"use strict";

/**
 * Review helpers deliberately validate a proposed review record without
 * authenticating the reviewer or persisting the decision.
 */
const DECISIONS = new Set(["accept", "reject", "request_more_evidence", "defer"]);

function summarizeStagingForReview(staging) {
  if (!staging || !Array.isArray(staging.records)) {
    return { valid: false, error: "review.invalid_staging_result", groups: {}, counts: {} };
  }
  const groups = {};
  for (const record of staging.records) {
    const key = record.classification || "unclassified";
    if (!groups[key]) groups[key] = [];
    groups[key].push({
      index: record.index,
      submissionId: record.submissionId,
      recordType: record.recordType,
      classification: key,
      fingerprint: record.fingerprint,
      idempotencyKey: record.idempotencyKey,
      issues: record.issues || [],
      reviewRequired: record.reviewRequired !== false,
      committed: record.committed === true
    });
  }
  const counts = Object.fromEntries(Object.entries(groups).map(([key, records]) => [key, records.length]));
  return { valid: true, dryRun: staging.dryRun === true, committed: staging.committed === true, groups, counts, total: staging.records.length };
}

function validateReviewDecision(decision, candidate, expectedCorpusSnapshotId) {
  const errors = [];
  const requireString = (object, key, path) => {
    if (!object || typeof object[key] !== "string" || !object[key].trim()) {
      errors.push({ code: "review.required_string", path: path + "." + key });
    }
  };
  if (!decision || typeof decision !== "object" || Array.isArray(decision)) {
    return { valid: false, errors: [{ code: "review.decision_required", path: "$" }] };
  }
  requireString(decision, "decisionId", "$");
  requireString(decision, "submissionId", "$");
  requireString(decision, "corpusSnapshotId", "$");
  requireString(decision, "decidedAt", "$");
  requireString(decision, "rationale", "$");
  if (!decision.reviewer || typeof decision.reviewer !== "object" || Array.isArray(decision.reviewer)) {
    errors.push({ code: "review.reviewer_required", path: "$.reviewer" });
  } else {
    requireString(decision.reviewer, "subject", "$.reviewer");
  }
  if (!DECISIONS.has(decision.decision)) errors.push({ code: "review.decision_invalid", path: "$.decision" });
  if (typeof decision.decidedAt === "string") {
    const parsed = Date.parse(decision.decidedAt);
    if (!Number.isFinite(parsed) || !/^\d{4}-\d{2}-\d{2}T/.test(decision.decidedAt)) {
      errors.push({ code: "review.timestamp_invalid", path: "$.decidedAt" });
    }
  }
  if (typeof decision.rationale === "string" && decision.rationale.trim().length < 3) {
    errors.push({ code: "review.rationale_too_short", path: "$.rationale" });
  }
  if (decision.decision === "request_more_evidence" &&
      (!Array.isArray(decision.followUp) || decision.followUp.length === 0 ||
       decision.followUp.some((item) => typeof item !== "string" || !item.trim()))) {
    errors.push({ code: "review.follow_up_required", path: "$.followUp" });
  }
  if (!candidate || typeof candidate !== "object") {
    errors.push({ code: "review.candidate_required", path: "$candidate" });
  } else {
    if (decision.submissionId !== candidate.submissionId) errors.push({ code: "review.submission_mismatch", path: "$.submissionId" });
    if (!decision.candidateFingerprint || !candidate.fingerprint ||
        decision.candidateFingerprint.algorithm !== candidate.fingerprint.algorithm ||
        decision.candidateFingerprint.value !== candidate.fingerprint.value) {
      errors.push({ code: "review.fingerprint_mismatch", path: "$.candidateFingerprint" });
    }
  }
  if (typeof expectedCorpusSnapshotId === "string" &&
      decision.corpusSnapshotId !== expectedCorpusSnapshotId) {
    errors.push({ code: "review.snapshot_mismatch", path: "$.corpusSnapshotId" });
  }
  return { valid: errors.length === 0, errors, decision: errors.length === 0 ? decision : undefined,
    authorization: "not_checked", persistence: "not_configured" };
}

module.exports = { summarizeStagingForReview, validateReviewDecision, DECISIONS: [...DECISIONS] };
