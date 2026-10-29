"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { summarizeStagingForReview, validateReviewDecision } = require("../src/submission-review");

const candidate = { submissionId: "sub-1", classification: "ready_for_review", fingerprint: { algorithm: "fnv1a-32", value: "0123abcd" }, idempotencyKey: "key-1", issues: [], reviewRequired: true, committed: false };
const decision = (overrides = {}) => ({
  schema: "nexus-review-decision/v1", decisionId: "review-1", submissionId: "sub-1",
  candidateFingerprint: { algorithm: "fnv1a-32", value: "0123abcd" },
  corpusSnapshotId: "snapshot-2026-10-28", reviewer: { subject: "account:reviewer-17", role: "curator" },
  decidedAt: "2026-10-28T19:00:00Z", decision: "accept", rationale: "Payload and references reviewed.",
  ...overrides
});

test("review summary groups candidates by staging classification without losing review references", () => {
  const summary = summarizeStagingForReview({ dryRun: true, committed: false, records: [
    candidate, { ...candidate, index: 1, submissionId: "sub-2", classification: "conflict_existing" }
  ] });
  assert.equal(summary.valid, true);
  assert.equal(summary.counts.ready_for_review, 1);
  assert.equal(summary.counts.conflict_existing, 1);
  assert.equal(summary.groups.ready_for_review[0].fingerprint.value, "0123abcd");
  assert.equal(summary.committed, false);
});

test("review decision binds candidate fingerprint and corpus snapshot", () => {
  assert.equal(validateReviewDecision(decision(), candidate, "snapshot-2026-10-28").valid, true);
  const mismatch = validateReviewDecision(decision({ corpusSnapshotId: "old-snapshot" }), candidate, "snapshot-2026-10-28");
  assert.equal(mismatch.valid, false);
  assert.ok(mismatch.errors.some((error) => error.code === "review.snapshot_mismatch"));
  const fingerprint = validateReviewDecision(decision({ candidateFingerprint: { algorithm: "fnv1a-32", value: "ffffffff" } }), candidate);
  assert.ok(fingerprint.errors.some((error) => error.code === "review.fingerprint_mismatch"));
});

test("requesting more evidence requires concrete follow-up and rationale", () => {
  const result = validateReviewDecision(decision({ decision: "request_more_evidence" }), candidate);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.code === "review.follow_up_required"));
  const valid = validateReviewDecision(decision({ decision: "request_more_evidence", followUp: ["Provide the original source locator."] }), candidate);
  assert.equal(valid.valid, true);
});

test("review helpers do not claim authorization or persistence", () => {
  const result = validateReviewDecision(decision(), candidate);
  assert.equal(result.authorization, "not_checked");
  assert.equal(result.persistence, "not_configured");
});
