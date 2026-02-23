/**
 * TRAVEL.aw Ecosystem Validator
 *
 * Validates nodes and edges against schemas (A9, A10), registries (A4-A7),
 * and business rules. See VALIDATION_CONTRACT.md (A12) for full specification.
 *
 * Usage: tsx tools/validate_ecosystem/validate_ecosystem.ts [--fixtures]
 *
 * Exit codes: 0 = pass, 1 = validation errors, 2 = runtime error
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "../..");

const PATHS = {
  nodeSchema: resolve(ROOT, "packages/contracts/schemas/ecosystem_node.schema.json"),
  edgeSchema: resolve(ROOT, "packages/contracts/schemas/ecosystem_edge.schema.json"),
  journeyStages: resolve(ROOT, "packages/contracts/registries/journey_stages.json"),
  capabilities: resolve(ROOT, "packages/contracts/registries/capabilities_registry.json"),
  providerTypes: resolve(ROOT, "packages/contracts/registries/provider_types.json"),
  relationshipTypes: resolve(ROOT, "packages/contracts/registries/relationship_types.json"),
  nodes: resolve(ROOT, "data/ecosystem/nodes.jsonl"),
  edges: resolve(ROOT, "data/ecosystem/edges.jsonl"),
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidationError {
  check: string;
  id: string;
  message: string;
}

interface ValidationReport {
  timestamp: string;
  valid: boolean;
  summary: {
    nodesChecked: number;
    edgesChecked: number;
    errorsFound: number;
  };
  errors: ValidationError[];
}

interface EcosystemNode {
  id: string;
  name: string;
  providerType: string;
  description: string;
  journeyStages: string[];
  capabilities: string[];
  addedVersion: string;
  url?: string;
  tags?: string[];
  notes?: string;
}

interface EcosystemEdge {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  addedVersion: string;
  description?: string;
  journeyContext?: string[];
  notes?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function loadJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, "utf-8").trim();
  if (content === "") return [];
  return content.split("\n").map((line) => JSON.parse(line) as T);
}

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

function getTestFixtures(): { nodes: EcosystemNode[]; edges: EcosystemEdge[] } {
  const validNodes: EcosystemNode[] = [
    {
      id: "OTA_BOOKING_COM",
      name: "Booking.com",
      providerType: "OTA",
      description: "Global OTA for hotels, flights, and car rentals.",
      journeyStages: ["J1", "J3"],
      capabilities: ["C-HOTEL-SEARCH", "C-BOOKING-TXN"],
      addedVersion: "0.2.0",
    },
    {
      id: "METASEARCH_GOOGLE_FLIGHTS",
      name: "Google Flights",
      providerType: "METASEARCH",
      description: "Flight metasearch engine by Google.",
      journeyStages: ["J1", "J3"],
      capabilities: ["C-FLIGHT-SEARCH", "C-PRICE-COMPARE"],
      addedVersion: "0.2.0",
    },
    {
      id: "REVIEW_PLATFORM_TRIPADVISOR",
      name: "TripAdvisor",
      providerType: "REVIEW_PLATFORM",
      description: "Travel reviews, ratings, and booking.",
      journeyStages: ["J1", "J3", "J7"],
      capabilities: ["C-REVIEW-RATINGS", "C-HOTEL-SEARCH", "C-BOOKING-TXN"],
      addedVersion: "0.2.0",
    },
  ];

  const validEdges: EcosystemEdge[] = [
    {
      id: "E__METASEARCH_GOOGLE_FLIGHTS__OTA_BOOKING_COM__AGGREGATES",
      fromId: "METASEARCH_GOOGLE_FLIGHTS",
      toId: "OTA_BOOKING_COM",
      type: "AGGREGATES",
      addedVersion: "0.2.0",
    },
    {
      id: "E__REVIEW_PLATFORM_TRIPADVISOR__OTA_BOOKING_COM__FEEDS_INTO",
      fromId: "REVIEW_PLATFORM_TRIPADVISOR",
      toId: "OTA_BOOKING_COM",
      type: "FEEDS_INTO",
      addedVersion: "0.2.0",
    },
  ];

  return { nodes: validNodes, edges: validEdges };
}

interface ViolationFixture {
  label: string;
  nodes: EcosystemNode[];
  edges: EcosystemEdge[];
  expectedCheck: string;
}

function getViolationFixtures(): ViolationFixture[] {
  // Base valid nodes used by violation fixtures
  const baseNodes: EcosystemNode[] = [
    {
      id: "OTA_BOOKING_COM",
      name: "Booking.com",
      providerType: "OTA",
      description: "Global OTA.",
      journeyStages: ["J1", "J3"],
      capabilities: ["C-HOTEL-SEARCH", "C-BOOKING-TXN"],
      addedVersion: "0.2.0",
    },
    {
      id: "METASEARCH_GOOGLE_FLIGHTS",
      name: "Google Flights",
      providerType: "METASEARCH",
      description: "Flight metasearch.",
      journeyStages: ["J1", "J3"],
      capabilities: ["C-FLIGHT-SEARCH", "C-PRICE-COMPARE"],
      addedVersion: "0.2.0",
    },
  ];

  return [
    {
      label: "SV-01: Invalid node — bad providerType enum",
      nodes: [
        {
          id: "FAKE_TYPE_FOO",
          name: "Bad Node",
          providerType: "FAKE_TYPE",
          description: "Node with invalid provider type.",
          journeyStages: ["J1"],
          capabilities: ["C-HOTEL-SEARCH"],
          addedVersion: "0.2.0",
        },
      ],
      edges: [],
      expectedCheck: "SV-01",
    },
    {
      label: "SV-02: Invalid edge — bad relationship type enum",
      nodes: [...baseNodes],
      edges: [
        {
          id: "E__OTA_BOOKING_COM__METASEARCH_GOOGLE_FLIGHTS__INVALID_TYPE",
          fromId: "OTA_BOOKING_COM",
          toId: "METASEARCH_GOOGLE_FLIGHTS",
          type: "INVALID_TYPE",
          addedVersion: "0.2.0",
        },
      ],
      expectedCheck: "SV-02",
    },
    {
      label: "RI-01: Orphan edge — fromId does not exist",
      nodes: [...baseNodes],
      edges: [
        {
          id: "E__NONEXISTENT_NODE__OTA_BOOKING_COM__FEEDS_INTO",
          fromId: "NONEXISTENT_NODE",
          toId: "OTA_BOOKING_COM",
          type: "FEEDS_INTO",
          addedVersion: "0.2.0",
        },
      ],
      expectedCheck: "RI-01",
    },
    {
      label: "RI-02: Orphan edge — toId does not exist",
      nodes: [...baseNodes],
      edges: [
        {
          id: "E__OTA_BOOKING_COM__NONEXISTENT_NODE__FEEDS_INTO",
          fromId: "OTA_BOOKING_COM",
          toId: "NONEXISTENT_NODE",
          type: "FEEDS_INTO",
          addedVersion: "0.2.0",
        },
      ],
      expectedCheck: "RI-02",
    },
    {
      label: "RI-03: Self-edge",
      nodes: [...baseNodes],
      edges: [
        {
          id: "E__OTA_BOOKING_COM__OTA_BOOKING_COM__INTEGRATES_WITH",
          fromId: "OTA_BOOKING_COM",
          toId: "OTA_BOOKING_COM",
          type: "INTEGRATES_WITH",
          addedVersion: "0.2.0",
        },
      ],
      expectedCheck: "RI-03",
    },
    {
      label: "UQ-01: Duplicate node IDs",
      nodes: [
        {
          id: "OTA_BOOKING_COM",
          name: "Booking.com",
          providerType: "OTA",
          description: "First instance.",
          journeyStages: ["J1"],
          capabilities: ["C-HOTEL-SEARCH"],
          addedVersion: "0.2.0",
        },
        {
          id: "OTA_BOOKING_COM",
          name: "Booking.com Duplicate",
          providerType: "OTA",
          description: "Second instance — duplicate.",
          journeyStages: ["J1"],
          capabilities: ["C-HOTEL-SEARCH"],
          addedVersion: "0.2.0",
        },
      ],
      edges: [],
      expectedCheck: "UQ-01",
    },
    {
      label: "UQ-02: Duplicate edges (same from/to/type triple)",
      nodes: [...baseNodes],
      edges: [
        {
          id: "E__OTA_BOOKING_COM__METASEARCH_GOOGLE_FLIGHTS__COMPETES_WITH",
          fromId: "OTA_BOOKING_COM",
          toId: "METASEARCH_GOOGLE_FLIGHTS",
          type: "COMPETES_WITH",
          addedVersion: "0.2.0",
        },
        {
          id: "E__OTA_BOOKING_COM__METASEARCH_GOOGLE_FLIGHTS__COMPETES_WITH",
          fromId: "OTA_BOOKING_COM",
          toId: "METASEARCH_GOOGLE_FLIGHTS",
          type: "COMPETES_WITH",
          addedVersion: "0.2.0",
        },
      ],
      expectedCheck: "UQ-02",
    },
    {
      label: "ID-01: Edge ID does not match computed E__{from}__{to}__{type}",
      nodes: [...baseNodes],
      edges: [
        {
          id: "E__WRONG_ID__FORMAT__AGGREGATES",
          fromId: "OTA_BOOKING_COM",
          toId: "METASEARCH_GOOGLE_FLIGHTS",
          type: "AGGREGATES",
          addedVersion: "0.2.0",
        },
      ],
      expectedCheck: "ID-01",
    },
    {
      label: "BR-01: SUPER_APP with <4 journey stages and <3 capabilities",
      nodes: [
        {
          id: "SUPER_APP_FAKE",
          name: "Fake Super App",
          providerType: "SUPER_APP",
          description: "Super app that does not meet guardrail thresholds.",
          journeyStages: ["J1", "J2"],
          capabilities: ["C-HOTEL-SEARCH", "C-FLIGHT-SEARCH"],
          addedVersion: "0.2.0",
        },
      ],
      edges: [],
      expectedCheck: "BR-01",
    },
  ];
}

// ---------------------------------------------------------------------------
// Core Validation
// ---------------------------------------------------------------------------

function validate(nodes: EcosystemNode[], edges: EcosystemEdge[]): ValidationReport {
  const errors: ValidationError[] = [];

  // Load schemas
  const nodeSchema = loadJson(PATHS.nodeSchema);
  const edgeSchema = loadJson(PATHS.edgeSchema);

  // Set up ajv
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const validateNode = ajv.compile(nodeSchema);
  const validateEdge = ajv.compile(edgeSchema);

  // ---- SV-01: Validate nodes against schema ----
  for (const node of nodes) {
    if (!validateNode(node)) {
      for (const err of validateNode.errors ?? []) {
        errors.push({
          check: "SV-01",
          id: node.id ?? "(unknown)",
          message: `Schema: ${err.instancePath} ${err.message}`,
        });
      }
    }
  }

  // ---- SV-02: Validate edges against schema ----
  for (const edge of edges) {
    if (!validateEdge(edge)) {
      for (const err of validateEdge.errors ?? []) {
        errors.push({
          check: "SV-02",
          id: edge.id ?? "(unknown)",
          message: `Schema: ${err.instancePath} ${err.message}`,
        });
      }
    }
  }

  // ---- UQ-01: Duplicate node IDs ----
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      errors.push({
        check: "UQ-01",
        id: node.id,
        message: `Duplicate node ID '${node.id}'`,
      });
    }
    nodeIds.add(node.id);
  }

  // ---- RI-01 / RI-02: Referential integrity ----
  for (const edge of edges) {
    if (!nodeIds.has(edge.fromId)) {
      errors.push({
        check: "RI-01",
        id: edge.id,
        message: `Edge fromId '${edge.fromId}' does not resolve to any node`,
      });
    }
    if (!nodeIds.has(edge.toId)) {
      errors.push({
        check: "RI-02",
        id: edge.id,
        message: `Edge toId '${edge.toId}' does not resolve to any node`,
      });
    }
  }

  // ---- RI-03: No self-edges ----
  for (const edge of edges) {
    if (edge.fromId === edge.toId) {
      errors.push({
        check: "RI-03",
        id: edge.id,
        message: `Self-edge: fromId and toId are both '${edge.fromId}'`,
      });
    }
  }

  // ---- UQ-02: Duplicate edges (same from/to/type triple) ----
  const edgeTriples = new Set<string>();
  for (const edge of edges) {
    const triple = `${edge.fromId}|${edge.toId}|${edge.type}`;
    if (edgeTriples.has(triple)) {
      errors.push({
        check: "UQ-02",
        id: edge.id,
        message: `Duplicate edge: (${edge.fromId}, ${edge.toId}, ${edge.type}) already exists`,
      });
    }
    edgeTriples.add(triple);
  }

  // ---- ID-01: Edge ID consistency ----
  for (const edge of edges) {
    const expectedId = `E__${edge.fromId}__${edge.toId}__${edge.type}`;
    if (edge.id !== expectedId) {
      errors.push({
        check: "ID-01",
        id: edge.id,
        message: `Edge ID mismatch: expected '${expectedId}', got '${edge.id}'`,
      });
    }
  }

  // ---- BR-01: SUPER_APP guardrail ----
  for (const node of nodes) {
    if (node.providerType === "SUPER_APP") {
      const stageCount = node.journeyStages?.length ?? 0;
      const capCount = node.capabilities?.length ?? 0;
      if (stageCount < 4 || capCount < 3) {
        errors.push({
          check: "BR-01",
          id: node.id,
          message: `SUPER_APP guardrail: requires ≥4 journeyStages (got ${stageCount}) and ≥3 capabilities (got ${capCount})`,
        });
      }
    }
  }

  // Sort errors deterministically
  errors.sort((a, b) => a.check.localeCompare(b.check) || a.id.localeCompare(b.id));

  return {
    timestamp: new Date().toISOString(),
    valid: errors.length === 0,
    summary: {
      nodesChecked: nodes.length,
      edgesChecked: edges.length,
      errorsFound: errors.length,
    },
    errors,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const runFixtures = args.includes("--fixtures");

  try {
    if (runFixtures) {
      // ---- Run test fixtures ----
      console.log("=== VALID FIXTURES ===\n");

      const { nodes, edges } = getTestFixtures();
      const validReport = validate(nodes, edges);
      console.log(JSON.stringify(validReport, null, 2));

      if (!validReport.valid) {
        console.error("\nFAIL: Valid fixtures produced errors");
        process.exit(1);
      }
      console.log("\nPASS: Valid fixtures accepted\n");

      console.log("=== VIOLATION FIXTURES ===\n");

      const violations = getViolationFixtures();
      let allCaught = true;

      for (const fixture of violations) {
        const report = validate(fixture.nodes, fixture.edges);
        const caught = report.errors.some((e) => e.check === fixture.expectedCheck);

        if (caught) {
          console.log(`PASS: ${fixture.label}`);
        } else {
          console.error(`FAIL: ${fixture.label} — expected check ${fixture.expectedCheck} not found`);
          console.error(`  Errors found: ${JSON.stringify(report.errors)}`);
          allCaught = false;
        }
      }

      console.log(
        `\n${violations.length} violation fixtures: ${allCaught ? "ALL PASSED" : "SOME FAILED"}`
      );

      if (!allCaught) process.exit(1);

      // ---- Determinism check ----
      console.log("\n=== DETERMINISM CHECK ===\n");
      const report1 = validate(nodes, edges);
      const report2 = validate(nodes, edges);
      // Compare everything except timestamp (which changes per call)
      const strip = (r: ValidationReport) => ({ ...r, timestamp: "" });
      const run1 = JSON.stringify(strip(report1));
      const run2 = JSON.stringify(strip(report2));
      if (run1 === run2) {
        console.log("PASS: Output is deterministic (two runs identical, excluding timestamp)");
      } else {
        console.error("FAIL: Output differs between runs");
        process.exit(1);
      }
    } else {
      // ---- Normal mode: validate data files ----
      const nodes = loadJsonl<EcosystemNode>(PATHS.nodes);
      const edges = loadJsonl<EcosystemEdge>(PATHS.edges);

      const report = validate(nodes, edges);

      // Deterministic output: replace timestamp for reproducibility
      const output = JSON.stringify(report, null, 2);
      console.log(output);

      process.exit(report.valid ? 0 : 1);
    }
  } catch (err) {
    console.error("Runtime error:", err);
    process.exit(2);
  }
}

main();
