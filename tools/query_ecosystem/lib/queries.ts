/**
 * TRAVEL.aw Query Cookbook — Q1–Q5 implementations.
 *
 * Each query is a pure function over the graph data. All results are
 * sorted by ID for determinism. See QUERY_COOKBOOK.md (A16) for definitions.
 */

import type {
  EcosystemNode,
  EcosystemEdge,
  QueryResult,
  BfsPath,
} from "./types.js";
import {
  loadGraph,
  nodesByCapability,
  nodesByStage,
  nodesByProviderType,
  bfsPaths,
} from "./graph.js";

// ---------------------------------------------------------------------------
// Graph (loaded once, shared across queries)
// ---------------------------------------------------------------------------

let _graph: ReturnType<typeof loadGraph> | null = null;

function graph() {
  if (!_graph) _graph = loadGraph();
  return _graph;
}

// ---------------------------------------------------------------------------
// Q1: Cross-Stage Influence (J0 → J3)
// ---------------------------------------------------------------------------

interface Q1Result {
  nodeId: string;
  name: string;
  providerType: string;
  journeyStages: string[];
  capabilities: string[];
}

export function q1CrossStageInfluence(): QueryResult<Q1Result[]> {
  const { nodes } = graph();

  const results: Q1Result[] = nodes
    .filter(
      (n) => n.journeyStages.includes("J0") && n.journeyStages.includes("J3")
    )
    .map((n) => ({
      nodeId: n.id,
      name: n.name,
      providerType: n.providerType,
      journeyStages: n.journeyStages,
      capabilities: n.capabilities,
    }));

  return {
    queryId: "Q1",
    title: "Cross-Stage Influence (J0 → J3)",
    timestamp: new Date().toISOString(),
    resultCount: results.length,
    results,
  };
}

// ---------------------------------------------------------------------------
// Q2: Social Inspiration → Booking Paths
// ---------------------------------------------------------------------------

export function q2SocialToBookingPaths(): QueryResult<BfsPath[]> {
  const { nodes, outgoing, nodeMap } = graph();

  const capIndex = nodesByCapability(nodes);
  const startNodes = capIndex.get("C-SOCIAL-INSPIRATION") ?? [];
  const startIds = startNodes.map((n) => n.id);

  const results = bfsPaths(
    startIds,
    (n) => n.capabilities.includes("C-BOOKING-TXN"),
    outgoing,
    nodeMap,
    4,
    50
  );

  return {
    queryId: "Q2",
    title: "Social Inspiration → Booking Paths",
    timestamp: new Date().toISOString(),
    resultCount: results.length,
    results,
  };
}

// ---------------------------------------------------------------------------
// Q3: Local Event Discovery In-Trip
// ---------------------------------------------------------------------------

interface Q3Result {
  nodeId: string;
  name: string;
  providerType: string;
  journeyStages: string[];
  capabilities: string[];
}

export function q3LocalEventDiscovery(): QueryResult<Q3Result[]> {
  const { nodes } = graph();

  const results: Q3Result[] = nodes
    .filter(
      (n) =>
        n.journeyStages.includes("J6") &&
        n.capabilities.includes("C-EVENT-DISCOVERY")
    )
    .map((n) => ({
      nodeId: n.id,
      name: n.name,
      providerType: n.providerType,
      journeyStages: n.journeyStages,
      capabilities: n.capabilities,
    }));

  return {
    queryId: "Q3",
    title: "Local Event Discovery In-Trip",
    timestamp: new Date().toISOString(),
    resultCount: results.length,
    results,
  };
}

// ---------------------------------------------------------------------------
// Q4: Itinerary Manager Integrations
// ---------------------------------------------------------------------------

interface Q4Neighbor {
  nodeId: string;
  name: string;
  providerType: string;
  edgeType: string;
  direction: "outgoing" | "incoming";
}

interface Q4ManagerResult {
  nodeId: string;
  name: string;
  neighbors: Q4Neighbor[];
  neighborsByCategory: Record<string, string[]>;
}

