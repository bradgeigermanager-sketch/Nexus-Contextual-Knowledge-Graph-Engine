"use strict";

const { loadNeuralArtifactCorpus } = require("./neural-artifact-corpus");
const { queryNeuralArtifactCorpus } = require("./neural-artifact-query");
const { parseSubmissionText } = require("./submission-import");
const { stageSubmissionText } = require("./submission-staging");

/**
 * Shared application-facing facade for the portal's query and candidate-review flow.
 * It validates the corpus on load and never persists submitted candidates.
 */
function createPortalService(options = {}) {
  const corpus = options.corpus || loadNeuralArtifactCorpus({
    rootDir: options.rootDir,
    files: options.files,
    throwOnError: false
  });
  return Object.freeze({
    corpusStatus() {
      return { valid: corpus.valid, errors: [...corpus.errors], warnings: [...corpus.warnings] };
    },
    query(queryEnvelope) {
      if (!corpus.valid) {
        return { valid: false, errors: [...corpus.errors], result: null };
      }
      if (!queryEnvelope || typeof queryEnvelope !== "object") {
        return { valid: false, errors: ["query envelope must be an object"], result: null };
      }
      const query = queryEnvelope.query && typeof queryEnvelope.query === "object"
        ? queryEnvelope.query : queryEnvelope;
      try {
        const result = queryNeuralArtifactCorpus(corpus, query);
        return { valid: true, errors: [], result };
      } catch (error) {
        return { valid: false, errors: [error.message], result: null };
      }
    },
    previewSubmissions(text, importOptions = {}) {
      const result = parseSubmissionText(text, importOptions);
      return { ...result, committed: false, persistence: "not_configured" };
    },
    stageSubmissions(text, stageOptions = {}) {
      const result = stageSubmissionText(text, corpus, stageOptions);
      return { ...result, committed: false, persistence: "not_configured" };
    }
  });
}

module.exports = { createPortalService };
