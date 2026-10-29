# Submission review workflow

## Purpose and boundary

The review layer groups dry-run staging candidates by classification and validates a proposed human decision against the candidate fingerprint and a caller-supplied corpus snapshot identifier. It is a review contract, not an authorization system or persistence service.

## Review queue

`src/submission-review.js` exports:

- `summarizeStagingForReview(stagingResult)`: groups records by status while preserving candidate index, submission ID, record type, fingerprint, idempotency key, issues, and commit state.
- `validateReviewDecision(decision, candidate, expectedCorpusSnapshotId)`: validates decision fields and binding to a staged candidate and, when supplied, the expected snapshot identifier.

The supported decisions are `accept`, `reject`, `request_more_evidence`, and `defer`. Every decision requires a rationale, reviewer subject, timestamp, candidate fingerprint, and corpus snapshot ID. `request_more_evidence` also requires at least one explicit follow-up item. Evidence references can be recorded as typed references.

## Snapshot and fingerprint rules

A review decision should be made against an immutable or otherwise reproducibly identified corpus snapshot. The snapshot ID must be assigned by the system that creates the snapshot; this helper does not calculate or authenticate it. The candidate fingerprint currently uses FNV-1a 32-bit for deterministic change detection only. It is not collision-resistant, is not a signature, and must not be used as proof of integrity or identity.

## Trust and persistence limits

- A reviewer subject is supplied data; this module does not authenticate the person or verify roles.
- The helper validates shape and consistency; it does not decide whether evidence is sufficient or whether a candidate is factually correct.
- A decision is not a commit instruction. The helper does not write to the corpus or create an audit record.
- Before persistent review decisions are enabled, implement authenticated identities, server-side role authorization, immutable audit events, concurrency-safe snapshot checks, and durable storage.
- Accepting a candidate must not silently overwrite an existing record. Re-run reference/conflict checks against the exact snapshot and require explicit resolution of conflicts before a separately authorized commit.
