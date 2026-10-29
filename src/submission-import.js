"use strict";

const { normalizeSubmission } = require("./submission-contracts");

function parseSubmissionText(text, options = {}) {
  const format = options.format || "json";
  const maxBytes = options.maxBytes === undefined ? 2_000_000 : options.maxBytes;
  const maxRecords = options.maxRecords === undefined ? 5_000 : options.maxRecords;
  if (typeof text !== "string") return { valid: false, format, records: [], errors: [{ code: "import.text_required", message: "Input must be text." }], warnings: [] };
  if (Buffer.byteLength(text, "utf8") > maxBytes) return { valid: false, format, records: [], errors: [{ code: "import.payload_too_large", message: "Input exceeds configured byte limit." }], warnings: [] };
  if (!["json", "jsonl"].includes(format)) return { valid: false, format, records: [], errors: [{ code: "import.format_unsupported", message: "Only JSON and JSONL are implemented." }], warnings: [] };

  const records = [], errors = [], warnings = [];
  let parsedValues = [];
  if (format === "json") {
    try {
      const parsed = JSON.parse(text);
      parsedValues = Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      return { valid: false, format, records: [], errors: [{ code: "import.json_parse_error", message: error.message }], warnings };
    }
  } else {
    for (const [index, line] of text.split(/\r?\n/).entries()) {
      if (!line.trim()) continue;
      try { parsedValues.push({ line: index + 1, value: JSON.parse(line) }); }
      catch (error) { errors.push({ code: "import.jsonl_parse_error", line: index + 1, message: error.message }); }
    }
  }

  if (parsedValues.length > maxRecords) return { valid: false, format, records: [], errors: [{ code: "import.record_limit_exceeded", message: "Input exceeds configured record limit." }], warnings };
  for (let index = 0; index < parsedValues.length; index += 1) {
    const item = format === "jsonl" ? parsedValues[index] : { line: null, value: parsedValues[index] };
    const result = normalizeSubmission(item.value, options);
    if (!result.valid) {
      errors.push({ code: "import.record_invalid", line: item.line, index, issues: result.errors });
      continue;
    }
    records.push({ index, line: item.line, submission: result.normalized });
    warnings.push(...result.warnings.map((warning) => ({ ...warning, index, line: item.line })));
  }
  return { valid: errors.length === 0, format, records, errors, warnings, dryRun: true, committed: false };
}

module.exports = { parseSubmissionText };
