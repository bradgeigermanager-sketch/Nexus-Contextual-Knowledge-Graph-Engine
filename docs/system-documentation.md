# System documentation / توثيق النظام

This directory provides two complementary explanations of the system in each supported language: a technical read-out and a plain-language guide.

## Languages
- [توثيق النظام — العربية](i18n/ar/system-overview.md)
- [System documentation — English](i18n/en/system-overview.md)
- [Dokumentacja systemu — polski](i18n/pl/system-overview.md)
- [Systemdokumentation — Deutsch](i18n/de/system-overview.md)
- [Documentation du système — français](i18n/fr/system-overview.md)
- [Dokumentasi sistem — Bahasa Indonesia](i18n/id/system-overview.md)
- [सिस्टम दस्तावेज़ — हिन्दी](i18n/hi/system-overview.md)
- [系统文档 — 简体中文](i18n/zh/system-overview.md)
- [Документация системы — русский язык](i18n/ru/system-overview.md)
- [Nyaraka za mfumo — Kiswahili](i18n/sw/system-overview.md)
- [Τεκμηρίωση συστήματος — Ελληνικά](i18n/el/system-overview.md)
- [システム文書 — 日本語](i18n/ja/system-overview.md)
- [Documentación del sistema — español](i18n/es/system-overview.md)

## How to use the documents
- **Technical read-out:** intended for developers, reviewers, data architects, maintainers, and technical researchers.
- **Plain-language guide:** intended for readers with little or no technical background.
- The technical and plain-language sections are paired in each language file to reduce drift.
- English is the terminology-control version. When technical concepts change, update English first, then update every translation in the same documentation change.
- Keep product status accurate: distinguish implemented, partially implemented, planned, and unverified features.
- Do not translate synthetic examples into factual claims. Synthetic fixture records are demonstrations, not real citations.
- Preserve distinctions among source reliability, evidence stance, extraction confidence, similarity, relevance, and factual truth.
- Do not claim that neural inference exists until a model-backed implementation is actually present and tested.

## Maintenance procedure
1. Review code, schemas, tests, and current workflow results for the change.
2. Update the English technical description and plain-language explanation.
3. Update all 12 translated language files in the same pull request.
4. Check technical terminology, Unicode, right-to-left Arabic rendering, Simplified Chinese script, and Japanese text.
5. Update the documentation change log and mark any translation needing specialist review.
6. Run the repository test suite and report the exact commit and workflow status; do not infer success from an earlier commit.

## Scope note
These documents describe the repository state known at the time of writing. The app is still evolving. User-facing reference and artifact editors, broad live-source ingestion, and trained neural-network inference are not described as implemented features.
