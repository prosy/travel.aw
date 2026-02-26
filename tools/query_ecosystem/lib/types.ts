/**
 * Shared types for the TRAVEL.aw Query Cookbook.
 *
 * Node/Edge interfaces match schemas A9/A10.
 */

export interface EcosystemNode {
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

export interface EcosystemEdge {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  addedVersion: string;
  description?: string;
  journeyContext?: string[];
  notes?: string;
}

export interface QueryResult<T> {
  queryId: string;
  title: string;
  timestamp: string;
  resultCount: number;
  results: T;
}

export interface CookbookReport {
  timestamp: string;
  queries: QueryResult<unknown>[];
}

// Q2-specific types
export interface PathStep {
  nodeId: string;
  edgeId: string;
  edgeType: string;
}

export interface BfsPath {
  from: string;
  to: string;
  depth: number;
  steps: PathStep[];
}
