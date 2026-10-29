# Active Web Endpoint Layer

## Purpose

Nexus can connect to curated external HTTP APIs through versioned endpoint profiles instead of scattering URLs, request rules, and trust assumptions throughout graph logic. Endpoint responses are external observations, not automatically verified facts. The initial profiles are read-oriented: GitHub REST API and Wikidata Query Service.

## Repository components

- `schemas/web-endpoint.schema.json`: endpoint profile contract.
- `data/endpoints/registry.json`: curated endpoint profiles.
- `src/web-endpoint-client.js`: HTTPS-only request helper with method, host, path, timeout, redirect, and response-size controls.
- `test/web-endpoint-client.test.js`: profile and policy tests.

## Request flow

1. Select a registered profile by stable `endpointId`.
2. Validate its HTTPS URL, exact hostname allowlist, method policy, security flags, and resource limits.
3. Construct a relative path within the configured base URL. Full URLs, protocol-relative paths, and paths escaping the base are rejected.
4. Send the request with redirects disabled and a bounded timeout.
5. Enforce a response-size limit and parse JSON only when the profile declares a JSON response.
6. Return status and selected response metadata. A non-success HTTP response is reported without treating its body as a successful result.

The client does not fetch a profile's `baseUrl` automatically; callers must invoke `requestEndpoint`. Profiles marked enabled are selectable, but deployment policy and network egress rules must still permit the destination.

## Security boundary and deployment requirements

- HTTPS only; credentials are not allowed in URLs.
- Exact host allowlists; local, loopback, link-local, private IPv4, and common local hostnames are rejected when present as URL literals/names.
- Redirects are errors, preventing a trusted endpoint from redirecting to an unapproved destination.
- Only GET, POST, and HEAD are supported. Endpoint profiles may allow fewer methods.
- POST bodies are bounded and must be prepared by a format-specific adapter. The client does not execute imported scripts or infer query languages.
- Response sizes and request time are bounded.
- Secret values must not be stored in endpoint profiles or committed to the repository. Future authentication should resolve named environment/secret references at runtime.
- The current client intentionally does not implement authentication, retries, caching, scheduling, webhook receivers, or automatic graph ingestion.
- Application deployments must additionally enforce outbound network restrictions and DNS/IP checks at connection time. A hostname allowlist alone does not fully prevent DNS rebinding or an approved public hostname resolving to a private address.
- Endpoint output is untrusted input. Preserve endpoint ID, request timestamp, HTTP status, ETag/Last-Modified when present, content hash, and retrieval provenance when transforming a response into graph records.

## Current profiles

- `github-rest-api`: public GitHub REST API, GET/HEAD.
- `wikidata-query-service`: public read-only Wikidata SPARQL service, GET/POST.

These profiles are examples of supported endpoint contracts, not guarantees of service availability or unlimited access. Respect each provider's terms, authentication requirements, rate limits, and acceptable-use policies. Add endpoint-specific throttling before production or bulk use.

## Not yet implemented

The client is not a general-purpose crawler or browser. It does not crawl arbitrary links, execute JavaScript, accept inbound webhooks, resolve DNS to validate destination IPs at connection time, automatically ingest results, or write to the graph. Those features need separate policies and tests.
