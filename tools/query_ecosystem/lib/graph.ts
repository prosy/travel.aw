/**
 * Graph loading and traversal utilities.
 *
 * Loads JSONL data (same pattern as validator), builds adjacency maps,
 * and provides BFS for path queries. All iteration is deterministic
 * via explicit sorting.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { EcosystemNode, EcosystemEdge, BfsPath, PathStep } from "./types.js";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "../../..");

export const PATHS = {
  nodes: resolve(ROOT, "data/ecosystem/nodes.jsonl"),
  edges: resolve(ROOT, "data/ecosystem/edges.jsonl"),
};

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

function loadJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, "utf-8").trim();
  if (content === "") return [];
  return content.split("\n").map((line) => JSON.parse(line) as T);
}

export function loadGraph(): {
  nodes: EcosystemNode[];
  edges: EcosystemEdge[];
  nodeMap: Map<string, EcosystemNode>;
  outgoing: Map<string, EcosystemEdge[]>;
  incoming: Map<string, EcosystemEdge[]>;
} {
  const nodes = loadJsonl<EcosystemNode>(PATHS.nodes).sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  const edges = loadJsonl<EcosystemEdge>(PATHS.edges).sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  const nodeMap = new Map<string, EcosystemNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const outgoing = new Map<string, EcosystemEdge[]>();
  const incoming = new Map<string, EcosystemEdge[]>();

  for (const id of nodeMap.keys()) {
    outgoing.set(id, []);
    incoming.set(id, []);
  }

  for (const e of edges) {
    outgoing.get(e.fromId)?.push(e);
    incoming.get(e.toId)?.push(e);
  }

  return { nodes, edges, nodeMap, outgoing, incoming };
}

// ---------------------------------------------------------------------------
// Secondary indexes
// ---------------------------------------------------------------------------

export function nodesByCapability(
  nodes: EcosystemNode[]
): Map<string, EcosystemNode[]> {
  const index = new Map<string, EcosystemNode[]>();
  for (const n of nodes) {
    for (const cap of n.capabilities) {
      let list = index.get(cap);
      if (!list) {
        list = [];
        index.set(cap, list);
      }
      list.push(n);
    }
  }
  return index;
}

export function nodesByStage(
  nodes: EcosystemNode[]
): Map<string, EcosystemNode[]> {
  const index = new Map<string, EcosystemNode[]>();
  for (const n of nodes) {
    for (const stage of n.journeyStages) {
      let list = index.get(stage);
      if (!list) {
        list = [];
        index.set(stage, list);
      }
      list.push(n);
    }
  }
  return index;
}

export function nodesByProviderType(
  nodes: EcosystemNode[]
): Map<string, EcosystemNode[]> {
  const index = new Map<string, EcosystemNode[]>();
  for (const n of nodes) {
    let list = index.get(n.providerType);
    if (!list) {
      list = [];
      index.set(n.providerType, list);
    }
    list.push(n);
  }
  return index;
}

// ---------------------------------------------------------------------------
// BFS — directed path search
// ---------------------------------------------------------------------------

const BFS_EDGE_TYPES = new Set(["FEEDS_INTO", "AGGREGATES", "INTEGRATES_WITH"]);

export function bfsPaths(
  startIds: string[],
  isTarget: (node: EcosystemNode) => boolean,
  outgoing: Map<string, EcosystemEdge[]>,
  nodeMap: Map<string, EcosystemNode>,
  maxDepth: number,
  maxPaths: number
): BfsPath[] {
  const paths: BfsPath[] = [];

  // Sort start IDs for determinism
  const sortedStarts = [...startIds].sort();

  for (const startId of sortedStarts) {
    if (paths.length >= maxPaths) break;

    // BFS queue: each entry is [currentNodeId, pathSoFar]
    const queue: Array<[string, PathStep[]]> = [[startId, []]];
    const visited = new Set<string>([startId]);

    while (queue.length > 0 && paths.length < maxPaths) {
      const [currentId, currentPath] = queue.shift()!;

      if (currentPath.length > maxDepth) continue;

      // Check if current node is a target (but not the start)
      if (currentPath.length > 0) {
        const currentNode = nodeMap.get(currentId);
        if (currentNode && isTarget(currentNode)) {
          paths.push({
            from: startId,
            to: currentId,
            depth: currentPath.length,
            steps: currentPath,
          });
          // Don't continue from targets — we found a path
          continue;
        }
      }

      if (currentPath.length >= maxDepth) continue;

      // Explore neighbors — sorted for determinism
      const edges = outgoing.get(currentId) ?? [];
      const sortedEdges = [...edges].sort((a, b) => a.id.localeCompare(b.id));

      for (const edge of sortedEdges) {
        if (!BFS_EDGE_TYPES.has(edge.type)) continue;
        if (visited.has(edge.toId)) continue;

        visited.add(edge.toId);
        queue.push([
          edge.toId,
          [
            ...currentPath,
            { nodeId: edge.toId, edgeId: edge.id, edgeType: edge.type },
          ],
        ]);
      }
    }
  }

  return paths;
}