const Q4_CATEGORIES: Record<string, (n: EcosystemNode) => boolean> = {
  emailParsing: (n) => n.capabilities.includes("C-EMAIL-PARSING"),
  ota: (n) => n.providerType === "OTA",
  airline: (n) =>
    n.providerType === "DIRECT_SUPPLIER" &&
    (n.capabilities.includes("C-FLIGHT-SEARCH") ||
      n.capabilities.includes("C-TICKETING")),
  calendar: (n) => n.capabilities.includes("C-CALENDAR-SYNC"),
  mapping: (n) => n.providerType === "MAPPING_SERVICE",
  metasearch: (n) => n.providerType === "METASEARCH",
};

export function q4ItineraryIntegrations(): QueryResult<Q4ManagerResult[]> {
  const { nodes, outgoing, incoming, nodeMap } = graph();

  const ptIndex = nodesByProviderType(nodes);
  const managers = ptIndex.get("ITINERARY_MANAGER") ?? [];

  const results: Q4ManagerResult[] = managers.map((mgr) => {
    const allEdges: Array<{ edge: EcosystemEdge; direction: "outgoing" | "incoming" }> = [];

    for (const e of outgoing.get(mgr.id) ?? []) {
      allEdges.push({ edge: e, direction: "outgoing" });
    }
    for (const e of incoming.get(mgr.id) ?? []) {
      allEdges.push({ edge: e, direction: "incoming" });
    }

    // Sort edges for determinism
    allEdges.sort((a, b) => a.edge.id.localeCompare(b.edge.id));

    const neighbors: Q4Neighbor[] = [];
    const seen = new Set<string>();

    for (const { edge, direction } of allEdges) {
      const neighborId = direction === "outgoing" ? edge.toId : edge.fromId;
      const key = `${neighborId}|${edge.type}|${direction}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const neighbor = nodeMap.get(neighborId);
      if (!neighbor) continue;

      neighbors.push({
        nodeId: neighborId,
        name: neighbor.name,
        providerType: neighbor.providerType,
        edgeType: edge.type,
        direction,
      });
    }

    // Categorize neighbors
    const neighborsByCategory: Record<string, string[]> = {};
    for (const [cat, predicate] of Object.entries(Q4_CATEGORIES)) {
      const matching = neighbors
        .map((nb) => nb.nodeId)
        .filter((id) => {
          const n = nodeMap.get(id);
          return n ? predicate(n) : false;
        })
        .sort();
      // Deduplicate
      const unique = [...new Set(matching)];
      if (unique.length > 0) {
        neighborsByCategory[cat] = unique;
      }
    }

    return {
      nodeId: mgr.id,
      name: mgr.name,
      neighbors,
      neighborsByCategory,
    };
  });

  return {
    queryId: "Q4",
    title: "Itinerary Manager Integrations",
    timestamp: new Date().toISOString(),
    resultCount: results.length,
    results,
  };
}

// ---------------------------------------------------------------------------
// Q5: Nearby Now vs Upcoming
// ---------------------------------------------------------------------------

interface Q5Result {
  nearbyNow: string[];
  upcoming: string[];
  both: string[];
}

export function q5NearbyVsUpcoming(): QueryResult<Q5Result> {
  const { nodes } = graph();

  const j6Nodes = nodes.filter((n) => n.journeyStages.includes("J6"));

  const nearbyNow: string[] = [];
  const upcoming: string[] = [];

  for (const n of j6Nodes) {
    const isNearby =
      n.capabilities.includes("C-LOCAL-DISCOVERY") ||
      n.capabilities.includes("C-MAPPING-NAV");
    const isUpcoming = n.capabilities.includes("C-EVENT-DISCOVERY");

    if (isNearby) nearbyNow.push(n.id);
    if (isUpcoming) upcoming.push(n.id);
  }

  nearbyNow.sort();
  upcoming.sort();

  const nearbySet = new Set(nearbyNow);
  const both = upcoming.filter((id) => nearbySet.has(id)).sort();

  return {
    queryId: "Q5",
    title: "Nearby Now vs Upcoming",
    timestamp: new Date().toISOString(),
    resultCount: nearbyNow.length + upcoming.length,
    results: { nearbyNow, upcoming, both },
  };
}
