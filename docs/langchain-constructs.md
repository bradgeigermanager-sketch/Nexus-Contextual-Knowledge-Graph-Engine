# LangChain-style orchestration constructs

## Purpose and status

This document defines a framework-neutral construct catalog with a LangChain adapter profile. It is a data-model and schema foundation, not an installed LangChain runtime. The current browser application does not execute these records.

The model separates:
1. **Construct definition** — what a component is, its contract, configuration, and intended role.
2. **Composition graph** — which constructs feed, call, retrieve from, or depend on other constructs.
3. **Runtime binding** — the adapter and concrete implementation used when execution is enabled.
4. **Execution record** — inputs/outputs metadata, timestamps, errors, permissions, and provenance for a specific run.

## Initial construct families

| Family | Common LangChain-style examples | Core fields to model |
|---|---|---|
| Prompt | PromptTemplate, ChatPromptTemplate | template/messages, variables, partial variables, input schema |
| Model | chat model, text model, embedding model | provider, model identifier, parameters, capabilities, secret references |
| Runnable | RunnableSequence, RunnableParallel, RunnableLambda, RunnablePassthrough | ordered steps, branches, callable reference, input/output contract |
| Output parser | string/JSON/Pydantic-style parser | target format, schema, validation behavior, error strategy |
| Retriever | vector-store retriever, contextual retriever | query contract, source collection, filters, ranking policy |
| Store | vector store, document store, key-value store | backend adapter, collection/index, retention and access rules |
| Tool | structured tool, search tool, application function | name, description, input schema, permission scope, side-effect class |
| Agent | tool-using agent, structured-chat agent | model ref, tool allowlist, stop conditions, iteration limits |
| Chain / workflow | retrieval QA, map/reduce, sequential pipeline | steps, branching, error handling, output contract |
| Memory / history | chat history, summary memory adapter | scope, retention, identity key, privacy policy, read/write behavior |
| Callback / trace | tracing, metrics, audit callbacks | event types, redaction policy, destination, failure behavior |

Names are illustrative compatibility labels, not claims that every class exists in every LangChain version. Adapter packages evolve; record the target package, version, and tested capability explicitly.

## Canonical construct record

A construct record should have a stable ID and immutable version ID; a family and construct type; a display name; an input/output contract; explicit configuration; dependency references; adapter metadata; status; provenance; and security policy. Credentials must be represented as secret references, never embedded values.

The schema permits extensible configuration while validating common structure. Framework-specific payloads belong under `configuration` and should be validated by the corresponding adapter.

## Composition and execution semantics

- A composition is a directed graph of construct versions and typed links such as `feeds`, `calls`, `retrieves`, `parses`, `branches_to`, and `observes`.
- Validate referenced IDs and versions before accepting a composition.
- Detect cycles by default; permit them only when the execution adapter explicitly supports bounded loops and has iteration/time limits.
- Keep data flow separate from evidence relationships. A retriever returning a source does not establish that a claim is true.
- Treat retrieved text and tool output as untrusted data, not instructions that override system policy.
- Declare tool permissions, network/data access, side effects, timeouts, token/cost limits, and human approval requirements before execution.
- Store run metadata and provenance separately from the reusable construct definition. Redact secrets and sensitive payloads from traces.
- A model or agent record is not itself a model, and a saved graph does not imply inference is implemented.

## Example

```json
{
  "constructId": "construct-retrieval-answer-demo",
  "versionId": "construct-retrieval-answer-demo@1",
  "family": "workflow",
  "constructType": "retrieval_augmented_answer",
  "label": "Illustrative retrieval-and-answer pipeline",
  "status": "proposed",
  "adapter": {
    "framework": "langchain",
    "package": "langchain",
    "versionConstraint": "explicitly-pin-at-deployment",
    "capability": "declarative-example"
  },
  "inputContract": {
    "type": "object",
    "required": ["question"],
    "properties": { "question": { "type": "string" } }
  },
  "outputContract": {
    "type": "object",
    "required": ["answer", "source_refs"],
    "properties": {
      "answer": { "type": "string" },
      "source_refs": { "type": "array", "items": { "type": "string" } }
    }
  },
  "configuration": {
    "retrieverRef": "construct-demo-retriever@1",
    "promptRef": "construct-demo-prompt@1",
    "modelRef": "construct-demo-model@1",
    "parserRef": "construct-demo-parser@1",
    "requireSourceReferences": true
  },
  "dependencies": [
    "construct-demo-retriever@1",
    "construct-demo-prompt@1",
    "construct-demo-model@1",
    "construct-demo-parser@1"
  ],
  "security": {
    "executionEnabled": false,
    "permissions": [],
    "secretRefs": [],
    "maxIterations": 1,
    "timeoutMs": 30000,
    "humanApproval": "required-before-enabling"
  },
  "provenance": {
    "createdBy": "repository-fixture",
    "createdAt": "2026-10-28T00:00:00Z",
    "synthetic": true
  }
}
```

This is a synthetic catalog example. It references illustrative component IDs to explain the shape; it is not an executable chain.

## Relationship to Nexus artifacts

A construct can be referenced by a higher-order Nexus artifact using `refType: "process"` or `refType: "collection"` where suitable, or by a future dedicated `orchestration_construct` reference type. Prefer adding the dedicated type once cross-reference validation and migration rules are implemented. Do not silently reinterpret construct IDs as graph-node IDs.

Recommended future additions are: schema-driven validation tests, a composition validator, a LangChain version/capability compatibility registry, safe adapter execution behind explicit opt-in, trace-to-evidence linking, and a UI for editing construct graphs.
