/**
 * Structural validation for Nexus Contextual Knowledge Graph data.
 *
 * Structural validity is not evidence that a represented claim is true.
 * Node contract: { id: non-empty string, label: non-empty string, ...optional fields }
 * Edge contract: { id: non-empty string, source: node ID, target: node ID,
 *                  weight?: finite number in [0, 1], ...optional fields }
 */
"use strict";

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateGraph(nodes, edges) {
  const errors = [];
  if (!Array.isArray(nodes)) errors.push("nodes must be an array");
  if (!Array.isArray(edges)) errors.push("edges must be an array");
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return { valid: false, errors };
  }

  const nodeIds = new Set();
  nodes.forEach((node, index) => {
    const where = `nodes[${index}]`;
    if (!isRecord(node)) {
      errors.push(`${where} must be an object`);
      return;
    }
    if (typeof node.id !== "string" || node.id.trim() === "") {
      errors.push(`${where}.id must be a non-empty string`);
    } else if (nodeIds.has(node.id)) {
      errors.push(`duplicate node id: ${node.id}`);
    } else {
      nodeIds.add(node.id);
    }
    if (typeof node.label !== "string" || node.label.trim() === "") {
      errors.push(`${where}.label must be a non-empty string`);
    }
    if (node.val !== undefined && (!Number.isFinite(node.val) || node.val < 0)) {
      errors.push(`${where}.val must be a finite non-negative number when provided`);
    }
  });

  const edgeIds = new Set();
  edges.forEach((edge, index) => {
    const where = `edges[${index}]`;
    if (!isRecord(edge)) {
      errors.push(`${where} must be an object`);
      return;
    }
    if (typeof edge.id !== "string" || edge.id.trim() === "") {
      errors.push(`${where}.id must be a non-empty string`);
    } else if (edgeIds.has(edge.id)) {
      errors.push(`duplicate edge id: ${edge.id}`);
    } else {
      edgeIds.add(edge.id);
    }
    if (typeof edge.source !== "string" || edge.source.trim() === "") {
      errors.push(`${where}.source must be a non-empty node ID`);
    } else if (!nodeIds.has(edge.source)) {
      errors.push(`${where}.source references missing node: ${edge.source}`);
    }
    if (typeof edge.target !== "string" || edge.target.trim() === "") {
      errors.push(`${where}.target must be a non-empty node ID`);
    } else if (!nodeIds.has(edge.target)) {
      errors.push(`${where}.target references missing node: ${edge.target}`);
    }
    if (edge.weight !== undefined &&
        (typeof edge.weight !== "number" || !Number.isFinite(edge.weight) ||
         edge.weight < 0 || edge.weight > 1)) {
      errors.push(`${where}.weight must be a finite number between 0 and 1 when provided`);
    }
  });

  return { valid: errors.length === 0, errors };
}

function parseSavedGraph(nodesText, edgesText, fallbackNodes, fallbackEdges) {
  const warnings = [];
  let nodes = fallbackNodes;
  let edges = fallbackEdges;

  try {
    if (nodesText !== null && nodesText !== undefined) nodes = JSON.parse(nodesText);
  } catch {
    warnings.push("Saved nodes could not be parsed; using demo defaults.");
  }
  try {
    if (edgesText !== null && edgesText !== undefined) edges = JSON.parse(edgesText);
  } catch {
    warnings.push("Saved edges could not be parsed; using demo defaults.");
  }

  const result = validateGraph(nodes, edges);
  if (!result.valid) {
    warnings.push("Saved graph failed structural validation; using demo defaults.");
    return { nodes: fallbackNodes, edges: fallbackEdges, warnings, validation: result };
  }
  return { nodes, edges, warnings, validation: result };
}

module.exports = { validateGraph, parseSavedGraph };
