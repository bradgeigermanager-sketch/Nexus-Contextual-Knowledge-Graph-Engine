// Nexus CKG Engine seed graph import fixture.
// Compatible with the current simple parser's variable-name endpoint convention.
// Note: the current importer does not preserve edge weights and only supports a limited Cypher subset.
CREATE (n1:ENTITY {id: 'n1', label: 'User Query', desc: 'Active user query payload seeking quarterly performance analysis'})
CREATE (n2:CKG {id: 'n2', label: 'Financial Report', desc: 'Core Contextual Knowledge Graph entity representing SEC 10-Q filings'})
CREATE (n3:TEMPORAL {id: 'n3', label: 'Q3 2026', desc: 'Temporal constraint filter set to current fiscal quarter'})
CREATE (n4:SPATIAL {id: 'n4', label: 'North America', desc: 'Geographic entity bound to regional operational centers'})
CREATE (n5:TOPICAL {id: 'n5', label: 'Revenue Growth', desc: 'Topical domain topic vector for fiscal expansion and margins'})
CREATE (n6:CKG {id: 'n6', label: 'AI Market Trend', desc: 'Macroeconomic market trends generated from LLM extractions'})
CREATE (n7:CONTEXT {id: 'n7', label: 'Regulatory Policy', desc: 'Compliance & Governance restriction layers'})
CREATE (n8:ENTITY {id: 'n8', label: 'Executive Briefing', desc: 'Generated synthesis document target for RAG retrieval'})
CREATE (n1)-[:REFERENCES {weight: 0.9}]->(n2)
CREATE (n2)-[:TEMPORAL_SCOPE {weight: 0.8}]->(n3)
CREATE (n2)-[:SPATIAL_BOUND {weight: 0.85}]->(n4)
CREATE (n2)-[:HAS_TOPIC {weight: 0.95}]->(n5)
CREATE (n5)-[:CORRELATED_WITH {weight: 0.75}]->(n6)
CREATE (n1)-[:CONSTRAINED_BY {weight: 0.88}]->(n7)
CREATE (n6)-[:REGIONAL_IMPACT {weight: 0.7}]->(n4)
CREATE (n2)-[:SYNTHESIZES_INTO {weight: 0.92}]->(n8)
