"use strict";

const { isIP } = require("node:net");

const SAFE_METHODS = new Set(["GET", "POST", "HEAD"]);
const SECRET_HEADER_DENYLIST = new Set(["host", "content-length", "cookie", "set-cookie", "connection", "transfer-encoding", "upgrade", "proxy-authorization"]);
const PRIVATE_IPV4 = (ip) => {
  const p = ip.split(".").map(Number);
  return p.length === 4 && (p[0] === 10 || p[0] === 127 || p[0] === 0 || (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168) || p[0] >= 224);
};
function isPrivateOrLocalHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (["localhost", "localhost.localdomain", "metadata.google.internal"].includes(host) || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  const ipType = isIP(host);
  if (ipType === 4) return PRIVATE_IPV4(host);
  if (ipType === 6) return host === "::1" || host === "::" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
  return false;
}
function validateEndpointProfile(profile) {
  const errors = [];
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return { valid: false, errors: ["profile must be an object"] };
  let url;
  try { url = new URL(profile.baseUrl); } catch { errors.push("baseUrl must be an absolute URL"); }
  if (url) {
    if (url.protocol !== "https:") errors.push("Only HTTPS endpoint URLs are permitted");
    if (url.username || url.password) errors.push("Credentials must not be embedded in URLs");
    if (isPrivateOrLocalHost(url.hostname)) errors.push("Local and private-network hosts are not permitted");
    if (!Array.isArray(profile.allowedHosts) || !profile.allowedHosts.includes(url.hostname.toLowerCase())) errors.push("baseUrl hostname must exactly match an allowedHosts entry");
  }
  if (!Array.isArray(profile.allowedMethods) || profile.allowedMethods.some((m) => !SAFE_METHODS.has(m))) errors.push("allowedMethods may contain only GET, POST, or HEAD");
  if (!profile.security || profile.security.requireHttps !== true || profile.security.allowRedirects !== false || profile.security.allowPrivateNetwork !== false) errors.push("security must require HTTPS, disable redirects, and disallow private networks");
  if (!profile.limits || !Number.isInteger(profile.limits.timeoutMs) || profile.limits.timeoutMs < 100 || profile.limits.timeoutMs > 30000 || !Number.isInteger(profile.limits.maxResponseBytes) || profile.limits.maxResponseBytes < 1 || profile.limits.maxResponseBytes > 5000000) errors.push("endpoint limits are missing or outside safe bounds");
  return { valid: errors.length === 0, errors };
}
function appendPath(baseUrl, path = "") {
  if (typeof path !== "string" || path.startsWith("//") || path.includes("\\") || /^[a-z][a-z0-9+.-]*:/i.test(path)) throw new Error("path must be a relative URL path");
  const base = new URL(baseUrl);
  const result = new URL(path.replace(/^\/+/, ""), base.toString().endsWith("/") ? base : new URL(base.toString() + "/"));
  if (result.origin !== base.origin || !result.pathname.startsWith(base.pathname.endsWith("/") ? base.pathname : base.pathname + "/") && result.pathname !== base.pathname) throw new Error("request path escapes the configured base URL");
  return result;
}
async function requestEndpoint(profile, options = {}) {
  const profileCheck = validateEndpointProfile(profile);
  if (!profileCheck.valid) return { ok: false, status: null, error: { code: "endpoint.profile_invalid", messages: profileCheck.errors } };
  if (profile.enabled !== true) return { ok: false, status: null, error: { code: "endpoint.disabled", message: "Endpoint profile is disabled." } };
  const method = options.method || "GET";
  if (!profile.allowedMethods.includes(method) || !SAFE_METHODS.has(method)) return { ok: false, status: null, error: { code: "endpoint.method_not_allowed", message: "Method is not enabled for this endpoint." } };
  let url;
  try { url = appendPath(profile.baseUrl, options.path || ""); }
  catch (error) { return { ok: false, status: null, error: { code: "endpoint.path_invalid", message: error.message } }; }
  const headers = { ...(profile.defaultHeaders || {}), ...(options.headers || {}) };
  for (const name of Object.keys(headers)) {
    if (SECRET_HEADER_DENYLIST.has(name.toLowerCase()) || /\r|\n/.test(name) || /\r|\n/.test(String(headers[name]))) return { ok: false, status: null, error: { code: "endpoint.header_invalid", message: "Unsafe request header." } };
  }
  let body;
  if (method === "POST") {
    if (typeof options.body !== "string") return { ok: false, status: null, error: { code: "endpoint.body_required", message: "POST body must be a string prepared by a format-specific adapter." } };
    body = options.body;
    if (Buffer.byteLength(body, "utf8") > 1000000) return { ok: false, status: null, error: { code: "endpoint.request_too_large", message: "Request body exceeds 1 MB." } };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), profile.limits.timeoutMs);
  try {
    const response = await fetch(url, { method, headers, body, signal: controller.signal, redirect: "error" });
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > profile.limits.maxResponseBytes) return { ok: false, status: response.status, error: { code: "endpoint.response_too_large", message: "Response exceeds configured size limit." } };
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > profile.limits.maxResponseBytes) return { ok: false, status: response.status, error: { code: "endpoint.response_too_large", message: "Response exceeds configured size limit." } };
    const text = bytes.toString("utf8");
    let data = text;
    if (profile.responseFormat === "json" || profile.responseFormat === "sparql-json") {
      try { data = JSON.parse(text); }
      catch { return { ok: false, status: response.status, error: { code: "endpoint.response_parse_error", message: "Endpoint response was not valid JSON." } }; }
    }
    return { ok: response.ok, status: response.status, headers: { contentType: response.headers.get("content-type"), etag: response.headers.get("etag"), lastModified: response.headers.get("last-modified") }, data: response.ok ? data : undefined, error: response.ok ? null : { code: "endpoint.http_error", message: "Endpoint returned a non-success status." } };
  } catch (error) {
    return { ok: false, status: null, error: { code: error.name === "AbortError" ? "endpoint.timeout" : "endpoint.request_failed", message: error.name === "AbortError" ? "Endpoint request timed out." : "Endpoint request failed." } };
  } finally { clearTimeout(timeout); }
}
module.exports = { validateEndpointProfile, requestEndpoint, isPrivateOrLocalHost };
