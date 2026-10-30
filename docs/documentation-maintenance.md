# Documentation maintenance policy

## Deliverables
Every supported language has one system overview containing:
- a technical read-out for implementers and reviewers;
- a plain-language explanation for readers with minimal technical literacy.

Supported languages: Arabic (ar), English (en), Polish (pl), German (de), French (fr), Indonesian (id), Hindi (hi), Simplified Chinese (zh), Russian (ru), Swahili (sw), Greek (el), Japanese (ja), and Spanish (es).

## Source of truth
English terminology and status are the control version. Translations should preserve meaning, uncertainty, scope, and implementation status—not merely word-for-word phrasing. Where a translation is uncertain, mark it for review instead of silently changing the technical meaning.

## Required status vocabulary
- **Implemented:** present in the repository and usable for the described scope.
- **Partial/limited:** exists but has explicit limitations.
- **Planned:** proposed future work; not available as a current feature.
- **Unverified:** not confirmed against the current commit or current automated workflow.

## Update checklist
- [ ] Inspect changed source code, schemas, and tests.
- [ ] Confirm current CI status for the exact commit.
- [ ] Update English technical and plain-language sections.
- [ ] Update all 12 translations in the same change.
- [ ] Verify cross-language feature status and terminology.
- [ ] Update links and this documentation index.
- [ ] Note specialist review still needed, if any.
